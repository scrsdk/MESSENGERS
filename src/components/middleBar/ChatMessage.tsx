import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
} from "react";
import useGlobalStore from "@/store/globalStore";
import useSockets from "@/store/useSockets";
import ScrollToBottom from "../templates/ScrollToBottom";
import { IoIosArrowDown } from "react-icons/io";
import useScrollChange from "@/hook/useScrollChange";
import MessageModel from "@/models/message";
import useUserStore from "@/store/userStore";
import useScrollMessage from "@/hook/chatMessage/useScrollMessage";
import useMessages from "@/hook/chatMessage/useMessages";
import useTyping from "@/hook/chatMessage/useTyping";
import useRoomEvents from "@/hook/chatMessage/useRoomEvents";
import MessageList from "./MessageList";

interface ChatMessageProps {
  replayData: boolean;
  editData: boolean;
  setTypings: React.Dispatch<React.SetStateAction<string[]>>;
  setEditData: React.Dispatch<React.SetStateAction<MessageModel | null>>;
  setReplayData: React.Dispatch<React.SetStateAction<string | null>>;
  pinnedMessages: MessageModel[];
  isLoaded: boolean;
  setIsLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  _id: string;
}

const ChatMessage = ({
  setTypings,
  setEditData,
  setReplayData,
  pinnedMessages,
  isLoaded,
  setIsLoaded,
  _id,
  replayData,
  editData,
}: ChatMessageProps) => {
  const [isLastMsgInView, setIsLastMsgInView] = useState(false);
  const { rooms } = useSockets((state) => state);
  const { selectedRoom, setter } = useGlobalStore((state) => state) || {};
  const { _id: roomID, messages, type } = selectedRoom!;
  const {
    _id: myID,
    name: myName,
    setter: userDataUpdater,
    rooms: userRooms,
    roomMessageTrack,
  } = useUserStore((state) => state);

  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const lastScrollPos = useRef(0);
  const ringAudioRef = useRef<HTMLAudioElement>(null);
  const dateRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeDate = useRef<string | null>(null);
  const isScrolling = useRef(false);

  const [isProgrammaticScroll, setIsProgrammaticScroll] = useState(false);
  const { canShow } = useScrollChange(messageContainerRef?.current);

  const activeDateElement = document.querySelector(
    `[data-date='${activeDate.current}']`
  );

  const playRingSound = useCallback(() => {
    if (ringAudioRef.current) {
      ringAudioRef.current.currentTime = 0;
      ringAudioRef.current.play();
    }
  }, []);

  useEffect(() => {
    setter({ isChatPageLoaded: true });
    return () => {
      setIsLoaded(false);
      setTypings([]);
      rooms?.emit("updateLastMsgPos", {
        roomID: _id,
        scrollPos: lastScrollPos.current,
        userID: myID,
      });
    };
  }, [roomID, _id, rooms, myID, setter, setIsLoaded, setTypings]);

  useEffect(() => {
    const track = roomMessageTrack?.find((track) => track.roomId === _id);
    if (track && messageContainerRef.current) {
      messageContainerRef.current.scrollTop = track.scrollPos;
    }
  }, [_id, roomMessageTrack]);

  const checkIsLastMsgInView = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      lastScrollPos.current = e.currentTarget.scrollTop;
      const threshold = 5;
      const isInView =
        e.currentTarget.scrollHeight -
          e.currentTarget.scrollTop -
          e.currentTarget.clientHeight <=
        threshold;
      setIsLastMsgInView(isInView);
    },
    []
  );

  const { lastMsgRef, manageScroll } = useScrollMessage({
    setIsProgrammaticScroll,
    messages: selectedRoom?.messages,
    myID,
    isLastMsgInView,
  });

  useEffect(() => {
    if (replayData || editData) {
      manageScroll();
    }
  }, [replayData, editData, manageScroll]);

  useEffect(() => {
    manageScroll();
  }, [manageScroll]);

  const markAsLoaded = useCallback(() => setIsLoaded(true), [setIsLoaded]);

  useEffect(() => {
    if (!isLoaded && _id && messages?.length) {
      const lastSeenMsg = [...messages]
        .reverse()
        .find((msg) => msg.sender._id === myID || msg.seen.includes(myID));
      if (lastSeenMsg) {
        const lastSeenMsgElem = document.getElementsByClassName(
          lastSeenMsg._id
        )[0];
        if (lastSeenMsgElem) {
          lastSeenMsgElem.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          markAsLoaded();
        }
      }
    }
  }, [messages, isLoaded, myID, _id, markAsLoaded]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      rooms?.emit("updateLastMsgPos", {
        roomID,
        scrollPos: lastScrollPos.current,
        userID: myID,
        shouldEmitBack: false,
      });
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [myID, roomID, rooms]);

  useMessages({ rooms, roomID, myID, setter, playRingSound });
  useTyping({ rooms, roomID, myName, setTypings });
  useRoomEvents({
    rooms,
    selectedRoom,
    setter,
    myID,
    userDataUpdater,
    userRooms,
  });

  const pinMessage = useCallback(
    (id: string) => {
      const isLastMessage = messages?.at(-1)?._id === id;
      rooms?.emit("pinMessage", id, selectedRoom?._id, isLastMessage);
    },
    [messages, rooms, selectedRoom]
  );

  const notSeenMessages = useMemo(() => {
    let count = 0;
    if (messages?.length) {
      const msgs = messages.filter(
        (msg) => msg.sender?._id !== myID && !msg.seen?.includes(myID)
      );
      count = msgs.length;
    }
    return count;
  }, [messages, myID]);

  const handleScroll = useCallback(() => {
    isScrolling.current = true;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      isScrolling.current = false;
    }, 1500);
  }, []);

  useEffect(() => {
    const parentElement = messageContainerRef.current;
    if (parentElement) {
      parentElement.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (parentElement) {
        parentElement.removeEventListener("scroll", handleScroll);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  useEffect(() => {
    const currentChatRefs = Object.fromEntries(
      Object.entries(dateRefs.current).filter(([date]) =>
        messages.some((msg) => msg.createdAt === date)
      )
    );
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleDates = entries
          .map((entry) => ({
            date: entry.target.getAttribute("data-date"),
            top: entry.target.getBoundingClientRect().top,
            isIntersecting: entry.isIntersecting,
          }))
          .filter((item) => item.isIntersecting && item.top >= 0)
          .sort((a, b) => a.top - b.top);
        if (visibleDates.length > 0) {
          const topDate = visibleDates[0].date;
          if (activeDate.current !== topDate) {
            activeDate.current = topDate;
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px 0% 0px" }
    );
    Object.values(currentChatRefs).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => {
      Object.values(currentChatRefs).forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, [activeDate, messages, roomID, dateRefs]);

  const scrollToBottom = useCallback(() => {
    lastMsgRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [lastMsgRef]);

  return (
    <div
      onScroll={checkIsLastMsgInView}
      ref={messageContainerRef}
      id="chatContainer"
      className={`mt-auto px-0.5 overflow-x-hidden overflow-y-auto scroll-w-none ${
        pinnedMessages?.length ? "pt-12" : ""
      } ${replayData || editData ? "pb-13" : "pb-1"} ${
        messages.length <= 5 && "pt-52"
      }`}
    >
      {activeDate.current && (
        <div
          onClick={() =>
            activeDateElement?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            })
          }
          className={`absolute ${
            pinnedMessages.length ? "top-28" : "top-[4rem]"
          } left-1/2 text-xs bg-gray-800 w-fit mx-auto text-center rounded-2xl py-1 my-2 px-3 cursor-pointer -translate-x-1/2 text-white z-10 transition-all duration-300 ${
            isScrolling.current && !isProgrammaticScroll
              ? "transform translate-y-0"
              : "transform -translate-y-10"
          }`}
        >
          {activeDate.current}
        </div>
      )}

      <MessageList
        messages={messages}
        myID={myID}
        type={type}
        activeDate={activeDate.current}
        dateRefs={dateRefs}
        lastMsgRef={lastMsgRef}
        setEditData={setEditData}
        setReplayData={setReplayData}
        pinMessage={pinMessage}
      />

      <ScrollToBottom count={notSeenMessages} scrollToBottom={scrollToBottom} />

      <div
        onClick={() =>
          messageContainerRef.current?.scrollTo({
            top: messageContainerRef.current.scrollHeight,
            behavior: "smooth",
          })
        }
        className={`${
          !notSeenMessages && canShow && !isLastMsgInView
            ? "right-1.5"
            : "-right-12"
        } transition-all duration-300 size-10 absolute bottom-25 bg-[#2E323F] cursor-pointer rounded-full flex items-center justify-center`}
      >
        <IoIosArrowDown className="size-5 text-white" />
      </div>
      <audio
        ref={ringAudioRef}
        className="hidden invisible opacity-0"
        src="/files/sfx.mp3"
        controls={false}
      ></audio>
    </div>
  );
};

export default memo(ChatMessage);