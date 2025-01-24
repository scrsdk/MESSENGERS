"use client";

import { MdDone } from "react-icons/md";
import { IoCheckmarkDone } from "react-icons/io5";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Room from "@/models/room";
import Message from "@/models/message";
import useUserStore from "@/store/userStore";
import useGlobalVariablesStore from "@/store/globalVariablesStore";
import useSockets from "@/store/useSockets";
import { getTimeFromDate } from "@/utils";
import { FiBookmark } from "react-icons/fi";

const gradients = [
  "bg-gradient-to-b from-blue-400 to-blue-500",
  "bg-gradient-to-b from-pink-400 to-pink-500",
  "bg-gradient-to-b from-green-500 to-green-600",
  "bg-gradient-to-b from-purple-400 via-purple-500 to-purple-600",
  "bg-gradient-to-b from-yellow-300 to-yellow-400",
  "bg-gradient-to-b from-orange-300 to-orange-400",
  "bg-gradient-to-b from-teal-400 to-teal-500",
];

// Global state for color assignments
const colorAssignmentMap = new Map<string, string>();
let nextColorIndex = 0;

const getGradientClass = (identifier: string): string => {
  if (!identifier) return gradients[0];
  if (colorAssignmentMap.has(identifier)) {
    return colorAssignmentMap.get(identifier)!;
  }
  const assignedColor = gradients[nextColorIndex];
  colorAssignmentMap.set(identifier, assignedColor);
  nextColorIndex = (nextColorIndex + 1) % gradients.length;
  return assignedColor;
};
// Define types
declare global {
  interface Window {
    updateCount?: (roomTargetId: string) => void;
  }
}

interface User {
  _id: string;
  avatar?: string;
  name?: string;
}

interface ChatCardProps extends Room {
  lastMsgData: Message;
  notSeenCount: number;
}

