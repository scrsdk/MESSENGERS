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

    // Проверка наличия обязательных полей
    if (!username || !phone || !purePass) {
      return Response.json(
        { message: "Missing username, phone, or password." },
        { status: 400 } // Bad Request
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

    cookies().set("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 15, // 15 дней
      sameSite: "none", // Важно для кросс-доменных запросов в production
      path: "/",
      secure: process.env.NODE_ENV === 'production', // true для production, чтобы куки передавались только по HTTPS
    });

    return Response.json(userData, { status: 201 }); // Created
  } catch (error: unknown) { // Использование 'unknown' для более безопасной обработки ошибок
    console.error("Ошибка при регистрации пользователя:", error); // Логируем ошибку для отладки на сервере

    let duplicatedProp: string | null = null;

    // Проверка, является ли ошибка MongoDB ошибкой дубликата ключа (код 11000)
    // Дополнительные проверки на структуру объекта ошибки
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as any).code === 11000 && // Проверяем код ошибки MongoDB для дубликата ключа
      "keyPattern" in error &&
      typeof (error as any).keyPattern === "object" &&
      (error as any).keyPattern !== null
    ) {
      // MongoDB Duplicate Key Error. keyPattern содержит объект с дублирующимся полем
      const mongoError = error as { keyPattern: Record<string, number> };
      const keys = Object.keys(mongoError.keyPattern);
      if (keys.length > 0) {
        // Берем первое (и обычно единственное) поле, которое вызвало дубликат
        duplicatedProp = keys[0];
      }
    }

    if (duplicatedProp) {
      // Возвращаем более специфичное сообщение и статус 409 Conflict
      return Response.json(
        { message: `An account with this ${duplicatedProp} already exists.` },
        { status: 409 }
      );
    }

    // Если это не ошибка дубликата или другая известная ошибка
    // Можно добавить более детальную обработку других типов ошибок
    // Например, ошибки валидации Mongoose

    // Для всех остальных неизвестных ошибок
    return Response.json(
      { message: "An unknown error occurred. Please try again later." },
      { status: 500 } // Internal Server Error
    );
  }
};
