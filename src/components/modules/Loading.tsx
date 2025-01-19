import { Spinner } from "@heroui/spinner";
import { SiTelegram } from "react-icons/si";

const Loading = () => {
  return (
    <div className="fixed bg-leftBarBg h-screen size-full z-[9999] flex-center">
      <Spinner size="lg" color="current" className="text-lightBlue scale-150" />
      <SiTelegram className="size-12 absolute animate-pulse text-lightBlue" />
    </div>
  );
};

export default Loading;
