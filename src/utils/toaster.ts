import { toast } from "react-toastify";

const toaster = (status: boolean, message: string, duration: number = 2000) => {
  toast[status ? "success" : "error"](message, {
    position: "top-center",
    autoClose: duration,
    style: {
      display: "flex",
      alignItems: "center",
      fontFamily: "inherit",
      backgroundColor: "#19202E",
      color: "#ffffff",
      position: "relative",
      top: "30px",
      fontSize: "16px",
      padding: "9px",
      border: `2px solid #${status ? "60CDFF" : "f31260"}`,
      borderRadius: "4px",
      zIndex: "999999",
    },
  });
};
export default toaster;
