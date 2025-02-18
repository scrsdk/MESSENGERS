import { getGradientClass } from "@/stores/gradientStore";
import { CSSProperties, useMemo } from "react";

const ProfileGradients = ({
  id,
  children,
  classNames,
  style,
}: {
  id: string;
  children: React.ReactNode;
  classNames: string;
  style?: CSSProperties;
}) => {
  const gradientClass = useMemo(() => getGradientClass(id), [id]);

  return (
    <div
      className={`${gradientClass} shrink-0 rounded-full flex-center text-white ${classNames}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default ProfileGradients;
