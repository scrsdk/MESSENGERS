import imageCompression from "browser-image-compression";
import convertToWebP from "./ConvertToWebP";

const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    const optimizedImage = await convertToWebP(compressedFile);
    return optimizedImage;
  } catch (error) {
    console.error("Image compression error:", error);
    return file;
  }
};

export default compressImage;
