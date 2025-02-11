import { ReactNode } from "react";
import { toast } from "react-toastify";

const toaster = (
  status: boolean,
  message: string | ReactNode,
  duration = 2000
) => {
  toast[status ? "success" : "error"](message, {
    position: "top-right",
    autoClose: duration,
    hideProgressBar: true,
    theme: "dark",
    style: {
      backgroundColor: "#17212b",
      color: "#ffffff",
      fontSize: "15px",
      borderRadius: "10px",
    },
  });
};
export default toaster;
