"use client";

import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import Image from "next/image";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import MessageSender from "./MessageInput";
import JoinToRoom from "../templates/JoinToRoom";
import useUserStore from "@/store/userStore";
import useGlobalStore from "@/store/globalStore";
import useSockets from "@/store/useSockets";
import MessageModel from "@/models/message";
import { FiBookmark } from "react-icons/fi";
import Loading from "../modules/ui/Loading";

const PinnedMessages = lazy(
  () => import("@/components/middleBar/PinnedMessages")
);
const ChatMessage = lazy(() => import("./ChatMessage"));

export interface msgDate {
  date: string;
  usedBy: string;
}

const ChatContent = () => {
  const { _id: myID, name: myName } = useUserStore((state) => state);
  const { rooms } = useSockets((state) => state);
  const { selectedRoom, onlineUsers, isRoomDetailsShown, setter } =
    useGlobalStore((state) => state) || {};

  const [typings, setTypings] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showRoomOptions, setShowRoomOptions] = useState(false);
  const [replayData, setReplayData] = useState<string | null>(null);
  const [editData, setEditData] = useState<MessageModel | null>(null);

  const { _id: roomID, messages, type, participants } = selectedRoom!;

  // Avatar, name and _id information from room or user information (in private mode)
  const {
    avatar = "",
    name = "",
    _id,
  } = useMemo(() => {
    const roomOrUser =
      type === "private"
        ? participants?.find(
            (data) => typeof data !== "string" && data?._id !== myID
          ) ||
          participants?.find(
            (data) => typeof data !== "string" && data?._id === myID
          ) ||
          selectedRoom
        : selectedRoom || null;

    if (roomOrUser && typeof roomOrUser !== "string") {
      return {
        avatar: roomOrUser.avatar || "",
        name: roomOrUser.name || "",
        _id: roomOrUser._id || "",
      };
    }
    return { avatar: "", name: "", _id: "" };
  }, [myID, participants, selectedRoom, type]);

  // Calculate the replay message based on replayData (which is the message ID)
  const replayDataMsg = useMemo(() => {
    return messages?.find((msg) => msg._id === replayData);
  }, [messages, replayData]);

  // Calculate pinned messages from messages
  const pinnedMessages = useMemo(() => {
    return messages?.filter((msg) => msg.pinnedAt) || [];
  }, [messages]);

  //Calculate the number of online members (to display in the header)
  const onlineMembersCount = useMemo(() => {
    if (!onlineUsers?.length || !participants?.length) return 0;
    return participants.filter((pId) =>
      onlineUsers.some((data) => data.userID === pId)
    ).length;
  }, [onlineUsers, participants]);

  // Define an event handler for returning (back) from the room
  const handleBack = useCallback(() => {
    setter({ selectedRoom: null, isRoomDetailsShown: false });
  }, [setter]);

  // Open room settings (options drop-down)
  const openChatSetting = useCallback(() => {
    setShowRoomOptions(true);
  }, []);

  // Event handler for receiving pinned message
  const handlePinMessage = useCallback(
    (msgId: string) => {
      const updatedMessages = messages.map((msg) =>
        msg._id === msgId
          ? { ...msg, pinnedAt: msg.pinnedAt ? null : String(Date.now()) }
          : msg
      );
      setter({
        selectedRoom: {
          ...selectedRoom!,
          messages: updatedMessages,
        },
      });
    },
    [messages, selectedRoom, setter]
  );

  // Register an event listener for the "pinMessage" event from the server
  useEffect(() => {
    rooms?.on("pinMessage", handlePinMessage);
    return () => {
      rooms?.off("pinMessage", handlePinMessage);
    };
  }, [rooms, handlePinMessage]);

  return (
    <div data-aos="fade-right" className="relative h-dvh flex flex-col">
      {/* Chat Header */}
      <div
        id="chatContentHeader"
        className="flex items-center justify-between h-17 p-2 sticky top-0 border-b border-white/5 bg-leftBarBg"
        style={{ zIndex: "20" }}
      >
        <div className="flex items-center gap-5">
          <IoMdArrowRoundBack
            onClick={handleBack}
            className="cursor-pointer size-6 text-white/80"
          />

          <div
            onClick={() => setter({ isRoomDetailsShown: !isRoomDetailsShown })}
            className="flex items-start cursor-pointer gap-3"
          >
            {_id === myID ? (
              <div className="size-11 bg-cyan-700 rounded-full flex-center text-white text-2xl">
                <FiBookmark />
              </div>
            ) : avatar ? (
              <Image
                src={avatar}
                width={50}
                height={50}
                className="size-11 mt-auto object-center object-cover rounded-full"
                alt="avatar"
              />
            ) : (
              <div className="flex-center bg-gradient-to-b from-blue-400 to-blue-500 rounded-full size-11 text-center text-xl">
                {name?.length && name[0]}
              </div>
            )}

            <div className="flex justify-center flex-col gap-1">
              <h3 className="font-bold text-[16px] font-vazirBold">
                {_id === myID ? "Saved messages" : name}
              </h3>

              <div className="font-bold text-[14px] text-darkGray font-vazirBold line-clamp-1 whitespace-normal text-nowrap">
                {typings.length &&
                typings.filter((tl) => tl !== myName).length ? (
                  <div className="text-lightBlue whitespace-normal line-clamp-1">
                    {typings.join(", ") +
                      (typings.length > 1 ? " are" : " is") +
                      " typing "}
                    <span className="animate-ping font-extrabold font-vazirBold">
                      ...
                    </span>
                  </div>
                ) : (
                  <>
                    {type === "private" ? (
                      onlineUsers.some((data) => data.userID === _id) ? (
                        <span className="text-lightBlue">Online</span>
                      ) : (
                        "last seen recently"
                      )
                    ) : (
                      participants.length +
                      " members " +
                      (onlineMembersCount
                        ? ", " + onlineMembersCount + " online"
                        : "")
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <div className="size-11 relative rounded-full flex-center">
            <PiDotsThreeVerticalBold onClick={openChatSetting} />
            {showRoomOptions && (
              <div className="absolute top-1/2 w-min inset-x-0">
                {/* Settings dropdown coming soon */}
              </div>
            )}
          </div>
        </div>

        {pinnedMessages.length > 0 && (
          <Suspense>
            <PinnedMessages key={roomID} pinnedMessages={pinnedMessages} />
          </Suspense>
        )}
      </div>

      {/* Chat Message */}
      <Suspense
        fallback={
          <div className="size-full flex-center">
            <Loading size="lg" />
          </div>
        }
      >
        <ChatMessage
          setTypings={setTypings}
          pinnedMessages={pinnedMessages}
          setEditData={setEditData}
          setReplayData={setReplayData}
          isLoaded={isLoaded}
          _id={_id}
          setIsLoaded={setIsLoaded}
        />
      </Suspense>

      {/* If the room type is private or the user is a member of a group, MessageSender is displayed */}
      {type === "private" || (participants as string[]).includes(myID) ? (
        <MessageSender
          replayData={replayDataMsg}
          editData={editData!}
          closeEdit={() => setEditData(null)}
          closeReplay={() => setReplayData(null)}
        />
      ) : (
        <JoinToRoom roomData={selectedRoom!} roomSocket={rooms} userID={myID} />
      )}
      {isRoomDetailsShown && (
        <span
          onClick={() => setter({ isRoomDetailsShown: false })}
          className="inset-0 xl:static absolute transition-all duration-200 "
        ></span>
      )}
    </div>
  );
};

export default ChatContent;
