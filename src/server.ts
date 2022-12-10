import { PrismaClient } from "@prisma/client";
import app from "./app";
import "dotenv/config";

const prisma = new PrismaClient();

type User = {
  username: string;
  password: string;
};

type Room = {
  name: string;
  privateRoom: boolean;
};

type Message = {
  username: string;
  room_name: string;
  content: string;
};

app.io.on("connection", async (socket) => {
  const rooms = await prisma.room.findMany({});
  socket.emit("rooms", rooms);

  socket.on("sign_up", async (data, callback) => {
    const { username, password }: User = data;
    if (!username || !password) return;

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (user) return callback({ status: false, message: `Usuário ${username} ja existe!` });

    await prisma.user.create({
      data: {
        username,
        password,
      },
    });

    callback({ status: true, message: `Usuário ${username} criado com sucesso!` });
  });

  socket.on("login", async (data, callback) => {
    const { username, password }: User = data;
    if (!username || !password) return;

    const user = await prisma.user.findFirst({
      where: {
        username,
        password,
      },
    });

    if (!user) return callback({ status: false, message: `Usuário ou senha inválidos!` });

    callback({ status: true, message: `Logado com sucesso!` });
  });

  socket.on("room", async (data, callback) => {
    const { name, privateRoom }: Room = data;
    if (!name || name.length < 3)
      return callback({ status: false, message: `Digite um nome de sala válido.` });

    const room = await prisma.room.findUnique({
      where: {
        name,
      },
    });

    if (room) return callback({ status: false, message: `Sala ${name} ja existe!` });

    await prisma.room.create({
      data: {
        name,
        private: privateRoom,
      },
    });

    socket.join(name);

    const rooms = await prisma.room.findMany({});

    socket.broadcast.emit("rooms", rooms);
    socket.emit("rooms", rooms);

    callback({ status: true, message: `Sala  criada com sucesso.` });
  });

  socket.on("join_room", async (data, callback) => {
    const { name } = data;
    socket.join(name);

    const messages = await prisma.message.findMany({
      where: {
        room_name: name,
      },
    });

    socket.emit("joined_room", name);
    socket.emit("message", messages);
  });

  socket.on("message", async (data, callback) => {
    const { username, room_name, content }: Message = data;
    if (!username || !room_name) return callback({ status: false, message: `Necessário fazer login.` });
    if (content.length < 1) return callback({ status: false, message: `Digite uma mensagem.` });

    await prisma.message.create({
      data: {
        username,
        room_name,
        content,
      },
    });

    const messages = await prisma.message.findMany({
      where: {
        room_name,
      },
    });

    app.io.to(room_name).emit("message", messages);
  });
});

app.httpServer.listen(process.env.PORT || 5000, Number(process.env.HOST), () => {
  console.log("Server listening");
});
