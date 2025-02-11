import { MdAddAPhoto, MdDeleteOutline } from "react-icons/md";
import LeftBarContainer from "./LeftBarContainer";
import { BsChat } from "react-icons/bs";
import { CiLock } from "react-icons/ci";
import { BsThreeDotsVertical } from "react-icons/bs";
import { GoBell, GoPencil } from "react-icons/go";
import { IoChatbubbleEllipsesOutline, IoLogOutOutline } from "react-icons/io5";

import { TbCameraPlus } from "react-icons/tb";
import { GoShieldCheck } from "react-icons/go";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { CiBatteryCharging } from "react-icons/ci";
import { MdLanguage } from "react-icons/md";
import Image from "next/image";
import MenuItem from "@/components/leftBar/menu/MenuItem";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import {
  convertToWebP,
  deleteFile,
  logout,
  openModal,
  toaster,
  uploadFile,
} from "@/utils";
import useUserStore from "@/store/userStore";
import useSockets from "@/store/useSockets";
import DropDown from "@/components/modules/ui/DropDown";
import LineSeparator from "@/components/modules/LineSeparator";
import Modal from "@/components/modules/Modal";
import Loading from "@/components/modules/ui/Loading";

interface Props {
  getBack: () => void;
  updateRoute: (route: string) => void;
}

