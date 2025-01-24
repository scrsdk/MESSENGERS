"use client";

import { useState } from "react";
import { SiTelegram } from "react-icons/si";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import { Button } from "@heroui/button";

const AuthenticationForm = () => {
  const [isLogging, setIsLogging] = useState(true);

  return (
    <section className="bg-leftBarBg flex-center size-full h-dvh">
      <div className="flex items-center transition-all duration-300 flex-col max-w-[360px] w-full py-16 text-white">
        <SiTelegram className="size-40 rounded-full text-lightBlue" />

        <h1 className="font-bold font-vazirBold text-[35px] mt-7">
          Sign {isLogging ? "in" : "up"} to Telegram
        </h1>

        <p className="text-gray-400 text-center px-12 text-sm  font-vazirLight mt-3">
          {isLogging
            ? "Please confirm your username and password to sign in."
            : "Please fill the fields to sign up."}
        </p>

        {isLogging ? <SignInForm /> : <SignUpForm />}

        <div className="text-left w-full mr-auto mt-5 text-[14px]">
          {isLogging ? "Don't have an account? " : "Already have an account?"}
          <Button
            onPress={() => setIsLogging((prev) => !prev)}
            color="primary"
            size="sm"
            variant="light"
            className="ml-3"
          >
            {isLogging ? " Sign up" : " Sign in"}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AuthenticationForm;
