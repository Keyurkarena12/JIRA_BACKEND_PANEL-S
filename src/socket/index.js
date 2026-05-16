import Message from "../models/Message.js";
import ChatRoom from "../models/ChatRoom.js";

const socketHandler = (io) => {   //----receive io from server.js
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Join a specific chat room
    socket.on("join_room", async ({ roomId, userId }) => {
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);
      
      // Optionally notify others
      // socket.to(roomId).emit("user_joined", { userId });
    });

    // Handle sending messages
    socket.on("send_message", async (data) => {
      const { chatRoomId, senderId, content, type } = data;

      try {
        // Save message to database
        const newMessage = await Message.create({
          chatRoom: chatRoomId,
          sender: senderId,
          content,
          type: type || "text"
        });

        // Populate sender info for the frontend
        const populatedMessage = await Message.findById(newMessage._id)
          .populate("sender", "name email profilePicture");

        // Update last message in ChatRoom
        await ChatRoom.findByIdAndUpdate(chatRoomId, {
          lastMessage: {
            content,
            sender: senderId,
            timestamp: new Date()
          }
        });

        // Broadcast message means sender not seen message but others have seen message  
        io.to(chatRoomId).emit("receive_message", populatedMessage);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle typing indicators
    socket.on("typing", ({ roomId, userId, userName }) => {
      socket.to(roomId).emit("user_typing", { userId, userName });
    });

    socket.on("stop_typing", ({ roomId, userId }) => {
      socket.to(roomId).emit("user_stop_typing", { userId });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

export default socketHandler;
