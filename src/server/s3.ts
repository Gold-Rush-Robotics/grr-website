import "server-only";

import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { env } from "@/env";

type S3Config = {
  accessKeyId: string;
  bucket: string;
  endpoint: string;
  forcePathStyle: boolean;
  publicUrl: string;
  region: string;
  secretAccessKey: string;
};

let s3Client: S3Client | undefined;

function getS3Config(): S3Config {
  return {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    bucket: env.S3_BUCKET,
    endpoint: env.S3_ENDPOINT,
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
    publicUrl: env.S3_PUBLIC_URL,
    region: env.S3_REGION,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  };
}

export function getS3Client() {
  if (!s3Client) {
    const config = getS3Config();

    s3Client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return s3Client;
}

export function getS3Bucket() {
  return getS3Config().bucket;
}

export function getS3ObjectUrl(key: string) {
  const normalizedKey = key.replace(/^\/+/, "");
  const config = getS3Config();

  return `${config.publicUrl.replace(/\/+$/, "")}/${normalizedKey}`;
}

export async function checkS3KeyExists(key: string) {
  const normalizedKey = key.replace(/^\/+/, "");

  try {
    const object = await getS3Client().send(
      new HeadObjectCommand({
        Bucket: getS3Bucket(),
        Key: normalizedKey,
      }),
    );

    return Boolean(object.ContentLength && object.ContentLength > 0);
  } catch {
    return false;
  }
}
