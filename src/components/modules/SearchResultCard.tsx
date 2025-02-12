import Room from "@/models/room";
import User from "@/models/user";
import useGlobalStore from "@/store/globalStore";
import useUserStore from "@/store/userStore";
import useSockets from "@/store/useSockets";
import { scrollToMessage } from "@/utils";
import Image from "next/image";

interface Props {
  myData: User;
  query: string;
}

const highlightChars = (query: string, name: string) => {
  const lowerCaseQuery = query.toLowerCase();
  const lowerCaseName = name.toLowerCase();

  const isQueryIncludesInName = lowerCaseName.includes(lowerCaseQuery);
  const startToHighlightIndex = lowerCaseName.indexOf(lowerCaseQuery);
  const endToHighlightIndex = startToHighlightIndex + lowerCaseQuery.length - 1;

  return isQueryIncludesInName ? (
    name?.split("").map((char, index) => {
      const isInHighlightRange =
        index >= startToHighlightIndex && index <= endToHighlightIndex;
      return (
        <span
          key={index}
          className={isInHighlightRange ? "text-lightBlue" : ""}
        >
          {char}
        </span>
      );
    })
  ) : (
    <span>{name}</span>
  );
};

const SearchResultCard = (
  roomData: Partial<Room & { findBy?: keyof Room }> & Props
) => {
  const { avatar, name, _id, myData, findBy = null, query } = roomData;
  const { setter, isChatPageLoaded } = useGlobalStore((state) => state);
  const rooms = useUserStore((state) => state.rooms);
  const roomSocket = useSockets((state) => state.rooms);

  const openChat = () => {
    const roomHistory = rooms.find(
      (data) =>
        data._id === _id || // For channel & groups
        data.name === myData._id + "-" + _id || // for private chats
        data.name === _id + "-" + myData._id // for private chats
    );

    const selectedRoom: Omit<Room, "lastMsgData" | "notSeenCount"> = {
      admins: [myData._id, _id!],
      avatar: avatar ? avatar : "",
      createdAt: Date.now().toString(),
      creator: myData._id,
      link: (Math.random() * 9999999).toString(),
      locations: [],
      medias: [],
      messages: [],
      name: myData._id + "-" + _id,
      participants: [myData, roomData] as User[],
      type: "private",
      updatedAt: Date.now().toString(),
      _id: _id ?? myData._id,
    };

    roomSocket?.emit(
      "joining",
      roomHistory?._id || roomData?._id,
      selectedRoom
    );
    setter({ isRoomDetailsShown: false, selectedRoom: selectedRoom as Room });

    setTimeout(
      () => {
        if (roomData.messages?.length)
          scrollToMessage(roomData.messages[0]._id);
      },
      isChatPageLoaded ? 800 : 2000
    );
  };

  return (
    <div
      onClick={openChat}
      className="flex items-center gap-2 cursor-pointer overflow-x-hidden border-b border-black/15 hover:bg-white/5 transition-all duration-200"
    >
      {avatar ? (
        <Image
          src={avatar}
          className="cursor-pointer object-cover size-11 rounded-full shrink-0"
          width={50}
          height={50}
          alt="avatar"
        />
      ) : (
        <div className="flex-center bg-darkBlue rounded-full size-11 shrink-0 text-center font-vazirBold text-lg">
          {name ? name[0] : ""}
        </div>
      )}
      <div className="flex flex-col justify-between w-full py-2">
        <p className="text-base font-vazirBold line-clamp-1 text-ellipsis break-words">
          {findBy == "participants" || findBy == "name"
            ? highlightChars(query, name ? name : "")
            : name}
        </p>

        <p className="text-sm text-darkGray line-clamp-1 text-ellipsis break-words">
          {findBy == "messages" && roomData.messages?.length
            ? highlightChars(query, roomData.messages[0].message)
            : "last seen recently"}
        </p>
      </div>
    </div>
  );
};

export default SearchResultCard;
