import User from "@/models/user";
import { create } from "zustand";

export interface UserStoreUpdater {
  updater: (key: keyof User, value: User[keyof User]) => void;
  setter: (
    state:
      | Partial<User & UserStoreUpdater>
      | ((prev: User & UserStoreUpdater) => Partial<User & UserStoreUpdater>)
  ) => void;
}

const useUserStore = create<User & UserStoreUpdater>((set) => ({
  _id: "",
  name: "",
  lastName: "",
  username: "",
  password: "",
  phone: "",
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
