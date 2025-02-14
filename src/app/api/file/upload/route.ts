import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { cookies } from "next/headers";
import { tokenDecoder } from "@/utils";

const s3Client = new S3Client({
  region: "default",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  endpoint: process.env.S3_ENDPOINT,
});

export const POST = async (req: Request) => {
  try {
    const cookieToken = (await cookies()).get("token")?.value;
    if (!cookieToken) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const verifiedToken = tokenDecoder(cookieToken);
    if (!verifiedToken) {
      return Response.json({ message: "Invalid token" }, { status: 403 });
    }

    const { fileName, fileType } = await req.json();

    if (!fileName || !fileType) {
      return Response.json(
        { error: "Invalid file name or type" },
        { status: 400 }
      );
    }

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 60 * 60 * 24,
    });

    return Response.json({ url: signedUrl }, { status: 200 });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
};
