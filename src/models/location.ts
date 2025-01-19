import User from "./User";

export default interface Location {
  _id: string;
  x: number;
  y: number;
  sender: User;
  roomID: string;
  createdAt: string;
  updatedAt: string;
}
