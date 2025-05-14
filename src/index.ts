import dotenv from "dotenv";
import { web } from "./application/web";
import { createServer } from "http";

dotenv.config()

const PORT = process.env.PORT

const httpServer = createServer(web)

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
