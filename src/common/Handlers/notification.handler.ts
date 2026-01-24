export const notificationHandler = (type: string, data: any) => {
  let title = '';
  let content = '';

  switch (type) {
    case 'order_created':
      title = 'تم إنشاء الطلب 🛒';
      content = `تم إنشاء طلبك رقم ${data.orderId} بنجاح`;
      break;

    case 'order_cancelled':
      title = 'تم إلغاء الطلب ❌';
      content = `تم إلغاء الطلب رقم ${data.orderId}`;
      break;

    case 'order_paid':
      title = 'تم الدفع بنجاح 💳';
      content = `تم الدفع بنجاح للطلب رقم ${data.orderId}`;
      break;

    default:
      title = 'إشعار جديد';
      content = 'لديك إشعار جديد بخصوص طلبك';
      break;
  }

  return { title, content };
};
