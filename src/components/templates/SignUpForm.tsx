import User from "@/models/user";
import useUserStore from "@/store/userStore";
import { toaster } from "@/utils";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";

type Inputs = Partial<User>;

const SignUpForm = () => {
  const { setter } = useUserStore((state) => state);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors, isValid },
  } = useForm<Inputs>({ mode: "onChange" });

  const submitForm: SubmitHandler<Inputs> = async (data) => {
    try {
      const response = await axios.post("/api/auth/register", {
        ...data,
      });

      if (response.status == 201) {
        setter({
          ...response.data,
          isLogin: true,
        });
        toaster(true, "You signed up successfully.");
      }
    } catch (error: unknown) {
      toaster(false, error.response.data.message, 3000);
    }
  };

  return (
    <div
      data-aos="zoom-out"
      className="flex w-full flex-col mt-10 space-y-6 ch:text-xl"
      onKeyUp={(e) => e.key == "Enter" && handleSubmit(submitForm)()}
    >
      <Input
        {...register("username", {
          required: "This field is required!",
          minLength: {
            value: 3,
            message: "Username length should be bigger than 3 & less than 20",
          },
          maxLength: {
            value: 20,
            message: "Username length should be bigger than 3 & less than 20",
          },
        })}
        classNames={{
          label: "!text-blue-400",
        }}
        variant="bordered"
        color="primary"
        radius="sm"
        label="Username"
        isInvalid={!!errors.username}
        errorMessage={errors.username?.message}
        placeholder="Enter your unique username"
      />

      <Input
        {...register("phone", {
          required: "This field is required!",
          pattern: {
            value: /(^09[0-9]{9}$)|(^\u06F0\u06F9[\u06F0-\u06F9]{9})$/,
            message: "Invalid phone number",
          },
        })}
        classNames={{
          label: "!text-blue-400",
        }}
        variant="bordered"
        color="primary"
        radius="sm"
        label="Phone"
        type="tel"
        isInvalid={!!errors.phone}
        errorMessage={errors.phone?.message}
        placeholder="Enter your phone number"
      />

      <Input
        {...register("password", {
          required: "This field is required!",
          validate: (value) =>
            (value && value.length! > 20) || (value && value.length! < 8)
              ? "Password length should be bigger than 8 & less than 20"
              : true,
        })}
        classNames={{
          label: "!text-blue-400",
        }}
        variant="bordered"
        color="primary"
        radius="sm"
        type="password"
        label="Password"
        autoComplete="false"
        isInvalid={!!errors.password}
        errorMessage={errors.password?.message}
        placeholder="Enter your password"
      />

      <Button
        isLoading={isSubmitting}
        disabled={!isValid}
        color="primary"
        size="lg"
        radius="sm"
        className="w-full"
        variant={isValid ? "shadow" : "flat"}
        onClick={handleSubmit(submitForm)}
      >
        Sign up
      </Button>
    </div>
  );
};

export default SignUpForm;
