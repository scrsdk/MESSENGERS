"use client";
import useGlobalStore from "@/store/globalStore";
import { Suspense, lazy, useMemo, useState } from "react";
import EditInfo from "./EditInfo";
import { IoArrowBackOutline, IoClose } from "react-icons/io5";
import { MdDone, MdEdit } from "react-icons/md";
import useUserStore from "@/store/userStore";
import Loading from "../modules/ui/Loading";
import Room from "@/models/room";
import AddMembers from "./AddMembers";
import AddSubscribers from "./AddSubscribers";
const RoomDetails = lazy(() => import("@/components/rightBar/RoomDetails"));

const RightBar = () => {
  const [submitChanges, setSubmitChanges] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const {
    setter,
    isRoomDetailsShown,
    selectedRoom,
    shouldCloseAll,
    mockSelectedRoomData,
    rightBarRoute,
  } = useGlobalStore((state) => state);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectedRoomData: any = mockSelectedRoomData ?? selectedRoom;
  const { participants, type, _id: roomID } = selectedRoomData || {};
  const myData = useUserStore((state) => state);

  const roomData = useMemo(() => {
    if (type === "private") {
      return (
        participants?.find((data: Room) => data?._id !== myData._id) ||
        participants?.find((data: Room) => data?._id === myData._id) ||
        selectedRoomData
      );
    }
    return selectedRoomData || "";
  }, [myData._id, participants, selectedRoomData, type]);

  const activeRoute = useMemo(() => {
    switch (rightBarRoute) {
      case "/edit-info":
        return (
          <EditInfo
            key={`${roomID}-edit-info`}
            selectedRoomData={selectedRoomData}
            roomData={roomData}
            submitChanges={submitChanges}
            setSubmitChanges={setSubmitChanges}
            setCanSubmit={setCanSubmit}
            myData={myData}
          />
        );
      case "/add-members":
      case "/add-channel-members":
        return (
          <AddMembers
            setCanSubmit={setCanSubmit}
            submitChanges={submitChanges}
            setSubmitChanges={setSubmitChanges}
            roomData={roomData}
          />
        );
      case "/add-subscribers":
      case "/administrators":
        return (
          <AddSubscribers
            setCanSubmit={setCanSubmit}
            submitChanges={submitChanges}
            setSubmitChanges={setSubmitChanges}
            roomData={roomData}
            myData={myData}
          />
        );
      default:
        return (
          <RoomDetails
            key={`${roomID}-room-details`}
            selectedRoomData={selectedRoomData}
            myData={myData}
            roomData={roomData}
          />
        );
    }
  }, [
    myData,
    rightBarRoute,
    roomData,
    roomID,
    selectedRoomData,
    submitChanges,
  ]);

  const closeRoomDetails = () => {
    if (shouldCloseAll) {
      return setter({
        isRoomDetailsShown: false,
        mockSelectedRoomData: null,
        shouldCloseAll: false, // reset the value to default
      });
    }

    if (mockSelectedRoomData) {
      setter({ mockSelectedRoomData: null });
    } else {
      setter({ isRoomDetailsShown: false });
    }
  };

  // Helper functions for header rendering
  const renderHeaderLeft = () => {
    if (rightBarRoute === "/") {
      return (
        <IoClose onClick={closeRoomDetails} className="size-5 cursor-pointer" />
      );
    }

    const handleBack = () => {
      if (rightBarRoute === "/add-channel-members") {
        setter({ rightBarRoute: "/add-subscribers" });
      } else {
        setter({ rightBarRoute: "/" });
      }
    };

    const getHeaderTitle = () => {
      switch (rightBarRoute) {
        case "/add-members":
          return "Add members";
        case "/add-subscribers":
          return "Subscribers";
        case "/add-channel-members":
          return "Add Subscribers";
        case "/administrators":
          return "Administrators";
        default:
          return "Edit";
      }
    };

    return (
      <div className="flex gap-6">
        <IoArrowBackOutline
          onClick={handleBack}
          className="size-6 cursor-pointer"
        />
        <div>{getHeaderTitle()}</div>
      </div>
    );
  };

  const renderHeaderRight = () => {
    if (
      rightBarRoute === "/edit-info" ||
      rightBarRoute === "/add-members" ||
      rightBarRoute === "/add-channel-members"
    ) {
      return submitChanges ? (
        <Loading />
      ) : (
        canSubmit && (
          <MdDone
            onClick={() => setSubmitChanges(true)}
            className="size-6 cursor-pointer"
          />
        )
      );
    } else if (
      rightBarRoute === "/" &&
      roomData?.admins?.includes(myData._id)
    ) {
      return (
        <MdEdit
          className="size-5 text-gray-400 cursor-pointer"
          onClick={() => setter({ rightBarRoute: "/edit-info" })}
        />
      );
    }
    return null;
  };

  if (!(mockSelectedRoomData || selectedRoomData)) return null;

  return (
    <Suspense>
      <div
        className={`fixed flex flex-col xl:static h-dvh w-full xl:w-[25%] md:w-[35%] transition-all duration-300 bg-leftBarBg text-white z-50 ${
          isRoomDetailsShown ? "xl:flex right-0" : "xl:hidden -right-full"
        }`}
      >
        <div
          className={`flex items-center justify-between w-full p-3 ${
            rightBarRoute === "/" ? "chatBackground" : "bg-leftBarBg"
          }`}
        >
          {renderHeaderLeft()}
          {renderHeaderRight()}
        </div>
        {activeRoute}
      </div>
    </Suspense>
  );
};

export default RightBar;

