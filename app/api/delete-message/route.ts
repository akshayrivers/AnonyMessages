import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function DELETE(request: Request) {

  await dbConnect();

  const url = new URL(request.url);
  const messageId = url.searchParams.get("message_id");

  if (!messageId) {
    return NextResponse.json(
      { success: false, message: "Missing message_id query parameter" },
      { status: 400 }
    );
  }

  try {
    const updatedUser = await UserModel.findOneAndUpdate(
      { "messages._id": messageId },
      { $pull: { messages: { _id: messageId } } },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Message deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete message" },
      { status: 500 }
    );
  }
}
