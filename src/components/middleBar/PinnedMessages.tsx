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
            <span className="overflow-hidden text-ellipsis">
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
