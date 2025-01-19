import useUserStore from "@/store/userStore";
import axios from "axios";
import toaster from "./toaster";

const logout = async () => {
  try {
    await axios.get("/api/auth/logout");
    return location.reload();
    const setter = useUserStore.getState().setter;
    setter({ isLogin: false });
  } catch (error) {
    toaster(false, "Network issues bud!");
  }
};

export default logout;
