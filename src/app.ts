import express, { Express } from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";

class App {
  server: Express;
  httpServer: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
  io: Server;
  constructor() {
    this.server = express();
    this.httpServer = http.createServer(this.server);
    this.io = new Server(this.httpServer, {
      cors: {
        origin: "*",
        credentials: true,
      },
    });

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(express.json());
    this.server.use(cors());
  }

  routes() {
    this.server.use("/", (req, res) => {
      res.send("Server UP!");
    });
  }
}

export default new App();

/* import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import "dotenv/config";

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(socket.id);
});

app.use(cors());

app.get("/", (req, res) => {
  res.send("Server UP!");
});

httpServer.listen(5000, () => {
  console.log("Server listening");
}); */
