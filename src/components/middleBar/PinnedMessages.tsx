import { useCallback, useEffect, useMemo, useState } from "react";
import Message from "@/models/message";
import { scrollToMessage } from "@/utils";
import { TiPinOutline } from "react-icons/ti";

interface PinnedMessagesProps {
  pinnedMessages: Message[];
}

const PinnedMessages: React.FC<PinnedMessagesProps> = ({
  pinnedMessages: messages,
}) => {
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

  if (!pinMessages.length) return null;

  const activeMessage = pinMessages[activePinMsg];

  return (
    <div
      id="pinMessagesContainer"
      className={`sticky top-0 py-1 px-2 h-12 bg-leftBarBg w-full z-10`}
    >
      <div className="flex items-center justify-between relative cursor-pointer gap-2 w-full">
        <div
          onClick={scrollToPinMessage}
          className={`w-full pl-2 border-l-3 border-darkBlue  flex flex-col items-start`}
        >
          <h5 className="font-bold font-vazirBold text-sm text-lightBlue">
            Pin messages
          </h5>
          <div className="flex gap-1 h-fit w-[95%] text-darkGray text-sm ">
            <span className="text-lightBlue/70 ">
              {activeMessage?.sender.name}:
            </span>
            <div className=" truncate">
              {activeMessage?.message ||
                (activeMessage?.voiceData && "Voice Message")}
            </div>
          </div>
        </div>

        <div className="absolute right-0 top-0 flex items-center justify-center">
          <TiPinOutline className="text-darkGray" size={20} />
        </div>
      </div>
    </div>
  );
};

export default PinnedMessages;
