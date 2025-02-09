import toaster from "../Toaster";

const downloadFile = async (fileUrl: string) => {
  try {
    console.log(fileUrl);
    const response = await fetch(fileUrl);

    if (!response.ok) throw new Error("Failed to download file");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileUrl.split("fileName=")[1] || "downloaded-file.ogg";
    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Download failed:", error);
    toaster(false, "Download failed! Please try again.");
  }
};
export default downloadFile;
