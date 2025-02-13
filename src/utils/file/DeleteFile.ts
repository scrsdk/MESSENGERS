import axios from "axios";
import { toaster } from "@/utils";

const deleteFile = async (fileUrl: string) => {
  if (!fileUrl) return;

  try {
    const fileName = fileUrl.split("/").pop();

    const response = await axios.delete("/api/file/delete", {
      data: { fileName },
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });

    if (response.status !== 200) throw new Error(response.data.message);
  } catch (error) {
    console.error("Delete failed:", error);
    toaster("error", "Delete failed! Please try again.");
  }
};

export default deleteFile;
