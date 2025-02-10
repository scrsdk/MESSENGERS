import useUserStore from "@/store/userStore";
import axios from "axios";
import toaster from "./Toaster";

const logout = async () => {
  try {
    await axios.get("/api/auth/logout");
    return location.reload();
    const setter = useUserStore.getState().setter;
    setter({ isLogin: false });
  } catch (error) {
    console.log(error);

    toaster(false, "Network issues!");
  }
};

export default logout;
