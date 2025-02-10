const registerSW = () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.log("SW registration failed:", error);
    });
  }
};

export default registerSW;
