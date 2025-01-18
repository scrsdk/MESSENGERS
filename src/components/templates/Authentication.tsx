"use client";
import AppLoader from "@/components/modules/AppLoader";
import useUserStore from "@/store/userStore";
import axios from "axios";
import { ReactNode, lazy, useEffect, useState } from "react";
const AuthenticationForm = lazy(
  () => import("@/components/templates/AuthenticationForm")
);
const Authentication = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { setter, isLogin } = useUserStore((state) => state);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.post("/api/auth/currentuser");

        if (response.status == 200) {
          setter({
            ...response.data,
            isLogin: true,
          });
        }
      } catch (error: unknown) {
        console.log(error.message);
      } finally {
      }
    })();
  }, [setter]);

  if (isLoading) return <AppLoader />;

  return <>{isLogin ? <>{children}</> : <AuthenticationForm />}</>;
};

export default Authentication;
