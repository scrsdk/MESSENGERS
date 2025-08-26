"use client";

import { useState } from "react";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import Button from "../modules/ui/Button";
import Lottie from "react-lottie-player";
import animationData from "../../../public/animations/telegram.json";

const AuthenticationForm = () => {
  const [isLogging, setIsLogging] = useState(true);

  return (
    <section className="bg-leftBarBg flex-center size-full h-dvh">
      <div className="flex-center transition-all duration-300  flex-col max-w-[360px] w-full text-white">
        <Lottie
          loop
          play
          animationData={animationData}
          className="player size-80"
        />

        <h1 className="font-bold font-vazirBold text-4xl">
          Telegram ID
        </h1>

        <p className="text-gray-400 text-center px-10 text-sm  font-vazirLight mt-3">
          {isLogging
            ? "Пожалуйста, подтвердите свой номер телефона и пароль для входа в систему."
            : "Пожалуйста, заполните поля для регистрации."}
        </p>

        {isLogging ? <SignInForm /> : <SignUpForm />}

        <div className="text-left w-full ml-1 mt-5 text-sm">
          {isLogging ? "У вас нет учетной записи? " : "Already have an account?"}
          <Button
            variant="ghost"
            color="info"
            size="xs"
            classNames="ml-1 "
            onClick={() => setIsLogging((prev) => !prev)}
          >
            {isLogging ? " Зарегистрироваться " : " Войти "}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AuthenticationForm;
