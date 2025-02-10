import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { MdModeEditOutline } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import Room from "@/models/room";
import useGlobalStore from "@/store/globalStore";
import DropDown from "../modules/ui/DropDown";
import { HiOutlineSpeakerphone } from "react-icons/hi";
import { HiMiniUserGroup } from "react-icons/hi2";

const CreateRoom = lazy(() => import("@/components/modules/CreateRoom"));

const CreateRoomBtn = () => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  const [roomType, setRoomType] = useState<Room["type"] | null>();
  const setter = useGlobalStore((state) => state.setter);

  const dropDownItems = [
    {
      title: "New Channel",
      onClick: () => {
        setRoomType("channel");
        setIsOptionsOpen(true);
        setIsDropDownOpen(false);
      },
      icon: <HiOutlineSpeakerphone className="size-5 mr-3 text-gray-400" />,
    },
    {
      title: "New Group",
      onClick: () => {
        setRoomType("group");
        setIsOptionsOpen(true);
        setIsDropDownOpen(false);
      },
      icon: <HiMiniUserGroup className="size-5 mr-3 text-gray-400" />,
    },
  ];

  const handleCreateRoom = useCallback(() => {
    setIsOptionsOpen(true);
    setRoomType("group");
    setIsDropDownOpen(false);
  }, []);

  useEffect(() => {
    setter({
      createRoom: handleCreateRoom,
    });
  }, [setter, handleCreateRoom]);

  return (
    <div className={`absolute right-3 bottom-3 z-10`}>
      <DropDown
        dropDownItems={dropDownItems}
        classNames="bottom-16 right-0 w-40"
        isOpen={isDropDownOpen}
        setIsOpen={setIsDropDownOpen}
        button={
          <div className="bg-darkBlue size-14 rounded-full flex-center">
            {isDropDownOpen ? (
              <IoClose data-aos="zoom-out" className="size-7 cursor-pointer" />
            ) : (
              <MdModeEditOutline
                data-aos="zoom-out"
                className="size-7 cursor-pointer"
              />
            )}
          </div>
        }
      />

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
