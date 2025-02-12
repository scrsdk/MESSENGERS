"use client";
import useGlobalStore from "@/store/globalStore";
import { useEffect } from "react";
import Aos from "aos";

const AosAnimation = () => {
  const selectedRoom = useGlobalStore((state) => state.selectedRoom);

  useEffect(() => {
    Aos.init();
  }, []);
  useEffect(() => {
    Aos.refresh();
  }, [selectedRoom?._id]);

  return null;
};

export default AosAnimation;
