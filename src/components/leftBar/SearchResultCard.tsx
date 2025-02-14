import Room from "@/models/room";
import User from "@/models/user";
import useGlobalStore from "@/store/globalStore";
import useUserStore from "@/store/userStore";
import useSockets from "@/store/useSockets";
import { scrollToMessage } from "@/utils";
import Image from "next/image";
import { FiBookmark } from "react-icons/fi";

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
  const { isChatPageLoaded, setter } = useGlobalStore((state) => state);
  const { rooms, _id: myID } = useUserStore((state) => state);
  const roomSocket = useSockets((state) => state.rooms);
  console.log(roomData.avatar);

  const openChat = () => {
    const roomHistory = rooms.find(
      (data) =>
        data._id === _id || // For channel & groups
        data.name === myData._id + "-" + _id || // for private chats
        data.name === _id + "-" + myData._id // for private chats
    );

    const userRoom: Omit<Room, "_id" | "lastMsgData" | "notSeenCount"> = {
      admins: [myData._id, _id!],
      avatar: "",
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
    };

    if (roomHistory) {
      roomSocket?.emit("joining", roomHistory?._id);

      setTimeout(
        () => {
          if (roomData.messages?.length)
            scrollToMessage(roomData.messages[0]._id);
        },
        isChatPageLoaded ? 1000 : 6000
      );
    } else {
      setter({ isRoomDetailsShown: false, selectedRoom: userRoom as Room });
      roomSocket?.emit("joining", _id);
    }
  };

  const openSavedMessages = () => {
    const savedMessageRoomID = rooms.find(
      (room) => room.type == "private" && room.participants.length == 1
    )?._id;
    roomSocket?.emit("joining", savedMessageRoomID);
  };
  return (
    <div
      onClick={_id === myID ? openSavedMessages : openChat}
      className="flex items-center gap-2 cursor-pointer overflow-x-hidden border-b border-black/15 hover:bg-white/5 transition-all duration-200"
    >
      {_id === myID ? (
        <div
          className={`size-11 bg-cyan-700 shrink-0 rounded-full flex-center text-white text-2xl`}
        >
          <FiBookmark />
        </div>
      ) : avatar ? (
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
            : _id === myID
            ? "Saved messages"
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
