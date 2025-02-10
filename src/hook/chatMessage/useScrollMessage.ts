import Message from "@/models/message";
import { Dispatch, SetStateAction, useCallback, useRef } from "react";

interface useScrollMessageProps {
  messages: Message[] | undefined;
  myID: string;
  isLastMsgInView: boolean;
  setIsProgrammaticScroll: Dispatch<SetStateAction<boolean>>;
}
const useScrollMessage = ({
  setIsProgrammaticScroll,
  messages,
  myID,
  isLastMsgInView,
}: useScrollMessageProps) => {
  const lastMsgRef = useRef<HTMLDivElement | null>(null);

  const manageScroll = useCallback(() => {
    const isFromMe =
      messages?.length && messages[messages.length - 1]?.sender?._id === myID;
    if (isFromMe || isLastMsgInView) {
      setIsProgrammaticScroll(true);
      lastMsgRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    const programmaticScroll = setTimeout(() => {
      setIsProgrammaticScroll(false);
    }, 1500);
    return () => {
      clearTimeout(programmaticScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  return { lastMsgRef, manageScroll };
};

export default useScrollMessage;
