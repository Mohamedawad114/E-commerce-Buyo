import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
@Injectable()
export class s3_services {
  private s3Client = new S3Client({
    region: process.env.AWS_REGION as string,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
  });
  private key_folder = process.env.AWS_FOLDER as string;
  async getSignedUrl(key: string) {
    const getCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET as string,
      Key: key,
    });
    return await getSignedUrl(this.s3Client, getCommand, { expiresIn: 40 });
  }
  async upload_file(key: string) {
    const key_name = `${this.key_folder}/${key}/${Date.now()}`;
    const putCommand = new PutObjectCommand({
      Key: key_name,
      Bucket: process.env.AWS_S3_BUCKET,
      ContentType: 'application/octet-stream',
    });
    const url = await getSignedUrl(this.s3Client, putCommand, {
      expiresIn: 60 * 3,
    });
    return { url, Key: key_name };
  }
  async upload_files(count: number, key: string) {
    const urls = await Promise.all(
      Array.from({ length: count }).map(() => this.upload_file(key)),
    );
    return urls;
  }
  async verifyUpload(key: string) {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET as string,
          Key: key,
        }),
      );
      return { uploaded: true };
    } catch (e) {
      return { uploaded: false };
    }
  }
  async verifyUploads(keys: string[]) {
    const results = await Promise.all(
      keys.map(async (key) => {
        const { uploaded } = await this.verifyUpload(key);
        return { key, uploaded };
      }),
    );
    const allUploaded = results.every((r) => r.uploaded);
    return { allUploaded, results };
  }

  async deleteFile(key: string) {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET as string,
      Key: key,
    });
    return await this.s3Client.send(deleteCommand);
  }
  async deleteBUlk(keys: string[]) {
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: process.env.AWS_S3_BUCKET as string,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
      },
    });
    return await this.s3Client.send(deleteCommand);
  }
  async listderictory(path: string) {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET as string,
      Prefix: `${this.key_folder}/${path}/`,
    });
    return await this.s3Client.send(command);
  }
  async deleteListderictory(path: string) {
    const files = await this.listderictory(path);
    const keys = files.Contents?.map((file) => file.Key as string) || [];
    return await this.deleteBUlk(keys);
  }
}
