// src/app/api/auth/register/route.ts

import connectToDB from "@/db"; // Убедитесь, что путь к вашей базе данных корректен
import RoomSchema from "@/schemas/roomSchema"; // Убедитесь, что путь к схеме комнаты корректен
import UserSchema from "@/schemas/userSchema"; // Убедитесь, что путь к схеме пользователя корректен
import { cookies } from "next/headers";
import { hash } from "bcrypt";
import tokenGenerator from "@/utils/TokenGenerator"; // Убедитесь, что путь к генератору токенов корректен
import { NextResponse } from 'next/server'; // Необходимо импортировать для ответов в App Router

export const POST = async (req: Request) => {
  try {
    await connectToDB(); // Подключение к базе данных

    // Получаем данные из тела запроса
    const { username, phone, password: purePass } = await req.json();

    // 1. Предварительная валидация входных данных
    if (!username || !phone || !purePass) {
      return NextResponse.json(
        { message: 'Missing username, phone, or password in request body.' },
        { status: 400 } // Bad Request
      );
    }

    // Хешируем пароль перед сохранением в базе данных
    const password = await hash(purePass, 12);

    // Создаем нового пользователя
    const userData = await UserSchema.create({
      name: username?.replace("@", ""),
      lastName: "",
      username: username.toLowerCase(),
      password,
      phone: phone.toString(),
    });

    // Создаем комнату "Сохраненные сообщения" для нового пользователя
    await RoomSchema.create({
      name: "Saved Messages",
      avatar: "",
      type: "private",
      creator: userData._id,
      participants: [userData._id],
    });

    // Генерируем токен аутентификации
    const token = tokenGenerator(userData.phone, 7);

    // Устанавливаем токен в куки
    (await cookies()).set("token", token, {
      httpOnly: true, // Куки доступны только через HTTP(S) запросы
      maxAge: 60 * 60 * 24 * 15, // Срок действия: 15 дней
      sameSite: "none", // Разрешает отправку куки при запросах с других доменов (для кросс-доменных запросов)
      path: "/", // Доступен на всех путях
      secure: true, // Отправлять куки только по HTTPS
    });

    // Возвращаем успешный ответ
    return NextResponse.json(
      { message: 'User registered successfully!', user: { id: userData._id, username: userData.username, phone: userData.phone } },
      { status: 201 } // Created
    );

  } catch (error: unknown) { // <--- ИСПОЛЬЗУЕМ 'unknown' для лучшей типобезопасности
    // Всегда логируйте полную ошибку для отладки
    console.error('Error during user registration:', error);

    let duplicatedProp: string | null = null; // Переменная для хранения имени дублирующегося поля

    // 2. Обработка ошибки дубликата ключа MongoDB (код 11000)
    // Проверяем, является ли ошибка объектом и имеет ли она свойства 'code' и 'keyPattern'
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as any).code === 11000 && // Приводим к any для доступа к 'code'
      'keyPattern' in error &&
      typeof (error as any).keyPattern === 'object' &&
      (error as any).keyPattern !== null
    ) {
      const mongoError = error as { keyPattern: Record<string, number> }; // Сужаем тип для доступа к keyPattern
      const key = Object.keys(mongoError.keyPattern)[0]; // Получаем имя дублирующегося поля

      if (key === "phone") {
        duplicatedProp = "phone";
      } else if (key === "username") {
        duplicatedProp = "username";
      }
    }

    if (duplicatedProp) {
      // Если найдено дублирующееся поле, возвращаем соответствующее сообщение
      return NextResponse.json(
        { message: `An account with this ${duplicatedProp} already exists.` },
        { status: 409 } // Conflict
      );
    }

    // 3. Обработка других, неизвестных ошибок
    // Пытаемся получить сообщение об ошибке, если оно доступно
    const errorMessage = typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string'
      ? (error as any).message
      : 'An unexpected error occurred.';

    return NextResponse.json(
      { message: "Unknown error, please try again later.", details: errorMessage },
      { status: 500 } // Internal Server Error
    );
  }
};