// "use client";
// import useGlobalStore from "@/store/globalStore";
// import { Suspense, lazy, useMemo, useState } from "react";
// import EditInfo from "./EditInfo";
// import { IoArrowBackOutline, IoClose } from "react-icons/io5";
// import { MdDone, MdEdit } from "react-icons/md";
// import useUserStore from "@/store/userStore";
// import Loading from "../modules/ui/Loading";
// import Room from "@/models/room";
// import AddMembers from "./AddMembers";
// import AddSubscribers from "./AddSubscribers";
// const RoomDetails = lazy(() => import("@/components/rightBar/RoomDetails"));

// const RightBar = () => {
//   const [submitChanges, setSubmitChanges] = useState(false);
//   const [canSubmit, setCanSubmit] = useState(false);
//   const {
//     setter,
//     isRoomDetailsShown,
//     selectedRoom,
//     shouldCloseAll,
//     mockSelectedRoomData,
//     rightBarRoute,
//   } = useGlobalStore((state) => state);
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const selectedRoomData: any = mockSelectedRoomData ?? selectedRoom;
//   const { participants, type, _id: roomID } = selectedRoomData || {};
//   const myData = useUserStore((state) => state);

//   const roomData = useMemo(() => {
//     if (type === "private") {
//       return (
//         participants?.find((data: Room) => data?._id !== myData._id) ||
//         participants?.find((data: Room) => data?._id === myData._id) ||
//         selectedRoomData
//       );
//     }
//     return selectedRoomData || "";
//   }, [myData._id, participants, selectedRoomData, type]);

//   const activeRoute = useMemo(() => {
//     switch (rightBarRoute) {
//       case "/edit-info":
//         return (
//           <EditInfo
//             key={`${roomID}-edit-info`}
//             selectedRoomData={selectedRoomData}
//             roomData={roomData}
//             submitChanges={submitChanges}
//             setSubmitChanges={setSubmitChanges}
//             setCanSubmit={setCanSubmit}
//             myData={myData}
//           />
//         );
//       case "/add-members":
//       case "/add-channel-members":
//         return (
//           <AddMembers
//             setCanSubmit={setCanSubmit}
//             submitChanges={submitChanges}
//             setSubmitChanges={setSubmitChanges}
//             roomData={roomData}
//           />
//         );
//       case "/add-subscribers":
//       case "/administrators":
//         return (
//           <AddSubscribers
//             setCanSubmit={setCanSubmit}
//             submitChanges={submitChanges}
//             setSubmitChanges={setSubmitChanges}
//             roomData={roomData}
//             myData={myData}
//           />
//         );
//       default:
//         return (
//           <RoomDetails
//             key={`${roomID}-room-details`}
//             selectedRoomData={selectedRoomData}
//             myData={myData}
//             roomData={roomData}
//           />
//         );
//     }
//   }, [
//     myData,
//     rightBarRoute,
//     roomData,
//     roomID,
//     selectedRoomData,
//     submitChanges,
//   ]);

//   const closeRoomDetails = () => {
//     if (shouldCloseAll) {
//       return setter({
//         isRoomDetailsShown: false,
//         mockSelectedRoomData: null,
//         shouldCloseAll: false, // reset the value to default
//       });
//     }

//     if (mockSelectedRoomData) {
//       setter({ mockSelectedRoomData: null });
//     } else {
//       setter({ isRoomDetailsShown: false });
//     }
//   };

//   return mockSelectedRoomData || selectedRoomData ? (
//     <Suspense>
//       <div
//         className={`fixed flex flex-col xl:static h-dvh w-full xl:w-[25%] md:w-[35%] transition-all duration-300 bg-leftBarBg text-white z-50 ${
//           isRoomDetailsShown ? "xl:flex right-0" : "xl:hidden -right-full"
//         }`}
//       >
//         <div
//           className={`flex items-center justify-between w-full p-3 ${
//             rightBarRoute === "/" ? "chatBackground" : "bg-leftBarBg"
//           }`}
//         >
//           {rightBarRoute === "/" ? (
//             <IoClose
//               onClick={closeRoomDetails}
//               className="size-5 cursor-pointer"
//             />
//           ) : (
//             <div className="flex gap-6">
//               <IoArrowBackOutline
//                 onClick={() =>
//                   rightBarRoute === "/add-channel-members"
//                     ? setter({ rightBarRoute: "/add-subscribers" })
//                     : setter({ rightBarRoute: "/" })
//                 }
//                 className="size-6 cursor-pointer"
//               />
//               <div>
//                 {rightBarRoute === "/add-members"
//                   ? "Add members"
//                   : rightBarRoute === "/add-subscribers"
//                   ? "Subscribers"
//                   : rightBarRoute === "/add-channel-members"
//                   ? "Add Subscribers"
//                   : rightBarRoute === "/administrators"
//                   ? "Administrators"
//                   : "Edit"}
//               </div>
//             </div>
//           )}
//           {rightBarRoute === "/edit-info" ||
//           rightBarRoute === "/add-members" ||
//           rightBarRoute === "/add-channel-members" ? (
//             submitChanges ? (
//               <Loading />
//             ) : (
//               canSubmit && (
//                 <MdDone
//                   onClick={() => setSubmitChanges(true)}
//                   className="size-6 cursor-pointer"
//                 />
//               )
//             )
//           ) : (
//             rightBarRoute === "/" &&
//             roomData?.admins?.includes(myData._id) && (
//               <MdEdit
//                 className="size-5 text-gray-400 cursor-pointer"
//                 onClick={() => setter({ rightBarRoute: "/edit-info" })}
//               />
//             )
//           )}
//         </div>
//         {activeRoute}
//       </div>
//     </Suspense>
//   ) : null;
// };

// export default RightBar;
