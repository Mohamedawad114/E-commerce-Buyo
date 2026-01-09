import * as nodemailer from 'nodemailer';
import { customAlphabet } from 'nanoid';
import { redis } from './redis';
import { generateHash } from '../Encryption';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
const createOTP = customAlphabet(`0123456789zxcvbnmalksjdhfgqwretruop`, 6);
@Injectable()
export class EmailServices {
  private readonly transporter: nodemailer.Transporter;
  constructor(private readonly logger: PinoLogger) {
    this.transporter = nodemailer.createTransport({
      service: `gmail`,
      auth: {
        pass: process.env.APP_PASSWORD as string,
        user: process.env.APP_GMAIL as string,
      },
      secure: true,
    });
  }

  async sendEmail({ to, subject, html }) {
    try {
      const Info = await this.transporter.sendMail({
        to: to,
        from: process.env.APP_GMAIL as string,
        subject: subject,
        html: html,
      });
      this.logger.info(Info.response);
    } catch (err: any) {
      this.logger.info(err);
    }
  }

  createAndSendOTP = async (email: string) => {
    const OTP = createOTP();
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f2f2f2;">
          <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="color: #333;">مرحبا بك!</h2>
            <p>شكراً لتسجيلك. الكود الخاص بك لتأكيد الحساب هو:</p>
            <h2 style="color: #191a1bff; text-align: center;">${OTP}</h2>
            <p>من فضلك أدخل هذا الكود في التطبيق لتفعيل حسابك.</p>
            <hr />
            <p style="font-size: 12px; color: #888;">إذا لم تطلب هذا الكود، تجاهل هذه الرسالة.</p>
          </div>
        </div>
      `;
    const hashOTP = await generateHash(OTP);
    await redis.set(`otp_${email}`, hashOTP, 'EX', 2 * 60);
    await this.sendEmail({
      to: email,
      subject: 'confirmation Email',
      html: html,
    });
  };
  createAndSendOTP_password = async (email: string) => {
    const OTP = createOTP();
    const resetHtml = `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
  <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #333;">طلب إعادة تعيين كلمة المرور</h2>
    <p style="font-size: 16px; color: #555;">لقد تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بك. من فضلك استخدم رمز التحقق (OTP) أدناه لإتمام العملية:</p>
    <div style="margin: 20px 0; padding: 20px; background-color: #f1f5ff; border-radius: 8px; text-align: center;">
      <h1 style="font-size: 36px; letter-spacing: 4px; color: #007BFF;">${OTP}</h1>
    </div>
    <p style="font-size: 14px; color: #777;">الرمز صالح لفترة محدودة فقط. إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان.</p>
    <hr style="margin-top: 30px;" />
    <p style="font-size: 12px; color: #999;">© 2025 Notes. جميع الحقوق محفوظة.</p> 
  </div>
</div>`;
    const hashOTP = await generateHash(OTP);
    await redis.set(`otp_reset:${email}`, hashOTP, 'EX', 2 * 60);
    await this.sendEmail({
      to: email,
      subject: 'reset password',
      html: resetHtml,
    });
  };
  bannedUser_email = async (email: string) => {
    const bannedHtml = `
<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
  <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #d9534f;">تم حظر حسابك</h2>
    <p style="font-size: 16px; color: #555;">
      نود إعلامك بأنه قد تم <strong style="color:#d9534f;">حظر حسابك</strong> مؤقتًا بسبب مخالفة سياسات الاستخدام.
    </p>
    <p style="font-size: 16px; color: #555;">
      إذا كنت تعتقد أن هذا الإجراء تم عن طريق الخطأ، يرجى التواصل مع فريق الدعم للمراجعة والمساعدة.
    </p>
    <div style="margin: 20px 0; padding: 20px; background-color: #fff3cd; border-radius: 8px; text-align: center; border: 1px solid #ffeeba;">
      <h3 style="color: #856404; margin: 0;">📩 تواصل معنا عبر البريد:</h3>
      <p style="font-size: 18px; color: #333; margin: 5px 0 0 0;">
        <a href="mailto:support@notes.com" style="color: #007BFF; text-decoration: none;">support@notes.com</a>
      </p>
    </div>
    <p style="font-size: 14px; color: #777;">
      نشكرك على تفهمك. فريق <strong>Notes</strong>.
    </p>
    <hr style="margin-top: 30px;" />
    <p style="font-size: 12px; color: #999;">© 2025 Notes. جميع الحقوق محفوظة.</p>
  </div>
</div>
`;
    await this.sendEmail({
      to: email,
      subject: 'تم حظر حسابك',
      html: bannedHtml,
    });
  };

  orderPaid_email = async (
    email: string,
    orderId: string,
    paymentId: string,
    amount: number,
  ) => {
    const paidHtml = `
<div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; text-align: right;">
  <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #28a745; text-align: center;">✅ تم تأكيد الدفع</h2>
    
    <p style="font-size: 16px; color: #555;">
      نشكرك على إتمام عملية الدفع بنجاح. طلبك رقم <strong>#${orderId}</strong> قيد المعالجة الآن.
    </p>

    <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border: 1px solid #eee;">
      <h4 style="margin-top: 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">تفاصيل العملية:</h4>
      <p style="margin: 5px 0; font-size: 14px;"><strong>رقم عملية الدفع:</strong> <span style="color: #007bff;">${paymentId}</span></p>
      <p style="margin: 5px 0; font-size: 14px;"><strong>المبلغ المدفوع:</strong> <span style="color: #28a745; font-weight: bold;">${amount} ج.م</span></p>
    </div>

    <div style="margin: 20px 0; padding: 20px; background-color: #e9f7ef; border-radius: 8px; text-align: center; border: 1px solid #c3e6cb;">
      <h3 style="color: #155724; margin: 0;">📦 جاري تجهيز طلبك للشحن</h3>
      <p style="font-size: 15px; color: #333; margin: 5px 0 0 0;">
        سنتواصل معك عند شحن الطلب فوراً.
      </p>
    </div>

    <p style="font-size: 14px; color: #777;">
      شكراً لاختيارك <strong>Notes</strong>. نتمنى لك تجربة تسوق رائعة.
    </p>
    
    <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
    <p style="font-size: 12px; color: #999; text-align: center;">© 2025 Notes. جميع الحقوق محفوظة.</p>
  </div>
</div>`;

    await this.sendEmail({
      to: email,
      subject: `✅ تم الدفع بنجاح - طلب رقم #${orderId}`,
      html: paidHtml,
    });
  };
  orderCancel_email = async (
    email: string,
    orderId: string,
    paymentId: string,
    amount: number,
  ) => {
    const cancelHtml = `
<div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #fcfcfc; text-align: right;">
  <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); border-top: 5px solid #dc3545;">
    <h2 style="color: #dc3545; text-align: center;">⚠️ تم إلغاء الطلب وإرجاع المبلغ</h2>
    
    <p style="font-size: 16px; color: #555;">
      مرحباً، تم إلغاء طلبك رقم <strong>#${orderId}</strong> بناءً على طلبك أو لعدم توفر الشروط.
    </p>

    <div style="margin: 20px 0; padding: 15px; background-color: #fff5f5; border-radius: 8px; border: 1px solid #feb2b2;">
      <h4 style="margin-top: 0; color: #c53030; border-bottom: 1px solid #feb2b2; padding-bottom: 5px;">تفاصيل عملية الاسترداد (Refund):</h4>
      <p style="margin: 5px 0; font-size: 14px;"><strong>رقم عملية الدفع الأصلية:</strong> <span style="color: #333;">${paymentId}</span></p>
      <p style="margin: 5px 0; font-size: 14px;"><strong>المبلغ المسترد:</strong> <span style="color: #dc3545; font-weight: bold;">${amount} ج.م</span></p>
      <p style="margin: 10px 0 0 0; font-size: 13px; color: #666; font-style: italic;">
        * ملاحظة: قد يستغرق ظهور المبلغ في حسابك البنكي من 5 إلى 14 يوم عمل حسب سياسة البنك التابع له.
      </p>
    </div>

    <div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px; text-align: center; border: 1px solid #eee;">
      <p style="font-size: 15px; color: #333; margin: 0;">
        نتمنى أن نراك مجدداً في <strong>Notes</strong> قريباً.
      </p>
    </div>

    <p style="font-size: 14px; color: #777;">
      إذا كان لديك أي استفسار، يرجى الرد على هذا الإيميل مباشرة.
    </p>
    
    <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
    <p style="font-size: 12px; color: #999; text-align: center;">© 2025 Notes. جميع الحقوق محفوظة.</p>
  </div>
</div>`;

    await this.sendEmail({
      to: email,
      subject: `❌ تم إلغاء الطلب رقم #${orderId} - وجاري استرداد المبلغ`,
      html: cancelHtml,
    });
  };
  orderExpired_email = async (email: string, orderId: string) => {
    const expiredHtml = `
<div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; text-align: right;">
  <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border-top: 5px solid #6c757d;">
    <h2 style="color: #444; text-align: center;">⏰ انتهت مهلة السداد</h2>
    
    <p style="font-size: 16px; color: #555; line-height: 1.6;">
      مرحباً، نود إعلامك بأنه تم إلغاء طلبك رقم <strong>#${orderId}</strong> تلقائياً.
    </p>

    <div style="margin: 20px 0; padding: 20px; background-color: #fff3cd; border-radius: 8px; border: 1px solid #ffeeba; text-align: center;">
      <p style="font-size: 15px; color: #856404; margin: 0;">
        لقد تجاوز الطلب مهلة الدفع المحددة (3 أيام)، ولذلك تم تحرير المنتجات وإعادتها للمخزون.
      </p>
    </div>

    <p style="font-size: 15px; color: #333;">
      إذا كنت لا تزال ترغب في شراء هذه المنتجات، يمكنك العودة لمتجرنا وعمل طلب جديد بكل سهولة.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://yourwebsite.com/shop" style="background-color: #333; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">تسوق الآن من جديد</a>
    </div>

    <p style="font-size: 13px; color: #999;">
      * ملاحظة: هذا الإجراء يتم تلقائياً لضمان توفر المنتجات لجميع عملائنا.
    </p>
    
    <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
    <p style="font-size: 12px; color: #999; text-align: center;">© 2025 Notes. جميع الحقوق محفوظة.</p>
  </div>
</div>`;

    await this.sendEmail({
      to: email,
      subject: `⏰ انتهت مهلة دفع الطلب رقم #${orderId}`,
      html: expiredHtml,
    });
  };
}
