import LineSeparator from "@/components/modules/LineSeparator";
import MenuItem from "@/components/leftBar/menu/MenuItem";
import useGlobalStore from "@/store/globalStore";
import useUserStore from "@/store/userStore";
import useSockets from "@/store/useSockets";
import { copyText, toaster } from "@/utils";
import Image from "next/image";
import { CgProfile } from "react-icons/cg";
import { CiBookmark } from "react-icons/ci";
import { FiUserPlus } from "react-icons/fi";
import { IoCallOutline, IoSettingsOutline } from "react-icons/io5";
import { LuUsers } from "react-icons/lu";
import { RiUser3Line } from "react-icons/ri";
import { HiOutlineSpeakerphone } from "react-icons/hi";

interface Props {
  updateRoute: (route: string) => void;
  closeMenu: () => void;
  isOpen: boolean;
}

const Main = ({ closeMenu, updateRoute, isOpen }: Props) => {
  const { name, avatar, lastName, rooms, phone } = useUserStore(
    (state) => state
  );
  const socket = useSockets((state) => state.rooms);

  const copyInviteLink = async () => {
    await copyText("Coming soon");
    toaster(true, "Invite link copied!");
    closeMenu();
  };

  const openProfile = () => updateRoute("settings");

  const createNewGroup = () => {
    const createRoom = useGlobalStore.getState().createRoom;
    createRoom("group");
    closeMenu();
  };

  const createNewChannel = () => {
    const createRoom = useGlobalStore.getState().createRoom;
    createRoom("channel");
    closeMenu();
  };

  const openSavedMessages = () => {
    const savedMessageRoomID = rooms.find(
      (room) => room.type == "private" && room.participants.length == 1
    )?._id;
    socket?.emit("joining", savedMessageRoomID);
    closeMenu();
  };

  return (
    <nav
      className={`fixed ${
        isOpen ? "left-0" : "-left-full"
      } max-h-screen h-full overflow-auto duration-200 transition-all inset-y-0 z-9999 bg-leftBarBg text-white w-[80%] max-w-80 md:max-w-72 lg:max-w-80`}
    >
      <div className="flex flex-col pt-4 px-4 gap-4 bg-chatBg pb-2">
        {avatar ? (
          <Image
            className={`size-15 bg-center object-cover rounded-full cursor-pointer`}
            width={60}
            onClick={openProfile}
            height={60}
            quality={100}
            src={avatar}
            alt="avatar"
          />
        ) : (
          <div
            onClick={openProfile}
            className="size-15 shrink-0 bg-darkBlue rounded-full flex-center text-bold text-center text-white cursor-pointer text-lg"
          >
            {name?.length && name[0]}
          </div>
        )}

        <div>
          <p className=" font-vazirBold text-base">{name + " " + lastName}</p>
          <p className="text-darkGray text-xs pt-1">
            +98{" "}
            {phone
              .toString()
              .split("")
              .map((str, index) => {
                if (index < 7) {
                  return str + ((index + 1) % 3 === 0 ? " " : "");
                } else {
                  return str;
                }
              })}
          </p>
        </div>
      </div>

      <div>
        <MenuItem
          icon={<CgProfile />}
          title="My Profile"
          onClick={openProfile}
        />

        <LineSeparator />

        <MenuItem
          icon={<LuUsers />}
          title="New Group"
          onClick={createNewGroup}
        />

        <MenuItem
          icon={<HiOutlineSpeakerphone />}
          title="New Channel"
          onClick={createNewChannel}
        />

        <LineSeparator />

        <MenuItem
          icon={<RiUser3Line />}
          title="Contacts"
          onClick={() => toaster(true, "Coming soon..!")}
        />

        <MenuItem
          icon={<IoCallOutline />}
          title="Calls"
          onClick={() => toaster(true, "Coming soon..!")}
        />

        <MenuItem
          icon={<CiBookmark />}
          title="Saved Messages"
          onClick={openSavedMessages}
        />

        <MenuItem
          icon={<IoSettingsOutline />}
          title="Settings"
          onClick={() => {
            updateRoute("settings");
            closeMenu();
          }}
        />

        <LineSeparator />

        <MenuItem
          icon={<FiUserPlus />}
          title="Invite Friends"
          onClick={copyInviteLink}
        />
      </div>
    </nav>
  );
};

export default Main;
