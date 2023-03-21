import express from "express"
import listEndpoints from "express-list-endpoints"
import cors from "cors"
import mongoose from "mongoose"
import {
  badRequestHandler,
  notFoundHandler,
  genericErrorHandler,
  unauthorizedErrorHandler,
  forbiddenErrorHandler
} from "./errorHandlers.js"
import usersRouter from "./api/users/index.js"
import projectsRouter from "./api/projects/index.js"
import adminRouter from "./api/swatches/index.js"

const server = express()
const port = process.env.PORT || 3004

// ---------------- WHITELIST FOR CORS ------------------

const corsOptions = {
  cors: {
    origin: process.env.FE_URL || process.env.FE_PROD_URL,
    // origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }
}

server.use(express.json())
// server.use(cors(corsOptions))
server.use(cors(corsOptions))

// ---------------- ENDPOINTS ------------------

server.use("/users", usersRouter)
server.use("/projects", projectsRouter)
server.use("/admin", adminRouter)

// ---------------- ERROR HANDLERS ------------------
server.use(badRequestHandler) // 400
server.use(unauthorizedErrorHandler)
server.use(forbiddenErrorHandler)
server.use(notFoundHandler) // 404
server.use(genericErrorHandler) // 500

// ---------------- SERVER ------------------

mongoose.set("strictQuery", false)
mongoose.connect(process.env.MONGO_URL)

mongoose.connection.on("connected", () => {
  console.log("connected to mongo!")
  server.listen(port, () => {
    console.table(listEndpoints(server))
    console.log("server is running on port:", port)
  })
})
