import connectToDB from "@/db";
import RoomSchema from "@/schemas/roomSchema";
import UserSchema from "@/schemas/userSchema";
import { cookies } from "next/headers";
import { hash } from "bcrypt";
import tokenGenerator from "@/utils/TokenGenerator";

// Определяем интерфейс для ожидаемой ошибки MongoDB при дублировании
interface MongoDuplicateKeyError extends Error {
  code?: number;
  keyPattern?: { [key: string]: number };
  // Могут быть и другие свойства, если необходимо
}

// Определяем интерфейс для ошибки валидации Mongoose
interface MongooseValidationError extends Error {
  name: 'ValidationError';
  errors: { [key: string]: { message: string } };
}

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

    cookies().set("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 15,
      sameSite: "none",
      path: "/",
      secure: true,
    });

    return Response.json(userData, { status: 201 });
  } catch (error: unknown) { // <<-- Использование 'unknown'
    console.error("Ошибка при регистрации пользователя:", error);

    // Проверка на ошибку дублирования MongoDB
    if (
      typeof error === 'object' && error !== null &&
      (error as MongoDuplicateKeyError).code === 11000 &&
      (error as MongoDuplicateKeyError).keyPattern
    ) {
      const duplicatedProp = Object.keys((error as MongoDuplicateKeyError).keyPattern).join("");
      const message = `Already there is an account using this ${duplicatedProp}`;
      return Response.json({ message }, { status: 409 });
    }
    // Проверка на ошибку валидации Mongoose
    else if (
      typeof error === 'object' && error !== null &&
      (error as MongooseValidationError).name === 'ValidationError' &&
      (error as MongooseValidationError).errors
    ) {
      const messages = Object.values((error as MongooseValidationError).errors).map((val: any) => val.message);
      return Response.json({ message: `Validation Error: ${messages.join(', ')}` }, { status: 400 });
    }
    // Для всех остальных, неизвестных ошибок
    else {
      return Response.json(
        { message: "Unknown error, please try again later." },
        { status: 500 }
      );
    }
  }
};
