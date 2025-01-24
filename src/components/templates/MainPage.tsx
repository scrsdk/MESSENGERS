import LeftBar from "./LeftBar";
import MiddleBar from "./MiddleBar";

const MainPage = () => {
  return (
    <div className="flex items-center bg-leftBarBg  transition-all h-dvh duration-400 relative overflow-y-hidden overflow-hidden">
      <LeftBar />
      <MiddleBar />
    </div>
  );
};

export default MainPage;