export const ChatCard = ({
  _id,
  name: roomName,
  type,
  avatar: roomAvatar,
  lastMsgData: initialLastMsgData,
  notSeenCount: initialNotSeenCount,
  participants,
}: ChatCardProps) => {
  const [draftMessage, setDraftMessage] = useState(() => {
    return localStorage.getItem(_id) || "";
  });
  const [isActive, setIsActive] = useState<boolean>(false);
  const [lastMsgData, setLastMsgData] = useState<Message>(initialLastMsgData);
  const [notSeenCount, setNotSeenCount] = useState<number>(initialNotSeenCount);
  const gradientClass = useMemo(() => getGradientClass(_id), [_id]);

  const { selectedRoom, onlineUsers } = useGlobalVariablesStore(
    (state) => state
  );
  const { _id: myID } = useUserStore((state) => state) || {};
  const { rooms } = useSockets((state) => state);

  const {
    avatar,
    name,
    _id: roomID,
  } = useMemo(() => {
    if (type === "private") {
      const participant = participants.find((data) => data?._id !== myID) as
        | User
        | undefined;
      if (participant) {
        return {
          name: participant.name,
          avatar: participant.avatar,
          _id: participant._id,
        };
      }
      // Fallback to current user if no other participant
      const currentUser = participants.find((data) => data?._id === myID) as
        | User
        | undefined;
      return {
        name: currentUser?.name || "Saved messages",
        avatar: currentUser?.avatar,
        _id: currentUser?._id || "",
      };
    }
    return { name: roomName, avatar: roomAvatar, _id };
  }, [_id, myID, participants, roomAvatar, roomName, type]);

  const isOnline = useMemo(
    () => onlineUsers.some((user) => user.userID === roomID),
    [onlineUsers, roomID]
  );

  const latestMessageTime = getTimeFromDate(lastMsgData?.createdAt);
  const cardMessage =
    lastMsgData?.message || (lastMsgData?.voiceData ? "Audio" : "");

  const joinToRoom = () => {
    setIsActive(true);
    rooms?.emit("joining", _id);
  };

  useEffect(() => {
    const handleUpdateLastMsgData = ({
      msgData,
      roomID: updatedRoomID,
    }: {
      msgData: Message;
      roomID: string;
    }) => {
      if (updatedRoomID === _id) setLastMsgData(msgData);
    };

    const handleSeenMsg = ({ roomID: seenRoomID }: { roomID: string }) => {
      if (seenRoomID === _id) setNotSeenCount((prev) => Math.max(prev - 1, 0));
    };

    const handleNewMessage = ({
      roomID: newMsgRoomID,
      sender,
    }: {
      roomID: string;
      sender: string | { _id: string };
    }) => {
      if (
        newMsgRoomID === _id &&
        ((typeof sender === "string" && sender !== myID) ||
          (typeof sender === "object" && sender?._id !== myID))
      ) {
        setNotSeenCount((prev) => prev + 1);
      }
    };

    setIsActive(selectedRoom?._id === _id);

    rooms?.on("updateLastMsgData", handleUpdateLastMsgData);
    rooms?.on("seenMsg", handleSeenMsg);
    rooms?.on("newMessage", handleNewMessage);

    return () => {
      rooms?.off("updateLastMsgData", handleUpdateLastMsgData);
      rooms?.off("seenMsg", handleSeenMsg);
      rooms?.off("newMessage", handleNewMessage);
    };
  }, [_id, myID, rooms, selectedRoom?._id]);

  useEffect(() => {
    window.updateCount = (roomTargetId: string) => {
      if (roomTargetId === roomID)
        setNotSeenCount((prev) => Math.max(prev - 1, 0));
    };

    return () => {
      delete window.updateCount;
    };
  }, [roomID]);

  useEffect(() => {
    setDraftMessage(localStorage.getItem(_id) || "");
  }, [_id, selectedRoom?._id]);

  useEffect(() => {
    setNotSeenCount(initialNotSeenCount);
  }, [initialNotSeenCount]);

  return (
    <div
      onClick={joinToRoom}
      className={
        "flex items-center gap-3 px-1 relative h-16 cursor-pointer transition-all duration-300 rounded overflow-hidden "
      }
    >
      {roomID === myID ? (
        <div
          className={`size-12 shrink-0 bg-cyan-700  rounded-full flex-center text-white text-3xl`}
        >
          <FiBookmark />
        </div>
      ) : avatar ? (
        <Image
          className="size-12 bg-center object-cover rounded-full shrink-0"
          quality={100}
          src={avatar}
          alt="avatar"
        />
      ) : (
        <div
          className={`size-12 shrink-0 ${gradientClass} rounded-full flex-center  text-white text-xl`}
        >
          {name?.charAt(0)}
        </div>
      )}

      {type === "private" && isOnline && (
        <span
          className={`absolute bg-teal-500 transition-all duration-300  size-3 left-10 bottom-2.5 rounded-full border-2 border-black`}
        ></span>
      )}

      <div className="flex flex-col w-full gap-1 text-darkGray text-sm">
        <div className="flex items-center justify-between">
          <p className="text-white text-[16px] font-vazirBold line-clamp-1">
            {roomID === myID ? "Saved messages" : name}
          </p>
          <div className="flex gap-1 items-center">
            {lastMsgData?.sender === myID ? (
              <>
                {lastMsgData?.seen?.length ? (
                  <IoCheckmarkDone className="size-5 text-lightBlue" />
                ) : (
                  <MdDone className="size-5 text-lightBlue" />
                )}
              </>
            ) : null}
            <p className="whitespace-nowrap">{latestMessageTime || null}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="line-clamp-1 w-[80%]">
            {draftMessage ? (
              <span className="text-red-400">
                Draft: <span className="text-darkGray">{draftMessage}</span>
              </span>
            ) : (
              `${cardMessage}`
            )}
          </div>

          <div className="flex items-center gap-2">
            {notSeenCount > 0 && (
              <div
                data-aos="zoom-in"
                className="flex-center text-center w-min px-2 bg-lightBlue text-white rounded-full"
              >
                {notSeenCount}
              </div>
            )}

            {lastMsgData?.pinnedAt && (
              <Image
                key={lastMsgData.pinnedAt}
                src="/shapes/pin.svg"
                width={15}
                height={15}
                className="size-4 bg-center"
                alt="pin shape"
                priority
              />
            )}
          </div>
        </div>
      </div>

      <span
        className={`absolute flex items-center ${
          isActive ? "opacity-100" : "opacity-0"
        } transition-all activeChat inset-0 size-full bg-white/[6.05%]`}
      ></span>
    </div>
  );
};

