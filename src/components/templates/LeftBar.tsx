"use client";

import useGlobalVariablesStore from "@/store/globalVariablesStore";
import useUserStore from "@/store/userStore";
import useSockets from "@/store/useSockets";
import Image from "next/image";
import React, { lazy, useEffect, useMemo, useState } from "react";
import { BiSearch } from "react-icons/bi";
import { io } from "socket.io-client";
import { ChatCard } from "../modules/ChatCard";
import RoomSkeleton from "../modules/RoomSkeleton";
import RoomFolders from "./RoomFolders";
import Room from "@/models/room";
import User from "@/models/user";

const socket = io("http://localhost:3001", {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ["websocket"],
});

const CreateRoomBtn = lazy(
  () => import("@/components/templates/CreateRoomBtn")
);
const LeftBarMenu = lazy(() => import("@/components/templates/LeftBarMenu"));
const SearchPage = lazy(() => import("@/components/templates/SearchPage"));
const Modal = lazy(() => import("../modules/Modal"));

const LeftBar = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filterBy, setFilterBy] = useState("all");
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [forceRender, setForceRender] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLeftBarMenuOpen, setIsLeftBarMenuOpen] = useState(false);

  const userId = useUserStore((state) => state._id);

  const updater = useSockets((state) => state.updater);
  const { setter: userDataUpdater, rooms: userRooms } = useUserStore(
    (state) => state
  );
  const { selectedRoom, setter } = useGlobalVariablesStore((state) => state);

  const sortedRooms = useMemo(() => {
    const filteredRooms =
      filterBy === "all"
        ? rooms
        : rooms.filter((room) => room.type === filterBy);

    const sortedRooms = filteredRooms.sort((a: any, b: any) => {
      const aTime = new Date(a?.lastMsgData?.createdAt).getTime() || 0;
      const bTime = new Date(b?.lastMsgData?.createdAt).getTime() || 0;
      return bTime - aTime;
    });

    return sortedRooms;
  }, [rooms, forceRender, userRooms, filterBy]);

  useEffect(() => {
    if (!userId) return;

    updater("rooms", socket);
    userDataUpdater({ rooms });

    socket.emit("joining", selectedRoom?._id);
    socket.emit("getRooms", userId);

    socket.on("joining", (roomData) => {
      if (roomData) {
        setter({ selectedRoom: roomData });
      }
    });

    socket.on("getRooms", (rooms: Room[]) => {
      setIsPageLoaded(true);
      setRooms(rooms);
      userDataUpdater({ rooms });

      socket.on("lastMsgUpdate", (newMsg) => {
        setForceRender((prev) => !prev);
        setRooms((prev) =>
          prev.map((roomData: any) => {
            if (roomData._id === newMsg.roomID) roomData.lastMsgData = newMsg;
            return roomData;
          })
        );
      });
    });

    socket.on("createRoom", (roomData) => {
      socket.emit("getRooms", userId);
      if (roomData.creator == userId) socket.emit("joining", roomData._id);
    });

    socket.on("updateOnlineUsers", (onlineUsers) => setter({ onlineUsers })); // check if its accessible for all(bug) or not

    socket.on("updateLastMsgPos", (updatedData: User["roomMessageTrack"]) => {
      userDataUpdater({ roomMessageTrack: updatedData });
    });
    return () => {
      socket.off("joining");
      socket.off("getRooms");
      socket.off("createRoom");
      socket.off("updateLastMsgPos");
      socket.off("lastMsgUpdate");
      socket.off("updateOnlineUsers");
    };
  }, [userId, rooms?.length]);

  useEffect(() => {
    if (rooms?.length && userRooms?.length) {
      if (rooms?.length < userRooms?.length) setRooms(userRooms);
    }
  }, [userRooms?.length, rooms?.length]);

  useEffect(() => {
    socket.on("deleteRoom", (roomID) => {
      socket.emit("getRooms");
      if (roomID == selectedRoom?._id) setter({ selectedRoom: null });
    });

    socket.on("seenMsg", ({ roomID, seenBy }) => {
      const updatedRoomLastMessageData = [...rooms];

      updatedRoomLastMessageData.some((room) => {
        if (room._id === roomID) {
          room.lastMsgData = {
            ...room.lastMsgData,
            seen: [...new Set([...room?.lastMsgData?.seen, seenBy])],
          };
          return true;
        }
      });

      setRooms(updatedRoomLastMessageData);
      setForceRender((prev) => !prev);
    });

    return () => {
      socket.off("deleteRoom");
      socket.off("seenMsg");
    };
  }, [selectedRoom?._id]);

  return (
    <>
      {isPageLoaded ? (
        <>
          <LeftBarMenu
            isOpen={isLeftBarMenuOpen}
            closeMenu={() => setIsLeftBarMenuOpen(false)}
          />
          <Modal />
          <CreateRoomBtn />
        </>
      ) : null}

      {isSearchOpen && (
        <SearchPage closeSearch={() => setIsSearchOpen(false)} />
      )}

      <div
        data-aos-duration="400"
        data-aos="fade-right"
        id="leftBar-container"
        className={`flex-1 ${
          selectedRoom && "hidden"
        } md:block bg-leftBarBg relative scroll-w-none px-4 min-h-dvh overflow-y-auto`}
      >
        <div className="w-full sticky top-0 bg-leftBarBg space-y-1 pt-1 border-b border-white/5 z-30">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center flex-1 gap-5 mt-3 w-full text-white text-sm">
              <Image
                onClick={() => setIsLeftBarMenuOpen(true)}
                className="cursor-pointer"
                src="/shapes/hamberger.svg"
                width={18}
                height={15}
                alt="hambergerMenu"
              />
              <h1 className="font-bold font-robotoBold">Telegram</h1>
            </div>

            <BiSearch
              onClick={() => setIsSearchOpen(true)}
              className="cursor-pointer size-[23px] text-white/90 mt-3"
            />
          </div>

          <RoomFolders updateFilterBy={(filterBy) => setFilterBy(filterBy)} />
        </div>

        <div className="flex flex-col mt-2 pb-14 overflow-auto">
          {isPageLoaded ? (
            sortedRooms.length ? (
              sortedRooms.map((data: any) => (
                <ChatCard {...data} key={data?._id} />
              ))
            ) : (
              <div className="text-xl text-white font-bold w-full text-center font-robotoBold pt-20">
                No chats found
              </div>
            )
          ) : (
            <RoomSkeleton />
          )}
        </div>
      </div>
    </>
  );
};

export default LeftBar;
