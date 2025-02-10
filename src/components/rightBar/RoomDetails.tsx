import Image from "next/image";
import { IoClose } from "react-icons/io5";
import { TbMessage } from "react-icons/tb";
import { IoCopyOutline } from "react-icons/io5";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toaster } from "@/utils";
import RoomCard from "../modules/RoomCard";
import { copyText as copyFn } from "@/utils";
import User from "@/models/user";
import useGlobalStore from "@/store/globalStore";
import useUserStore from "@/store/userStore";
import useSockets from "@/store/useSockets";
import Loading from "../modules/ui/Loading";
import Room from "@/models/room";

const RoomDetails = () => {
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [groupMembers, setGroupMembers] = useState<User[]>([]);
  const roomDetailsRef = useRef<HTMLDivElement | null>(null);
  const {
    setter,
    isRoomDetailsShown,
    selectedRoom,
    shouldCloseAll,
    mockSelectedRoomData,
    onlineUsers,
  } = useGlobalStore((state) => state) || {};
  const myData = useUserStore((state) => state);
  const roomSocket = useSockets((state) => state.rooms);

  const { _id: myID, rooms } = myData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectedRoomData: any = mockSelectedRoomData ?? selectedRoom;
  const { participants, type, _id: roomID } = { ...selectedRoomData };

  const onlineUsersCount = participants?.filter((pId: string) =>
    onlineUsers.some((data) => {
      if (data.userID === pId) return true;
    })
  ).length;

  const {
    avatar = "",
    name,
    username,
    link,
    _id,
    biography,
  } = useMemo(() => {
    return type === "private"
      ? participants?.find((data: Room) => data?._id !== myID) ||
          participants?.find((data: Room) => data?._id == myID) ||
          selectedRoomData
      : selectedRoomData || "";
  }, [myID, participants, selectedRoomData, type]);

  useEffect(() => {
    if (!roomSocket || !roomID || !isRoomDetailsShown) return;

    if (type?.length && type !== "private" && roomID) {
      try {
        setIsLoading(true);

        roomSocket.emit("getRoomMembers", { roomID });
        roomSocket.on("getRoomMembers", (participants) => {
          setGroupMembers(participants);
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        toaster(false, error);
      } finally {
        setIsLoading(false);
      }
    }
    return () => {
      setGroupMembers([]);
    };
  }, [roomSocket, roomID, isRoomDetailsShown, type]);

  useEffect(() => {
    setter({ mockSelectedRoomData: null });
  }, [selectedRoom?._id, setter]);

  const copyText = async () => {
    await copyFn((username && "@" + username) || link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  };

  const openChat = () => {
    const isInRoom = selectedRoom?._id === roomID;
    if (isInRoom) return setter({ isRoomDetailsShown: false });

    const roomHistory = rooms.find(
      (data) =>
        data.name === myID + "-" + _id ||
        data.name === _id + "-" + myID ||
        data._id == roomID
    );

    // const roomSelected: Omit<Room, "_id" | "lastMsgData" | "notSeenCount"> = {
    //   admins: [myData._id, _id],
    //   avatar,
    //   createdAt: Date.now().toString(),
    //   creator: myData._id,
    //   link: (Math.random() * 9999999).toString(),
    //   locations: [],
    //   medias: [],
    //   messages: [],
    //   name: myData._id + "-" + _id,
    //   participants: [myData, selectedRoomData] as (string | User)[],
    //   type: "private",
    //   updatedAt: Date.now().toString(),
    // };

    if (roomHistory) {
      roomSocket?.emit("joining", roomHistory._id);
    } else {
      setter({
        selectedRoom:
          type === "private" ? selectedRoom : (mockSelectedRoomData as Room),
        mockSelectedRoomData: null,
      });
    }

    setter({ isRoomDetailsShown: false });
  };

  const closeRoomDetails = () => {
    if (shouldCloseAll)
      return setter({
        isRoomDetailsShown: false,
        mockSelectedRoomData: null,
        shouldCloseAll: false, // reset the value to default
      });

    if (mockSelectedRoomData) {
      setter({ mockSelectedRoomData: null });
    } else {
      setter({ isRoomDetailsShown: false });
    }
  };

  const isUserOnline = useCallback(
    (userId: string) => {
      return onlineUsers.some((data) => {
        if (data.userID === userId) return true;
      });
    },
    [onlineUsers]
  );

  useEffect(() => {
    const handleOutside = (event: Event) => {
      if (
        !roomDetailsRef.current?.contains(event.target as Node) &&
        isRoomDetailsShown
      ) {
        setter({ isRoomDetailsShown: false });
      }
    };

    document.addEventListener("click", handleOutside);

    return () => {
      document.removeEventListener("click", handleOutside);
    };
  }, [isRoomDetailsShown, setter]);

  return (
    <div
      ref={roomDetailsRef}
      className={`flex-col fixed xl:static h-dvh w-full xl:w-[25%] md:w-[35%] transition-all duration-300 bg-leftBarBg text-white z-full ${
        isRoomDetailsShown ? "xl:flex right-0" : "xl:hidden -right-full "
      }`}
    >
      <div className="bg-chatBg p-3 relative">
        <div className="flex items-center justify-between w-full ">
          <IoClose
            onClick={closeRoomDetails}
            className="size-5 cursor-pointer"
          />
          <PiDotsThreeVerticalBold className="size-5 cursor-pointer" />
        </div>

        <div className="flex items-center gap-3 my-3">
          {avatar ? (
            <Image
              src={avatar}
              className="cursor-pointer object-cover size-[60px] rounded-full"
              width={60}
              height={60}
              alt="avatar"
            />
          ) : (
            <div className="flex-center bg-darkBlue rounded-full size-14 shrink-0 text-center font-vazirBold text-xl">
              {name?.length && name![0]}
            </div>
          )}

          <div className="flex justify-center flex-col gap-1">
            <h3 className="font-bold text-[16px] font-vazirBold text-xl line-clamp-1 overflow-ellipsis">
              {name}
            </h3>

            <div className="font-bold text-[14px] text-darkGray font-vazirBold line-clamp-1 whitespace-normal text-nowrap">
              {type == "private" ? (
                onlineUsers.some((data) => {
                  if (data.userID == _id) return true;
                }) ? (
                  <span className="text-lightBlue">Online</span>
                ) : (
                  "last seen recently"
                )
              ) : (
                `${participants?.length} members ${
                  onlineUsersCount ? ", " + onlineUsersCount + " online" : ""
                }`
              )}
            </div>
          </div>
        </div>

        {type == "private" && (
          <span
            onClick={openChat}
            className="absolute right-3 -bottom-6 size-12 rounded-full cursor-pointer bg-darkBlue flex-center"
          >
            <TbMessage className="size-6" />
          </span>
        )}
      </div>

      <div className="px-3 mt-5 space-y-4">
        <p className="text-lightBlue">Info</p>

        {biography && (
          <div>
            <p className="text-[16px]">{biography}</p>
            <p className="text-darkGray text-[13px]">Bio</p>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div>
            <p className="font-vazirLight text-base">
              {(username && "@" + username) || link}
            </p>
            <p className="text-darkGray text-sm">
              {type === "private" ? "Username" : "Link"}
            </p>
          </div>

          <div
            onClick={copyText}
            className=" cursor-pointer rounded px-2 transition-all duration-300"
          >
            {isCopied ? (
              <p className="text-sm" data-aos="zoom-out">
                Copied
              </p>
            ) : (
              <IoCopyOutline data-aos="zoom-out" className="size-5" />
            )}
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <p>Notifications</p>

            <p className="text-darkGray text-sm">
              {notifications ? "On" : "Off"}
            </p>
          </div>

          <input
            type="checkbox"
            defaultChecked={notifications}
            className="toggle toggle-info toggle-xs mt-1 mr-1 outline-none"
            onChange={() => setNotifications(!notifications)}
          />
        </div>
      </div>

      {type !== "private" && (
        <div className="border-t border-black/40  mt-6">
          {isLoading ? (
            <div className="flex-center mt-10">
              <Loading size="lg" />
            </div>
          ) : (
            <div className="mt-3 space-y-2 ">
              <p className="text-lightBlue px-3">Members</p>
              <div className="flex flex-col mt-3 w-full ch:w-full overflow-y-scroll scroll-w-none">
                {groupMembers?.length
                  ? groupMembers.map((member) => (
                      <RoomCard
                        key={member._id}
                        {...member}
                        myData={myData}
                        isOnline={isUserOnline(member._id)}
                      />
                    ))
                  : null}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoomDetails;
