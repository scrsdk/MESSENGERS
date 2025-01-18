import User from "@/models/User";
import { create } from "zustand";

interface Updater {
  updater: (key: keyof User, value: User[keyof User]) => void;
  setter: any;
}

const useUserStore = create<User & Updater>((set) => ({
  _id: "",
  name: "",
  lastName: "",
  username: "",
  password: "",
  phone: "0",
  rooms: [],
  avatar: "",
  createdAt: "",
  isLogin: false,
  biography: "",
  status: "offline",
  updatedAt: "",
  roomMessageTrack: [],

  updater(key: keyof User, value: User[keyof User]) {
    set({ [key]: value });
  },
  setter: set,
}));

export default useUserStore;
