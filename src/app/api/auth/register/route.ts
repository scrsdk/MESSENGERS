// src/app/api/auth/register/route.ts

import connectToDB from "@/db";
import RoomSchema from "@/schemas/roomSchema";
import UserSchema from "@/schemas/userSchema";
import { cookies } from "next/headers";
import { hash } from "bcrypt";
import tokenGenerator from "@/utils/TokenGenerator";
import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
  try {
    await connectToDB();

    const { username, phone, password: purePass } = await req.json();

    if (!username || !phone || !purePass) {
      return NextResponse.json(
        { message: 'Missing username, phone, or password in request body' },
        { status: 400 }
      );
    }

    const password = await hash(purePass, 12);

    const userData = await UserSchema.create({
      name: username?.replace("@", ""),
      lastName: "",
      username: username.toLowerCase(),
      password,
      phone: phone.toString(),
    });

    await RoomSchema.create({
      name: "Saved Messages",
      avatar: "",
      type: "private",
      creator: userData._id,
      participants: [userData._id],
    });

    const token = tokenGenerator(userData.phone, 7);

    (await cookies()).set("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 15,
      sameSite: "none",
      path: "/",
      secure: true,
    });

    return NextResponse.json(userData, { status: 201 });

  } catch (error: any) { // <--- ИЗМЕНЕНИЕ: добавьте комментарий для подавления ESLint
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error('Error during user registration:', error);

    let duplicatedProp = null;

    if (error.code === 11000 && error.keyPattern) {
      const key = Object.keys(error.keyPattern)[0];
      if (key === "phone") {
        duplicatedProp = "phone";
      } else if (key === "username") {
        duplicatedProp = "username";
      }
    }

    if (duplicatedProp) {
      return NextResponse.json(
        { message: `Already there is an account using this ${duplicatedProp}` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Unknown error, try later", details: error.message },
      { status: 500 }
    );
  }
};
