import dotenv from "dotenv";
import { web } from "./application/web";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
// import { ChatService } from "./service/chat-service";

dotenv.config();

const PORT = process.env.PORT;

const httpServer = createServer(web);

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