// "use client";
// import { MdDone } from "react-icons/md";
// import { IoCheckmarkDone } from "react-icons/io5";
// import Image from "next/image";
// import { useEffect, useMemo, useState } from "react";
// import Room from "@/models/room";
// import Message from "@/models/message";
// import useUserStore from "@/store/userStore";
// import useGlobalVariablesStore from "@/store/globalVariablesStore";
// import useSockets from "@/store/useSockets";
// import { getTimeFromDate } from "@/utils";

// export const ChatCard = ({
//   _id,
//   name: roomName,
//   type,
//   avatar: roomAvatar,
//   lastMsgData: lastMsgDataProp,
//   notSeenCount: currentNotSeenCount,
//   participants,
// }: Room & { lastMsgData: Message; notSeenCount: number }) => {
//   const [draftMessage, setDraftMessage] = useState("");
//   const [isActive, setIsActive] = useState(false);
//   const [lastMsgData, setLastMsgData] = useState<Message>(lastMsgDataProp);
//   const [notSeenCount, setNotSeenCount] = useState(currentNotSeenCount);
//   const { selectedRoom, onlineUsers } = useGlobalVariablesStore(
//     (state) => state
//   );
//   const { _id: myID } = useUserStore((state) => state) || "";
//   const { rooms } = useSockets((state) => state);

//   const {
//     avatar,
//     name,
//     _id: roomID,
//   } = useMemo(() => {
//     // if type is private, we should view the user infos instead of room infos
//     return type == "private"
//       ? // if we couldn't find the participant id that is not equal to myID, so its the saved msgs room
//         participants.find((data: any) => data?._id !== myID) ||
//           participants.find((data: any) => data?._id === myID)
//       : { name: roomName, avatar: roomAvatar };
//   }, [myID, participants, roomAvatar, roomName, type]);

//   const isOnline = onlineUsers.some((data) => {
//     if (data.userID === roomID) return true;
//   });
//   const latestMessageTime = getTimeFromDate(lastMsgData?.createdAt);
//   const cardMessage = lastMsgData?.message
//     ? lastMsgData?.message
//     : lastMsgData?.voiceData
//     ? "Audio"
//     : "";

//   const joinToRoom = () => {
//     setIsActive(true);
//     rooms?.emit("joining", _id);
//   };

//   useEffect(() => {
//     const handleUpdateLastMsgData = ({
//       msgData,
//       roomID,
//     }: {
//       msgData: Message;
//       roomID: string;
//     }) => {
//       if (_id === roomID && msgData) {
//         setLastMsgData(msgData);
//       }
//     };

//     const handleSeenMsg = ({ roomID }: { roomID: string }) => {
//       if (roomID === _id) {
//         setNotSeenCount((prev) => prev - 1);
//         // globalVarSetter({ forceRender: !forceRender });
//       }
//     };

//     const handleNewMessage = ({
//       roomID,
//       sender,
//     }: {
//       roomID: string;
//       sender: string | { _id: string };
//     }) => {
//       if (roomID === _id) {
//         if (
//           (typeof sender === "string" && sender !== myID) ||
//           (typeof sender == "object" && "_id" in sender && sender?._id) !== myID
//         ) {
//           setNotSeenCount((prev) => prev + 1);
//         }
//         // globalVarSetter({ forceRender: !forceRender });
//       }
//     };

//     setIsActive(selectedRoom?._id === _id);

//     rooms?.on("updateLastMsgData", handleUpdateLastMsgData);
//     rooms?.on("seenMsg", handleSeenMsg);
//     rooms?.on("newMessage", handleNewMessage);

