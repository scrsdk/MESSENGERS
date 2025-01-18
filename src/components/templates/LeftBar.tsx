"use client";

import Room from "@/models/room";

import useGlobalVariablesStore from "@/store/globalVariablesStore";
import useUserStore from "@/store/userStore";
import useSockets from "@/store/useSockets";
import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001", {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ["websocket"],
});

const LeftBar = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filterBy, setFilterBy] = useState("all");
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [forceRender, setForceRender] = useState(false);

  const _id = useUserStore((state) => state._id);
  const updater = useSockets((state) => state.updater);
  const {
    setter: userDataUpdater,
    rooms: userRooms,
    roomMessageTrack,
  } = useUserStore((state) => state);
  const { selectedRoom, setter } = useGlobalVariablesStore((state) => state);

  const sortedRooms = useMemo(() => {
    const filteredRooms =
      filterBy == "all"
        ? rooms
        : [...rooms].filter((data) => data.type === filterBy);

    const sortAndFilteredRooms = filteredRooms.sort((a: any, b: any) => {
      const aTime = new Date(a?.lastMsgData?.createdAt).getTime() || 0;
      const bTime = new Date(b?.lastMsgData?.createdAt).getTime() || 0;
      return bTime - aTime;
    });

    return sortAndFilteredRooms;
  }, [rooms?.length, forceRender, userRooms?.length, filterBy]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (socket.connected) {
        socket.emit("ping");
        // console.log("Ping sent");
      }
    }, 20000);

    return () => {
      clearInterval(intervalId ?? 0);
      socket?.off("pong");
    };
  }, []);

  useEffect(() => {
    if (!_id) return;

    updater("rooms", socket);
    userDataUpdater({ rooms });

    socket.emit("joining", selectedRoom?._id);
    socket.emit("getRooms", _id);

    socket.on("joining", (roomData) => {
      roomData && setter({ selectedRoom: roomData });
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
      socket.emit("getRooms", _id);
      roomData.creator == _id && socket.emit("joining", roomData._id);
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
  }, [_id, rooms?.length]);

  return (
    <>
      {/* {isPageLoaded ? (
        <>
          <LeftBarMenu
            isOpen={isLeftBarMenuOpen}
            closeMenu={() => setIsLeftBarMenuOpen(false)}
          />
          <Modal />
          <CreateRoomBtn />
        </>
      ) : null} */}

      {/* {isSearchOpen && (
        <SearchPage closeSearch={() => setIsSearchOpen(false)} />
      )}*/}

      <div
        data-aos-duration="400"
        data-aos="fade-right"
        id="leftBar-container"
        className={`flex-1 ${
          selectedRoom && "hidden"
        } md:block bg-leftBarBg relative scroll-w-none px-4 overflow-y-auto`}
      >
        <div className="w-full sticky top-0 bg-leftBarBg space-y-1 pt-1 border-b border-white/5 z-30">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center flex-1 gap-5 mt-3 w-full text-white tex-[14px]">
              {/* <Image
                onClick={() => setIsLeftBarMenuOpen(true)}
                className="cursor-pointer"
                src="/shapes/hamberger.svg"
                width={18}
                height={15}
                alt="hambergerMenu"
              /> */}
              <h1 className="font-bold font-robotoBold">Telegram</h1>
            </div>

            {/* <BiSearch
              onClick={() => setIsSearchOpen(true)}
              className="cursor-pointer size-[23px] text-white/90 mt-3"
            /> */}
          </div>

          {/* <RoomFolders updateFilterBy={(filterBy) => setFilterBy(filterBy)} /> */}
        </div>

        <div className="flex flex-col mt-2 pb-14 overflow-auto">
          {/* {isPageLoaded ? (
            sortedRooms?.length ? (
              sortedRooms.map((data: any) => (
                <ChatCard {...data} key={data?._id} />
              ))
            ) : (
              <div className="text-xl text-white font-bold w-full text-center font-segoeBold pt-20">
                No chats found bud
              </div>
            )
          ) : (
            <RoomSkeleton />
          )} */}
        </div>
      </div>
    </>
  );
};

export default LeftBar;
