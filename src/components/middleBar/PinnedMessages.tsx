import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Message from "@/models/message";
import useGlobalStore from "@/store/globalStore";
import { scrollToMessage } from "@/utils";
import { TiPinOutline } from "react-icons/ti";

interface PinnedMessagesProps {
  pinnedMessages: Message[];
}

const PinnedMessages: React.FC<PinnedMessagesProps> = ({
  pinnedMessages: messages,
}) => {
  const isRoomDetailsShown = useGlobalStore(
    (state) => state.isRoomDetailsShown
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activePinMsg, setActivePinMsg] = useState(0);

  // Compute the sorted pinned messages (only messages with a pinnedAt value)
  const pinMessages = useMemo(() => {
    return messages
      .filter((msg) => msg.pinnedAt)
      .sort((a, b) => Number(b.pinnedAt) - Number(a.pinnedAt));
  }, [messages]);

  // Ensure the active index is valid when pinMessages changes
  useEffect(() => {
    if (activePinMsg >= pinMessages.length) {
      setActivePinMsg(0);
    }
  }, [activePinMsg, pinMessages.length]);

  // Updates the active pinned message index (rotating backwards)
  const updateActivePinMsgIndex = useCallback(() => {
    setActivePinMsg(
      (prev) => (prev - 1 + pinMessages.length) % pinMessages.length
    );
  }, [pinMessages.length]);

  // Scroll to the active pinned message and update the active index
  const scrollToPinMessage = useCallback(() => {
    if (!pinMessages.length) return;
    const targetId = pinMessages[activePinMsg]?._id;
    if (targetId) {
      scrollToMessage(targetId, "smooth", "center");
      updateActivePinMsgIndex();
    }
  }, [activePinMsg, pinMessages, updateActivePinMsgIndex]);

  // Update the container’s dimensions based on layout and window size changes.
  useLayoutEffect(() => {
    const updateContainer = () => {
      const leftBarWidth =
        document.querySelector("#leftbar-container")?.clientWidth || 0;
      const headerHeight =
        document.querySelector("#chatContentHeader")?.clientHeight || 0;
      const roomDetailsWidth =
        isRoomDetailsShown && window.innerWidth >= 1280 ? 400 : 0;

      if (containerRef.current) {
        containerRef.current.style.width = `${
          window.innerWidth - leftBarWidth - roomDetailsWidth
        }px`;
        containerRef.current.style.top = `${headerHeight}px`;
      }
    };

    updateContainer();
    window.addEventListener("resize", updateContainer);
    setIsLoaded(true);

    return () => window.removeEventListener("resize", updateContainer);
  }, [isRoomDetailsShown]);

  // If there are no pinned messages, render nothing.
  if (!pinMessages.length) return null;

  const activeMessage = pinMessages[activePinMsg];

  return (
    <div
      id="pinMessagesContainer"
      ref={containerRef}
      className={`absolute left-0 transition-all duration-200 p-1 h-12 bg-leftBarBg w-full ${
        isLoaded ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex items-center justify-between relative cursor-pointer gap-2 w-full">
        <div
          onClick={scrollToPinMessage}
          className={`${
            !isRoomDetailsShown ? "basis-[96%]" : ""
          } w-full pl-4 m-auto flex flex-col items-start`}
        >
          <h5 className="font-bold font-vazirBold text-sm text-lightBlue">
            Pin messages
          </h5>
          <p className="flex gap-1 w-[95%] text-darkGray text-sm">
            <span className="text-lightBlue/70">
              {activeMessage?.sender.name}:
            </span>
            <span className="overflow-hidden overflow-ellipsis">
              {activeMessage?.message ||
                (activeMessage?.voiceData && "Voice Message")}
            </span>
          </p>
        </div>

        <div className="absolute right-0 top-0 flex items-center justify-center">
          <TiPinOutline className="text-darkGray" />
        </div>

        <span className="absolute inset-y-0 left-1 w-[3px] rounded-full bg-lightBlue"></span>
      </div>
    </div>
  );
};

export default PinnedMessages;

// import Message from "@/models/message";
// import useGlobalStore from "@/store/globalStore";
// import { scrollToMessage } from "@/utils";
// import {
//   useCallback,
//   useEffect,
//   useLayoutEffect,
//   useRef,
//   useState,
// } from "react";
// import { TiPinOutline } from "react-icons/ti";

// const PinnedMessages = ({
//   pinnedMessages: messages,
// }: {
//   pinnedMessages: Message[];
// }) => {
//   const isRoomDetailsShown = useGlobalStore(
//     (state) => state.isRoomDetailsShown
//   );
//   const pinnedMessageRef = useRef<HTMLDivElement | null>(null);
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [pinMessages, setPinMessages] = useState<Message[]>([]);
//   const [activePinMsg, setActivePinMsg] = useState(0);

//   const updateActivePinMsgIndex = useCallback(() => {
//     let nextActiveMsg =
//       activePinMsg - 1 >= 0 ? activePinMsg - 1 : pinMessages.length - 1;

//     if (!messages?.[nextActiveMsg]) {
//       nextActiveMsg = 0;
//     }

//     setActivePinMsg(nextActiveMsg);
//   }, [activePinMsg, messages, pinMessages.length]);

//   const scrollToPinMessage = () => {
//     scrollToMessage(pinMessages[activePinMsg]?._id, "smooth", "center");
//     updateActivePinMsgIndex();
//   };

//   useEffect(() => {
//     if (!messages[activePinMsg]) {
//       updateActivePinMsgIndex();
//     }
//   }, [messages, activePinMsg, updateActivePinMsgIndex]);

//   // Dynamically update the pin container before the page paint.
//   useLayoutEffect(() => {
//     const updatePinContainer = () => {
//       const leftBarWidth = document.querySelector("#leftbar-container")
//         ?.clientWidth as number;
//       const chatContentHeaderHeight =
//         document.querySelector("#chatContentHeader")?.clientHeight;

//       if (pinnedMessageRef?.current) {
//         const roomDetailsContainerHeight = isRoomDetailsShown
//           ? window.innerWidth >= 1280
//             ? 400
//             : 0
//           : 0;

//         pinnedMessageRef.current.style.width = `${
//           window.innerWidth - leftBarWidth - roomDetailsContainerHeight
//         }px`;
//         pinnedMessageRef.current.style.top = `${chatContentHeaderHeight}px`;
//       }
//     };

//     updatePinContainer();
//     setIsLoaded(true);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [pinnedMessageRef?.current, messages, isRoomDetailsShown]);

//   useEffect(() => {
//     if (!messages?.length) return;

//     const sortedPinMessages = [...messages]
//       .filter((msg) => msg.pinnedAt)
//       .sort((a, b) => {
//         return (
//           new Date(Number(b.pinnedAt)).getTime() -
//           new Date(Number(a.pinnedAt)).getTime()
//         );
//       });

//     setPinMessages(sortedPinMessages);
//   }, [messages]);

//   if (!messages?.length) return;

//   return (
//     <div
//       id="pinMessagesContainer"
//       key={String(isLoaded)}
//       ref={pinnedMessageRef}
//       className={`absolute left-0  ${
//         isLoaded ? "opacity-100" : "opacity-0"
//       } transition-all duration-200 p-1 h-12 bg-leftBarBg w-full`}
//     >
//       <div className="flex items-center justify-between relative *:cursor-pointer gap-2 w-full">
//         <div
//           onClick={scrollToPinMessage}
//           className={`${
//             !isRoomDetailsShown && "basis-[96%]"
//           } w-full pl-4 m-auto flex items-start justify-start flex-col`}
//         >
//           <h5 className="font-bold font-vazirBold text-sm text-lightBlue text-left">
//             Pin messages
//           </h5>
//           <p className="flex gap-1 w-[95%]  text-darkGray text-sm">
//             <span className="text-lightBlue/70">
//               {pinMessages?.[activePinMsg]?.sender.name}:
//             </span>
//             <span className="overflow-hidden overflow-ellipsis">
//               {pinMessages?.[activePinMsg]?.message
//                 ? pinMessages?.[activePinMsg]?.message
//                 : pinMessages?.[activePinMsg]?.voiceData && "Voice Message"}
//             </span>
//           </p>
//         </div>

//         <div className="absolute right-0 top-0 flex justify-center items-center">
//           <TiPinOutline className="size-5 text-darkGray" />
//         </div>

//         <span className="absolute inset-y-0 left-1 w-[3px] rounded-full h-full bg-lightBlue"></span>
//       </div>
//     </div>
//   );
// };

// export default PinnedMessages;