//     return () => {
//       rooms?.off("updateLastMsgData", handleUpdateLastMsgData);
//       rooms?.off("seenMsg", handleSeenMsg);
//       rooms?.off("newMessage", handleNewMessage);
//     };
//   }, [_id, selectedRoom?._id, myID, rooms]);

//   useEffect(() => {
//     setDraftMessage(localStorage.getItem(_id) || "");
//   }, [localStorage.getItem(_id), _id]);

//   useEffect(() => {
//     window.updateCount = (roomTargetId: string) => {
//       if (roomID != roomTargetId) return;
//       setNotSeenCount(notSeenCount - 1);
//     };
//   }, [notSeenCount, roomID]);

//   useEffect(() => setNotSeenCount(currentNotSeenCount), [currentNotSeenCount]);

//   return (
//     <div
//       onClick={joinToRoom}
//       className={`flex items-center gap-3 relative h-[70px] cursor-pointer transition-all duration-300 rounded overflow-hidden ${
//         isActive && "px-3"
//       }`}
//     >
//       <>
//         {avatar ? (
//           <Image
//             className={`size-[50px] bg-center object-cover rounded-full shrink-0`}
//             width={50}
//             height={50}
//             quality={100}
//             src={avatar}
//             alt="avatar"
//           />
//         ) : (
//           <div className="size-[50px] shrink-0 bg-darkBlue rounded-full flex-center text-bold text-center text-white text-2xl">
//             {name?.length && name[0]}
//           </div>
//         )}

//         {type === "private" && isOnline ? (
//           <span
//             className={`absolute bg-lightBlue transition-all duration-300 ${
//               isActive ? "left-12" : "left-9"
//             } size-3 bottom-3 rounded-full border-[2px] border-chatBg`}
//           ></span>
//         ) : null}
//       </>

//       <div className="flex flex-col w-full ch:w-full gap-1 text-darkGray text-[14px]">
//         <div className="flex items-center justify-between">
//           <p className="text-white  text-[16px] font-vazirBold line-clamp-1">
//             {roomID == myID ? "Saved messages" : name}
//           </p>
//           <div className="flex gap-1 items-center">
//             {(lastMsgData?.sender as any) === myID ||
//             lastMsgData?.sender?._id === myID ? (
//               <>
//                 {lastMsgData?.seen.length || lastMsgDataProp?.seen?.length ? (
//                   <IoCheckmarkDone className="size-5 text-darkBlue" />
//                 ) : (
//                   <MdDone className="size-5 text-darkBlue" />
//                 )}
//               </>
//             ) : null}
//             <p className="whitespace-nowrap">{latestMessageTime || null}</p>
//           </div>
//         </div>

//         <div className="flex items-center justify-between">
//           <div className="line-clamp-1 w-[80%]">
//             {draftMessage?.length ? (
//               <span className="text-red-500">
//                 Draft: <span className="text-darkGray">{draftMessage}</span>
//               </span>
//             ) : (
//               `${
//                 (lastMsgData?.sender as any) === myID ||
//                 lastMsgData?.sender._id == myID
//                   ? "you: "
//                   : ""
//               }${cardMessage}` || ""
//             )}
//           </div>

//           <div className="flex items-center justify-between gap-2">
//             {notSeenCount > 0 ? (
//               <div
//                 data-aos="zoom-in"
//                 className="flex-center text-center w-min px-2 bg-darkBlue text-white rounded-full"
//               >
//                 {notSeenCount}
//               </div>
//             ) : null}

//             {lastMsgData?.pinnedAt ? (
//               <div key={lastMsgData?.pinnedAt} data-aos="zoom-in">
//                 <Image
//                   priority
//                   src="/shapes/pin.svg"
//                   width={17}
//                   height={17}
//                   className="size-4 bg-center"
//                   alt="pin shape"
//                 />
//               </div>
//             ) : null}
//           </div>
//         </div>
//       </div>

//       <span
//         className={`absolute flex items-center ${
//           isActive ? "opacity-100" : "opacity-0"
//         } transition-all activeChat inset-0 size-full bg-white/[6.05%]`}
//       ></span>
//     </div>
//   );
// };
