"use client";
import useGlobalStore from "@/stores/globalStore";
import { lazy, Suspense } from "react";
import Loading from "../modules/ui/Loading";
import AudioManager from "./AudioManager";

const ChatContent = lazy(() => import("../middleBar/ChatContent"));

const MiddleBar = () => {
  const { selectedRoom, isRoomDetailsShown } = useGlobalStore((state) => state);

  return (
    <div
      className={` bg-chatBg relative ${
        !selectedRoom && "hidden"
      }  md:block md:w-[60%] lg:w-[65%] ${
        isRoomDetailsShown ? "xl:w-[50%]" : "xl:w-[70%]"
      }   text-white overflow-x-hidden  scroll-w-none  size-full `}
    >
      <AudioManager />
      {selectedRoom !== null ? (
        <Suspense
          fallback={
            <div className="size-full h-screen flex-center">
              <Loading size="xl" />
            </div>
          }
        >
          <ChatContent />
        </Suspense>
      ) : (
        <div data-aos="fade-left" className="flex-center size-full min-h-dvh">
          <p className="rounded-full w-fit text-sm py-1 px-3 text-center bg-white/[15%]">
            Select chat to start messaging
          </p>
        </div>
      )}
    </div>
  );
};

export default MiddleBar;
