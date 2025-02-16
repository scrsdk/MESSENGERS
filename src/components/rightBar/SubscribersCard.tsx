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
  isOwner: boolean;
}
const SubscribersCard = (roomData: Partial<User | Room> & Props) => {
  const {
    avatar = "",
    name = "",
    lastName = "",
    _id,
    isOnline,
    myData,
    shouldOpenChat = false,
    isOwner,
  } = roomData as User & Props;
  const setter = useGlobalStore((state) => state.setter);
  const rooms = useUserStore((state) => state.rooms);
  const roomSocket = useSockets((state) => state.rooms);

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
        <div className="flex items-center justify-between">
          <p className="text-base font-vazirBold line-clamp-1 text-ellipsis">
            {name + " " + lastName}
          </p>
          {isOwner && <p className="text-xs text-darkBlue">Owner</p>}
        </div>

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

export default SubscribersCard;
