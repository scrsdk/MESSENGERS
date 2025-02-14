import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
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

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get("fileName");

    if (!fileName) {
      return Response.json(
        { message: "File name is required" },
        { status: 400 }
      );
    }

    const cookieToken = (await cookies()).get("token")?.value;
    if (!cookieToken)
      return Response.json({ message: "Unauthorized" }, { status: 401 });

    const verifiedToken = tokenDecoder(cookieToken);
    if (!verifiedToken)
      return Response.json({ message: "Invalid token" }, { status: 403 });

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${fileName}`,
    });

    const { Body } = await s3Client.send(command);
    if (!Body)
      return Response.json({ message: "File not found" }, { status: 404 });

    return new Response(Body as ReadableStream, {
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
};
