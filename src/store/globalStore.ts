import Room from "@/models/room";
import User from "@/models/user";
import { Socket } from "socket.io-client";
import { create } from "zustand";

export interface GlobalStoreProps {
  selectedRoom: null | Room;
  mockSelectedRoomData: null | Room | User;
  onlineUsers: { socketID: string; userID: string }[];
  socket: null | Socket;
  isRoomDetailsShown: boolean;
  shouldCloseAll: boolean;
  isChatPageLoaded: boolean;
  createRoom: (type: "channel" | "group") => void;
}

interface Updater {
  updater: (
    key: keyof GlobalStoreProps,
    value: GlobalStoreProps[keyof GlobalStoreProps]
  ) => void;
  setter: (
    state:
      | Partial<GlobalStoreProps>
      | ((prev: GlobalStoreProps) => Partial<GlobalStoreProps>)
  ) => void;
}

const useGlobalStore = create<GlobalStoreProps & Updater>((set) => ({
  selectedRoom: null,
  mockSelectedRoomData: null,
  onlineUsers: [],
  socket: null,
  shouldCloseAll: false,
  isRoomDetailsShown: false,
  isChatPageLoaded: false,

  createRoom: () => {},

  updater(
    key: keyof GlobalStoreProps,
    value: GlobalStoreProps[keyof GlobalStoreProps]
  ) {
    set({ [key]: value });
  },

  setter: set,
}));

export default useGlobalStore;
