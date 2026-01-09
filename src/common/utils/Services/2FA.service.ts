import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import * as QrCode from 'qrcode';
import { redis } from './redis';
import { compare_hash, Crypto, generateHash } from '../Encryption';
@Injectable()
export class TwoFA_services {
  crypto = new Crypto();
  generateSecret = async (email: string) => {
    const secret = authenticator.generateSecret();
    redis.set(`${email}_secret`, this.crypto.encryption(secret), 'EX', 60 * 5);
    const otpauth = authenticator.keyuri(email, 'E-commerce', secret);
    const qr = await QrCode.toDataURL(otpauth);
    return {
      qr,
      secret,
    };
  };
  verifyCode = (code: string, secret: string) => {
    return authenticator.verify({
      token: code,
      secret: secret,
    });
  };
  generateBackupCodes = async () => {
    const backupCodes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = authenticator.generateSecret().slice(0, 8);
      backupCodes.push(code);
    }
    const hashedCodes = await Promise.all(
      backupCodes.map((c) => generateHash(c)),
    );
    return { backupCodes, hashedCodes };
  };
  validateBackupCodes = async (code: string, hashedCodes: string[]) => {
    if (!hashedCodes?.length) return { auth: false };
    for (const HashedCode of hashedCodes) {
      if (await compare_hash(code, HashedCode)) {
        const newHashedCodes = hashedCodes.filter((val) => val !== HashedCode);
        return { auth: true, newHashedCodes };
      }
    }
    return { auth: false };
  };
}
