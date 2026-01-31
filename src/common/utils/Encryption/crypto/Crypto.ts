import { Injectable } from '@nestjs/common';
import crypto from 'crypto';

const key=process.env.CRYPTO_KEY as string
const IV=crypto.randomBytes(16)
@Injectable()
export class Crypto {

 encryption=(text:string)=>{
    const buffer=Buffer.from(key)
    const cipher=crypto.createCipheriv("aes-256-cbc",buffer,IV)
    let encrypted:string=cipher.update(text,'utf-8','hex')
    encrypted +=cipher.final('hex')
    return IV.toString('hex')+":"+encrypted
}


 decryption=(textencrypt:string)=>{
const [Ivhex,encrypted]=textencrypt.split(":")
const Iv=Buffer.from(Ivhex,'hex')
    const decipher=crypto.createDecipheriv("aes-256-cbc",key,Iv)
    let decrypted=decipher.update(encrypted,'hex',"utf-8")
    decrypted+=decipher.final('utf-8')
    return decrypted
}


}