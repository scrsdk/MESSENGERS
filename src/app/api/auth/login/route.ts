import connectToDB from "@/db";
import { compare } from "bcrypt";
import { cookies } from "next/headers";
import UserSchema from "@/schemas/userSchema";
import { tokenGenerator } from "@/utils";

export const POST = async (req: Request) => {
  try {
    await connectToDB();

    const { payload, password } = await req.json();

    const userData = await UserSchema.findOne({
      $or: [{ username: payload }, { phone: payload.toString() }],
    });
    if (!userData)
      return Response.json(
        { message: "No user exist with this username or password." },
        { status: 401 }
      );

    if (!(await compare(password, userData.password)))
      return Response.json(
        { message: "Incorrect username/phone or password" },
        { status: 401 }
      );

    const token = tokenGenerator(userData.phone, 7);

    (await cookies()).set("token", token, {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 6,
    });
    return Response.json(userData, { status: 200 });
  } catch (err) {
    console.log(err);
    return Response.json(
      { message: "Unknown error, try later." },
      { status: 500 }
    );
  }
};
