import app from "./app";
import "dotenv/config";

app.io.on("connection", (socket) => {
  console.log(socket.id);
});

app.httpServer.listen(process.env.PORT || 5000, Number(process.env.HOST), () => {
  console.log("Server listening");
});
