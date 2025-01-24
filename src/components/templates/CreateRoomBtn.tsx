import { Suspense, lazy, useEffect, useState } from "react";
import { MdModeEditOutline } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import Room from "@/models/room";
import useGlobalVariablesStore from "@/store/globalVariablesStore";
import { Button } from "@heroui/button";
const CreateRoom = lazy(() => import("@/components/modules/CreateRoom"));

const CreateRoomBtn = () => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [roomType, setRoomType] = useState<Room["type"] | null>();
  const setter = useGlobalVariablesStore((state) => state.setter);

  useEffect(() => {
    setter({
      createRoom: () => {
        setIsOptionsOpen(true);
        setRoomType("group");
      },
    });
  }, []);

  return (
    <div
      className={`absolute md:max-w-[29.6%] inset-y-0 left-0 size-full text-white`}
    >
      <Button
        radius="full"
        size="sm"
        className="fixed h-16 md:absolute bottom-4 right-4 md:right-0 xl:right-3 text-white bg-darkBlue flex-center z-999"
        onPress={() => setIsOptionsOpen((prev) => !prev)}
      >
        {isOptionsOpen ? (
          <IoClose data-aos="zoom-out" className="size-7" />
        ) : (
          <MdModeEditOutline data-aos="zoom-out" className="size-7" />
        )}
      </Button>

      <div
        data-aos="fade-left"
        key={isOptionsOpen.toString()}
        className={`fixed md:absolute ${
          isOptionsOpen ? "max-h-fit" : "max-h-0"
        } flex flex-col right-4 md:right-0 xl:right-3 bottom-24 rounded-md ch:w-full ch:p-3 hover:ch:bg-chatBg/50  overflow-hidden transition-all cursor-pointer  bg-[#272D3A] text-white z-9`}
      >
        <span onClick={() => setRoomType("channel")}>New Channel</span>
        <span onClick={() => setRoomType("group")}>New Group</span>
      </div>

      {isOptionsOpen && (
        <Suspense>
          <CreateRoom
            close={() => {
              setIsOptionsOpen(false);
              setRoomType(null);
            }}
            roomType={roomType!}
          />
        </Suspense>
      )}
    </div>
  );
};

export default CreateRoomBtn;
