const convertToWebP = async (file: File) => {
  return new Promise<File>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0, img.width, img.height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const webpFile = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, ".webp"),
                {
                  type: "image/webp",
                }
              );
              resolve(webpFile);
            } else {
              reject(new Error("Conversion failed"));
            }
          },
          "image/webp",
          0.8
        );
      };
    };
  });
};

export default convertToWebP;
