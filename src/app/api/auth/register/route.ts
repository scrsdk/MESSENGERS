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

    // Шаг 1: Проверяем, является ли 'error' объектом и не null
    if (typeof error === "object" && error !== null) {
      // Шаг 2: Создаем временную переменную, чтобы TypeScript мог сузить тип
      // Мы предполагаем, что объект может содержать 'code' и 'keyPattern'.
      // Использование 'as { ... }' здесь не является 'any', и обычно принимается ESLint.
      const err = error as { code?: unknown; keyPattern?: unknown; message?: string };

      // Шаг 3: Проверяем, что 'code' существует, является числом и равно 11000
      if (
        typeof err.code === 'number' &&
        err.code === 11000
      ) {
        // Шаг 4: Если это ошибка дубликата, проверяем 'keyPattern'
        if (
          typeof err.keyPattern === 'object' &&
          err.keyPattern !== null
        ) {
          // Шаг 5: Теперь, когда мы уверены в структуре, можно безопасно
          // получить ключи из keyPattern. TypeScript теперь знает, что это объект.
          const keyPattern = err.keyPattern as Record<string, number>;
          const keys = Object.keys(keyPattern);
          if (keys.length > 0) {
            duplicatedProp = keys[0];
          }
        }
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
    // Для всех остальных неизвестных ошибок
    const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred.';

    return Response.json(
      { message: "An unknown error occurred. Please try again later.", details: errorMessage },
      { status: 500 } // Internal Server Error
    );
  }
};
