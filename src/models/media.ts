import User from "./User";

export default interface Media {
  _id: string;
  file: File;
  sender: User;
  roomID: string;
  createdAt: string;
  updatedAt: string;
}
