import connectToDB from "@/db";
import Room from "@/models/room";
import MessageSchema from "@/schemas/messageSchema";
import RoomSchema from "@/schemas/roomSchema";
import UserSchema from "@/schemas/userSchema";

export const POST = async (req: Request) => {
  try {
    await connectToDB();
    const { query } = await req.json();
    const { userID, payload: purePayload } = query;

    const payload = purePayload.toLowerCase();

    let result;

    if (payload.startsWith("@")) {
      result = await RoomSchema.findOne({ link: payload });
      if (!result) result = await UserSchema.findOne({ username: payload });

      if (result) return Response.json([result], { status: 200 });
      return Response.json(null, { status: 404 });
    }

    const userRoomsData: Room[] = await RoomSchema.find({
      participants: { $in: userID },
    })
      .populate("messages", "", MessageSchema)
      .populate("participants")
      .lean();

    const searchResult: (Room & { findBy: keyof Room })[] = [];

    userRoomsData.forEach((roomData) => {
      if (
        roomData.type !== "private" &&
        roomData.name.toLowerCase().includes(payload)
      ) {
        searchResult.push({ ...roomData, findBy: "name" });
      }

      if (
        roomData.type == "private" &&
        roomData.participants.some(
          (data: any) =>
            data._id !== userID && data.name.toLowerCase().includes(payload)
        )
      ) {
        searchResult.push({
          ...roomData,
          findBy: "participants",
          name:
            roomData.participants
              .filter((data: any) => data._id !== roomData.creator)
              .at(-1)?.name ?? "-",
        });
      }

      roomData.messages.forEach((msgData) => {
        const isMsgDeletedForUser = msgData.hideFor.some((id) => {
          if (id.toString() === userID.toString()) return true;
        });

        if (
          !isMsgDeletedForUser &&
          msgData.message.toLowerCase().includes(payload)
        ) {
          searchResult.push({
            ...roomData,
            findBy: "messages",
            messages: [msgData],
            name:
              roomData.type == "private"
                ? roomData.participants
                    .filter((data: any) => data._id !== roomData.creator)
                    .at(-1)?.name ?? "-"
                : roomData.name,
          });
        }
      });
    });

    return Response.json(searchResult, { status: 200 });
  } catch (err) {
    console.log(err);
    return Response.json(
      { message: "Unknown error, try later." },
      { status: 500 }
    );
  }
};
