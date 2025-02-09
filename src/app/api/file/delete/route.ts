import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
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

export const DELETE = async (req: Request) => {
  try {
    const cookieToken = (await cookies()).get("token")?.value;
    if (!cookieToken)
      return Response.json({ message: "Unauthorized" }, { status: 401 });

    const verifiedToken = tokenDecoder(cookieToken);
    if (!verifiedToken)
      return Response.json({ message: "Invalid token" }, { status: 403 });

    const { fileName } = await req.json();
    if (!fileName)
      return Response.json({ error: "No file specified" }, { status: 400 });

    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName.replace("download?fileName=", ""),
    });

    await s3Client.send(command);

    return Response.json(
      { message: "File deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting file:", error);
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
};
