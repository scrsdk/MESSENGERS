interface Props {
  name: string;
  count: number;
  onClick: () => void;
  isActive?: boolean;
}

const ChatFolders = ({ name, count, isActive, onClick }: Props) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-center gap-1 relative cursor-pointer transition-all duration-300 w-full"
    >
      <div className={`${isActive && "text-lightBlue"} capitalize inline`}>
        {name}
      </div>

      {count ? (
        <span
          className={`text-xs size-4 mb-0.5 flex items-center justify-center  ${
            isActive ? "bg-lightBlue" : "bg-darkGray"
          } text-leftBarBg rounded-full`}
        >
          <span className="mt-1 font-vazirBold"> {count}</span>
        </span>
      ) : null}

      {isActive && (
        <span className="absolute -bottom-1 bg-lightBlue rounded-t-md w-full h-1"></span>
      )}
    </div>
  );
};

export default ChatFolders;
