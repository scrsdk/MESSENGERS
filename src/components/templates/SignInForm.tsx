import useUserStore from "@/store/userStore";
import { toaster } from "@/utils";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";

type Inputs = {
  payload: string | number;
  password: string;
};

const SignInForm = () => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors, isValid },
  } = useForm<Inputs>({ mode: "onChange" });

  const { setter } = useUserStore((state) => state);

  const submitForm: SubmitHandler<Inputs> = async (data) => {
    try {
      const response = await axios.post("/api/auth/login", data);

      if (response.status == 200) {
        setter({
          ...response.data,
          isLogin: true,
        });
        toaster(true, "You logged in successfully.");
      }
    } catch (error: any) {
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
        {...register("payload", {
          required: "This field is required!",
          minLength: {
            value: 3,
            message: "length are bigger than 3",
          },
          maxLength: {
            value: 20,
            message: "length are less than 20",
          },
        })}
        classNames={{
          label: "!text-blue-400",
        }}
        variant="bordered"
        color="primary"
        label="Username / phone"
        isInvalid={!!errors?.payload}
        errorMessage={errors.payload?.message}
        placeholder="Enter your username/phone"
      />

      <Input
        {...register("password", {
          validate: (value) =>
            value?.length! > 20 || value?.length! < 8
              ? "Password length should be bigger than 8 & less than 20"
              : true,
        })}
        classNames={{ label: "!text-blue-400" }}
        variant="bordered"
        color="primary"
        radius="sm"
        type="password"
        label="Password"
        isInvalid={!!errors?.password}
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
        Sign in
      </Button>
    </div>
  );
};

export default SignInForm;
