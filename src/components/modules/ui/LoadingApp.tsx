import dynamic from "next/dynamic";
const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => mod.Player),
  {
    ssr: false,
  }
);
const LoadingApp = () => {
  return (
    <div className="fixed bg-leftBarBg h-screen size-full flex-center">
      <Player
        src={"/animations/appLoader.json"}
        className="player size-80"
        loop
        autoplay
      />
    </div>
  );
};

export default LoadingApp;
