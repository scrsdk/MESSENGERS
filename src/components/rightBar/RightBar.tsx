"use client";
import useGlobalStore from "@/store/globalStore";
import { Suspense, lazy } from "react";
const RoomDetails = lazy(() => import("@/components/rightBar/RoomDetails"));

const RightBar = () => {
  const { selectedRoom, mockSelectedRoomData } = useGlobalStore(
    (state) => state
  );

  return selectedRoom || mockSelectedRoomData ? (
    <Suspense>
      <RoomDetails />
    </Suspense>
  ) : null;
};

export default RightBar;
