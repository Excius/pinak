import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import type { S3ClientConfig, PutObjectCommandInput } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import appConfig from "./config.js";

const enabled = appConfig.S3_ENABLED;

let s3Client: S3Client | null = null;

if (enabled) {
  const clientConfig: S3ClientConfig = {
    region: appConfig.S3_REGION,
  };

  if (appConfig.S3_ACCESS_KEY_ID && appConfig.S3_SECRET_ACCESS_KEY) {
    clientConfig.credentials = {
      accessKeyId: appConfig.S3_ACCESS_KEY_ID,
      secretAccessKey: appConfig.S3_SECRET_ACCESS_KEY,
    };
  }

  if (appConfig.S3_FORCE_PATH_STYLE) {
    clientConfig.forcePathStyle = appConfig.S3_FORCE_PATH_STYLE;
  }

  s3Client = new S3Client(clientConfig);
}

function ensureEnabled() {
  if (!enabled || !s3Client) {
    throw new Error(
      "S3 is not enabled. Set S3_ENABLED=true and required env vars.",
    );
  }
}

export async function getSignedUploadUrl(
  key: string,
  contentType?: string,
  expiresIn?: number,
) {
  ensureEnabled();
  const command = new PutObjectCommand({
    Bucket: appConfig.S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  const signed = await getSignedUrl(s3Client!, command, {
    expiresIn: expiresIn ?? appConfig.S3_SIGNED_URL_EXPIRES,
  });
  return signed;
}

export async function uploadBuffer(
  buffer: Buffer,
  key: string,
  contentType?: string,
  makePublic = false,
) {
  ensureEnabled();
  const params: PutObjectCommandInput = {
    Bucket: appConfig.S3_BUCKET!,
    Key: key,
    Body: buffer,
    ...(contentType ? { ContentType: contentType } : {}),
  } as PutObjectCommandInput;

  const command = new PutObjectCommand(params);
  await s3Client!.send(command);

  // If object is public, return the public URL. Otherwise return a
  // time-limited signed GET URL so callers can access the object.
  if (makePublic) {
    return getPublicUrl(key);
  }

  return getSignedGetUrl(key);
}

export async function getSignedGetUrl(key: string, expiresIn?: number) {
  ensureEnabled();
  const command = new GetObjectCommand({
    Bucket: appConfig.S3_BUCKET,
    Key: key,
  });
  const signed = await getSignedUrl(s3Client!, command, {
    expiresIn: expiresIn ?? appConfig.S3_SIGNED_URL_EXPIRES,
  });
  return signed;
}

export async function deleteObject(key: string) {
  ensureEnabled();
  const command = new DeleteObjectCommand({
    Bucket: appConfig.S3_BUCKET,
    Key: key,
  });
  await s3Client!.send(command);
}

export function getPublicUrl(key: string) {
  if (!appConfig.S3_ENABLED) {
    throw new Error("S3 is not enabled");
  }
  // Preserve path separators when encoding so URLs look like
  // /bucket/products/<productId>/<variantId>/file.jpg rather than using
  // encoded "%2F" segments which can cause confusion with some servers.
  const encodedKey = encodeURIComponent(key).replace(/%2F/g, "/");
  if (appConfig.S3_FORCE_PATH_STYLE) {
    return `https://s3.${appConfig.S3_REGION}.amazonaws.com/${appConfig.S3_BUCKET}/${encodedKey}`;
  }
  if (appConfig.S3_REGION === "us-east-1") {
    return `https://${appConfig.S3_BUCKET}.s3.amazonaws.com/${encodedKey}`;
  }
  return `https://${appConfig.S3_BUCKET}.s3.${appConfig.S3_REGION}.amazonaws.com/${encodedKey}`;
}

export default {
  getSignedUploadUrl,
  uploadBuffer,
  getSignedGetUrl,
  deleteObject,
  getPublicUrl,
};
