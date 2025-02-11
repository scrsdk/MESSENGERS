import axios from "axios";

const uploadFile = async (file: File) => {
  const response = await axios.post(
    "/api/file/upload",
    {
      fileName: file.name,
      fileType: file.type,
    },
    {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    }
  );

  if (response.status !== 200) throw new Error(response.data.message);

  await axios.put(response.data.url, file, {
    headers: { "Content-Type": file.type },
  });

  const downloadUrl = `/api/file/download?fileName=${encodeURIComponent(
    file.name
  )}`;

  return downloadUrl;
};

export default uploadFile;
