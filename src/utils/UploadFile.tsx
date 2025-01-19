import { S3 } from "aws-sdk";

const uploadFile = async (file: File): Promise<string | undefined> => {
  const ACCESSKEY = "rfpsaen58kka9eso";
  const SECRETKEY = "f8eea594-08f0-40de-bef2-6ef252a88cae";
  const ENDPOINT = "storage.iran.liara.space";
  const BUCKET = "pc-kala";

  let encodedFileName = file.name.replace(/[\?\=\%\&\+\-\.\_\s]/g, "_");
  encodedFileName = encodedFileName.slice(
    Math.max(encodedFileName.length - 30, 0)
  );

  try {
    const s3 = new S3({
      accessKeyId: ACCESSKEY,
      secretAccessKey: SECRETKEY,
      endpoint: ENDPOINT,
      s3ForcePathStyle: true,
    });

    const params = {
      Bucket: BUCKET,
      Key: encodeURIComponent(encodedFileName),
      Body: file,
    };

    await s3.upload(params).promise();

    const permanentSignedUrl = s3.getSignedUrl("getObject", {
      Bucket: BUCKET,
      Key: encodeURIComponent(encodedFileName),
      Expires: 3153600000,
    });

    return permanentSignedUrl;
  } catch (error) {
    console.error("Upload failed:", error);
  }
};

export default uploadFile;