const Settings = ({ getBack, updateRoute }: Props) => {
  const {
    _id,
    avatar,
    name,
    lastName,
    username,
    biography,
    phone,
    setter: userStateUpdater,
  } = useUserStore((state) => state);
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);

  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const avatarElem = () => {
    const inputElem = document.createElement("input");

    inputElem.type = "file";
    inputElem.className = "hidden";
    inputElem.accept = ".jpg, .jpeg, .png, .gif";

    inputElem.onchange = (e: Event) => {
      const changeEvent = e as unknown as ChangeEvent<HTMLInputElement>;
      if (changeEvent.target?.files?.length && changeEvent.target?.files![0]) {
        const imageFile = changeEvent.target.files[0];
        const fileReader = new FileReader();

        setUploadedImageFile(imageFile);
        fileReader.readAsDataURL(imageFile);
        fileReader.onload = (readerEv) =>
          setUploadedImageUrl(readerEv?.target!.result as string);
      }
      inputElem.remove();
    };

    document.body.append(inputElem!);
    inputElem.click();
  };

  const uploadAvatar = useCallback(async () => {
    try {
      setIsLoading(true);

      const socket = useSockets.getState().rooms;
      const webPImage = await convertToWebP(uploadedImageFile!);
      const uploadedImageUrl = await uploadFile(
        webPImage ? webPImage : uploadedImageFile!
      );

      socket?.emit("updateUserData", {
        userID: _id,
        avatar: uploadedImageUrl,
      });

      socket?.on("updateUserData", () => {
        userStateUpdater((prev) => ({
          ...prev,
          avatar: uploadedImageUrl ?? "",
        }));

        setUploadedImageFile(null);
        setUploadedImageUrl(null);
      });
    } catch (error) {
      console.log(error);
      toaster(false, "Failed to upload, check your network.");
    } finally {
      setIsLoading(false);
    }
  }, [_id, uploadedImageFile, userStateUpdater]);

  useEffect(() => {
    if (!uploadedImageUrl) return;
    uploadAvatar();
  }, [uploadAvatar, uploadedImageUrl]);

  const dropDownItems = [
    {
      title: "Edit info",
      onClick: () => {
        updateRoute("edit-info");
        setIsDropDownOpen(false);
      },
      icon: <GoPencil className="size-5  text-gray-400" />,
    },
    {
      title: "Update Profile Photo",
      onClick: () => {
        avatarElem();
        setIsDropDownOpen(false);
      },
      icon: <TbCameraPlus className="size-5  text-gray-400" />,
    },
    avatar && {
      title: "Remove Profile Photo",
      onClick: () => {
        openModal({
          title: "Delete Photo",
          bodyText: "Are you sure you want to delete your profile photo?",
          okText: "Delete",
          onSubmit: async () => {
            const socket = useSockets.getState().rooms;
            socket?.emit("updateUserData", { userID: _id, avatar: "" });
            socket?.on("updateUserData", () => {
              userStateUpdater((prev) => ({
                ...prev,
                avatar: "",
              }));
            });
            await deleteFile(avatar);
          },
        });
        setIsDropDownOpen(false);
      },
      icon: <MdDeleteOutline className="size-5  text-gray-400" />,
    },

    {
      title: "Log out",
      onClick: () => {
        openModal({
          title: "Log out",
          bodyText: "Do you really want to log out?",
          okText: "Yes",
          onSubmit: logout,
        });
        setIsDropDownOpen(false);
      },
      icon: <IoLogOutOutline className="size-5 pl-0.5 text-gray-400" />,
    },
  ]
    .map((item) => item || null)
    .filter((item) => item !== null);

  return (
    <LeftBarContainer
      getBack={getBack}
      leftHeaderChild={
        <>
          <DropDown
            isOpen={isDropDownOpen}
            setIsOpen={setIsDropDownOpen}
            dropDownItems={dropDownItems}
            classNames="top-0 right-0 w-48"
            button={
              <BsThreeDotsVertical className="size-8 cursor-pointer ml-auto pr-2" />
            }
          />
        </>
      }
    >
      <Modal />
      <div className="relative text-white">
        <div className="absolute px-4 inset-x-0 w-full">
          <div className="flex items-center gap-3 my-3">
            {
              <div
                className={`flex-center relative size-14 ${
                  (!avatar || !uploadedImageUrl) && "bg-darkBlue"
                } overflow-hidden rounded-full`}
              >
                {avatar || uploadedImageUrl ? (
                  <Image
                    src={avatar || uploadedImageUrl!}
                    className="cursor-pointer object-cover size-full rounded-full"
                    width={55}
                    height={55}
                    alt="avatar"
                  />
                ) : (
                  <div className="flex-center bg-darkBlue shrink-0 text-center font-bold text-xl mt-1">
                    {name?.length && name![0]}
                  </div>
                )}

                {isLoading && <Loading classNames="absolute w-11 bg-white" />}
              </div>
            }

            <div className="flex justify-center flex-col gap-1">
              <h3 className="font-bold text-lg font-vazirBold line-clamp-1 text-ellipsis">
                {name + " " + lastName}
              </h3>

              <div className="font-bold text-[14px] text-darkGray font-vazirBold line-clamp-1 whitespace-normal text-nowrap">
                Online
              </div>
            </div>
          </div>

          <span className="absolute right-5 top-12 size-14 rounded-full cursor-pointer bg-darkBlue flex-center">
            <MdAddAPhoto className="size-6" onClick={avatarElem} />
          </span>
        </div>

        <div className="h-20"></div>

        <div className="flex flex-col">
          <p className="text-darkBlue font-vazirBold py-2 px-4 font-bold text-sm">
            Account
          </p>

          <div className="cursor-pointer px-4 py-2 hover:bg-white/5 transition-all duration-200">
            <p className="text-sm">
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
            <p className="text-darkGray text-[13px]">
              Tap to change phone number
            </p>
          </div>

          <LineSeparator />

          <div
            onClick={() => updateRoute("edit-username")}
            className="cursor-pointer px-4 py-2 hover:bg-white/5 transition-all duration-200"
          >
            <p className="text-sm">@{username}</p>
            <p className="text-darkGray text-[13px]">Username</p>
          </div>

          <LineSeparator />

          <div
            onClick={() => updateRoute("edit-info")}
            className="cursor-pointer px-4 py-2 hover:bg-white/5 transition-all duration-200"
          >
            <p className="text-sm">{biography ? biography : "Bio"}</p>
            <p className="text-darkGray text-[13px]">
              {biography ? "Bio" : "Add a few words about yourself"}
            </p>
          </div>
        </div>

        <p className="h-2 w-full bg-black/70  absolute"></p>

        <div className="flex flex-col pt-1">
          <p className="text-darkBlue font-vazirBold px-4 py-2 mt-2 text-sm">
            Settings
          </p>

          <MenuItem
            icon={<BsChat />}
            title="Chat Settings"
            onClick={() => {}}
          />

          <LineSeparator />

          <MenuItem
            icon={<CiLock />}
            title="Privacy and Security"
            onClick={() => {}}
          />

          <LineSeparator />

          <MenuItem
            icon={<GoBell />}
            title="Notifications and Sounds"
            onClick={() => {}}
          />

          <LineSeparator />

          <MenuItem
            icon={<CiBatteryCharging />}
            title="Power Saving"
            onClick={() => {}}
          />

          <LineSeparator />

          <span className="relative flex items-center">
            <MenuItem
              icon={<MdLanguage />}
              title="Language"
              onClick={() => {}}
            />
            <span className="text-darkBlue absolute right-4 text-sm">
              English
            </span>
          </span>
        </div>

        <p className="h-2 w-full bg-black/70  absolute"></p>

        <div className="flex flex-col pt-1">
          <p className="text-darkBlue font-vazirBold px-4 py-2 mt-2 text-sm">
            Help
          </p>

          <MenuItem
            icon={<IoChatbubbleEllipsesOutline />}
            title="Ask a Question"
            onClick={() => {}}
          />

          <LineSeparator />

          <MenuItem
            icon={<AiOutlineQuestionCircle />}
            title="Telegram FAQ"
            onClick={() => {}}
          />

          <LineSeparator />

          <MenuItem
            icon={<GoShieldCheck />}
            title="Privacy Policy"
            onClick={() => {}}
          />
        </div>

        <div className="w-full  pt-3 px-4 text-center bg-black/70">
          Created with 💙 by{" "}
          <a
            target="_blank"
            href="https://github.com/Saeed-Abedini"
            className="text-darkBlue"
          >
            SAEED
          </a>{" "}
        </div>
      </div>
    </LeftBarContainer>
  );
};

export default Settings;
