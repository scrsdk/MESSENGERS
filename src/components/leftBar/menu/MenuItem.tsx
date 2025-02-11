import { JSX } from "react";

type ItemProps = {
  title: string;
  icon: JSX.Element;
  spaceY?: `py-${number}`;
  onClick?: () => void;
};

const MenuItem = ({ title, icon, onClick, spaceY = "py-3" }: ItemProps) => {
  return (
    <div
      onClick={onClick}
      className={`${spaceY} flex items-center gap-6  px-4  w-full cursor-pointer hover:bg-white/5 transition-all duration-200`}
    >
      <div className="size-6 text-white/40">{icon}</div>
      <p className="font-vazirRegular">{title}</p>
    </div>
  );
};

export default MenuItem;
