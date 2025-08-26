import { useMemo, memo } from "react";
import { dateString } from "@/utils";
import Message from "./Message";
import MessageModel from "@/models/message";

interface MsgDate {
  date: string;
  usedBy: string;
}

interface MessageListProps {
  messages: MessageModel[];
  myID: string;
  type: string;
  lastMsgRef: React.RefObject<HTMLDivElement | null>;
  setEditData: React.Dispatch<React.SetStateAction<MessageModel | null>>;
  setReplayData: React.Dispatch<React.SetStateAction<string | null>>;
  pinMessage: (id: string) => void;
}

const MessageList = ({
  messages,
  myID,
  type,
  lastMsgRef,
  setEditData,
  setReplayData,
  pinMessage,
}: MessageListProps) => {
  const messageContent = useMemo(() => {
    const dates: MsgDate[] = [];
    return messages?.length ? (
      messages.map((data, index) => {
        if (data?.hideFor?.includes(myID)) return null;

        const isDateUsed = dates.some(
          (date) =>
            date.date === dateString(data.createdAt) || date.usedBy === data._id
        );

        if (!isDateUsed) {
          dates.push({ date: dateString(data.createdAt), usedBy: data._id });
        }

        const stickyDate =
          dates.find((date) => date.usedBy === data._id)?.date || null;

        return (
          <div
            className={`${data._id} highLightedMessage`}
            key={data._id}
            ref={index === messages.length - 1 ? lastMsgRef : null}
          >
            <Message
              addReplay={(replyData) => {
                setEditData(null);
                setReplayData(replyData);
              }}
              edit={() => {
                setReplayData(null);
                setEditData(data);
              }}
              pin={pinMessage}
              myId={myID}
              isPv={type === "private"}
              stickyDate={stickyDate}
              nextMessage={messages[index + 1] || null}
              {...data}
            />
          </div>
        );
      })
    ) : (
      <div className="flex-center size-full pb-[40vh]">
        <p className="rounded-full w-fit text-sm py-1 px-3 text-center bg-gray-800/80">
          Отправьте сообщение, чтобы начать чат
        </p>
      </div>
    );
  }, [
    messages,
    myID,
    type,
    lastMsgRef,
    setEditData,
    setReplayData,
    pinMessage,
  ]);

  return <>{messageContent}</>;
};

export default memo(MessageList);
