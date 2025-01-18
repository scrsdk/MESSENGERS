import connectToDB from "@/db";
import UserSchema from "@/schemas/userSchema";
import { tokenDecoder } from "@/utils";
import { cookies } from "next/headers";

export const POST = async (req: Request) => {
  try {
    await connectToDB();

    const token = (await cookies()).get("token")?.value ?? req.json();

    if (!token)
      return Response.json(
        { message: "You are not logged in" },
        { status: 401 }
      );

    const verifiedToken = tokenDecoder(token) as { phone: string };

    const userData = await UserSchema.findOne({
      phone: verifiedToken?.phone,
    }).lean();

    if (!userData || !verifiedToken) {
      (await cookies()).delete("token");
      return Response.json(
        { message: "No user exist with this username or password!" },
        { status: 401 }
      );
    }

    return Response.json(userData, { status: 200 });
  } catch (err) {
    console.log(err);
    return Response.json(
      { message: "Unknown error, try later." },
      { status: 500 }
    );
  }
};
