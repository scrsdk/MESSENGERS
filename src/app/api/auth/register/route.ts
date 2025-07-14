import connectToDB from "@/db";
import RoomSchema from "@/schemas/roomSchema";
import UserSchema from "@/schemas/userSchema";
import { cookies } from "next/headers";
import { hash } from "bcrypt";
import tokenGenerator from "@/utils/TokenGenerator";

export const POST = async (req: Request) => {
  try {
    await connectToDB();

    const { username, phone, password: purePass } = await req.json();

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

    // cookies() в Next.js 13/14 является функцией, которую не нужно await,
    // если она импортируется напрямую из 'next/headers'.
    // Если же у вас какая-то обертка, тогда await может быть нужен.
    // Для большинства случаев, просто cookies().set()
    cookies().set("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 15,
      sameSite: "none", // или 'lax', 'strict' в зависимости от ваших требований
      path: "/",
      secure: true, // Использовать true в продакшене (HTTPS)
    });

    return Response.json(userData, { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // В первую очередь, всегда полезно логировать ошибку
    console.error("Ошибка при регистрации пользователя:", error);

    // Проверяем, является ли ошибка ошибкой дублирования MongoDB (код 11000)
    // В Mongoose, `keyPattern` находится непосредственно в объекте ошибки для ошибок дублирования.
    if (error.code === 11000 && error.keyPattern) {
      const duplicatedProp = Object.keys(error.keyPattern).join("");
      const message = `Already there is an account using this ${duplicatedProp}`;
      return Response.json({ message }, { status: 409 }); // 409 Conflict - более подходящий статус для дублирования
    }
    // Если это не ошибка дублирования, а другая ошибка Mongoose (например, валидации)
    else if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val: any) => val.message);
      return Response.json({ message: `Validation Error: ${messages.join(', ')}` }, { status: 400 }); // 400 Bad Request
    }
    // Для всех остальных, неизвестных ошибок
    else {
      return Response.json(
        { message: "Unknown error, please try again later." },
        { status: 500 } // 500 Internal Server Error - стандартный для неизвестных ошибок сервера
      );
    }
  }
};
