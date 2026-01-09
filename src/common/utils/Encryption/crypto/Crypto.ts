import { Injectable } from '@nestjs/common';
import crypto from 'crypto';

@Injectable()
export class Crypto {
 encryption = (data: string): string => {
    const buffer = Buffer.from(data);
    const encrypted = crypto.publicEncrypt(
      {
        key: process.env.PUBLICKEY as string,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      buffer,
    );
    return encrypted.toString('hex');
  };
  decryption = (dataencrypted: string): string => {
      const buffer = Buffer.from(dataencrypted, 'hex');
      const decrypted = crypto.privateDecrypt({
          key: process.env.PRIVATEKEY as string,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },buffer)
      
      return decrypted.toString('utf-8');
  }
}