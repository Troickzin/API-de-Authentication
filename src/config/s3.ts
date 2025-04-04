import dotenv from "dotenv";
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

dotenv.config();

const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

export { s3Client, PutObjectCommand };