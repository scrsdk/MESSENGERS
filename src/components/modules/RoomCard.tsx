import Room from "@/models/room";
import User from "@/models/user";
import useGlobalStore from "@/store/globalStore";
import useUserStore from "@/store/userStore";
import useSockets from "@/store/useSockets";
import Image from "next/image";

interface Props {
  isOnline?: boolean;
  myData: User;
  shouldOpenChat?: boolean;
}
const RoomCard = (roomData: Partial<User | Room> & Props) => {
  const {
    avatar,
    name,
    _id,
    isOnline,
    myData,
    shouldOpenChat = false,
  } = roomData!;
  const setter = useGlobalStore((state) => state.setter);
  const rooms = useUserStore((state) => state.rooms);
  const roomSocket = useSockets((state) => state.rooms);

  const showProfile = () => {
    setter({
      mockSelectedRoomData: roomData as Room,
    });
  };

  const openChat = () => {
    const roomHistory = rooms.find(
      (data) =>
        data._id === _id || // For channel & groups
        data.name === myData._id + "-" + _id || // for private chats
        data.name === _id + "-" + myData._id // for private chats
    );

    const selectedRoom: Omit<Room, "_id" | "lastMsgData" | "notSeenCount"> = {
      admins: [myData._id, _id!],
      avatar: avatar!,
      createdAt: Date.now().toString(),
      creator: myData._id,
      link: (Math.random() * 9999999).toString(),
      locations: [],
      medias: [],
      messages: [],
      name: myData._id + "-" + _id,
      participants: [myData, roomData] as string[] | User[],
      type: "private",
      updatedAt: Date.now().toString(),
    };

    roomSocket?.emit(
      "joining",
      roomHistory?._id || roomData?._id,
      selectedRoom
    );

    setter({ isRoomDetailsShown: false, selectedRoom: selectedRoom as Room });
  };

  return (
    <div
      onClick={shouldOpenChat ? openChat : showProfile}
      className="flex items-center gap-2 px-2 cursor-pointer border-b border-black/15 hover:bg-white/5 transition-all duration-200"
    >
      {avatar ? (
        <Image
          src={avatar}
          className="cursor-pointer object-cover size-11 rounded-full"
          width={44}
          height={44}
          alt="avatar"
        />
      ) : (
        <div className="flex-center bg-darkBlue rounded-full size-11 shrink-0 text-center font-bold text-lg">
          {name![0]}
        </div>
      )}
      <div className="flex flex-col justify-between  w-full py-2">
        <p className="text-base font-vazirBold line-clamp-1 text-ellipsis">
          {name}
        </p>

        <p className="text-sm text-darkGray">
          {isOnline ? (
            <span className="text-lightBlue">Online</span>
          ) : (
            "last seen recently"
          )}
        </p>
      </div>
    </div>
  );
};

export default RoomCard;
