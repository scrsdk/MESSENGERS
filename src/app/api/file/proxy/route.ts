import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get("fileName");

  if (!fileName) {
    return NextResponse.json(
      { message: "File name is required" },
      { status: 400 }
    );
  }

  const s3Url = `${process.env.S3_ENDPOINT}/${fileName}`;

  return NextResponse.redirect(s3Url, 307);
}
