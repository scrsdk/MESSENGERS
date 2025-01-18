import Message from "@/models/message";
import User from "@/models/user";
import Voice from "@/models/voice";
import { ElementRef } from "react";
import { create } from "zustand";

interface Updater {
  updater: (key: keyof User, value: User[keyof User]) => void;
  isPlaying: boolean;
  audioElem: ElementRef<"audio"> | null;
  currentTime: number;
  voiceData: Voice & Message;
  downloadedAudios: {
    _id: string;
    downloaded: boolean;
    isDownloading: boolean;
  }[];
  setter: any;
}

const useAudio = create<Updater>((set) => ({
  isPlaying: false,
  audioElem: null,
  currentTime: 0,
  isVoiceDownloaded: false,
  voiceData: {} as Voice & Message,
  downloadedAudios: [],

  updater(key: keyof User, value: User[keyof User]) {
    set({ [key]: value });
  },
  setter: set,
}));

export default useAudio;
