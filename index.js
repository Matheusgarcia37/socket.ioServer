const io = require("socket.io")(3004, {
  cors: {
    //origin: "http://localhost:3005",
    origin: "http://vozdopovo.ddns.net:3000" 
  },
});

let usersDenunciaId = [];

function addUsers(denunciaId, socketId) {
  !usersDenunciaId.some((user) => user.socketId === socketId) &&
    usersDenunciaId.push({ denunciaId, socketId });
}

function removeUser(socketId) {
  usersDenunciaId = usersDenunciaId.filter(
    (user) => user.socketId !== socketId
  );
}

function getUsers(denunciaId, socketId) {
  const users = usersDenunciaId.map((user) => {
    if (user.denunciaId === denunciaId && user.socketId != socketId) {
      return user.socketId;
    }
  });
  return users;
}

io.on("connection", (socket) => {
  //quando logar
  console.log("a user connected");
  //pegar o socketid e o id do usuario
  socket.on("addUser", (denunciaId) => {
    addUsers(denunciaId, socket.id);
    socket.emit("getUsers", usersDenunciaId);
  });

  //para enviar e receber mensagens
  socket.on("sendMessage", (data) => {
    const users = getUsers(data.comentario.denunciaId, socket.id);
    io.to(users).emit("getMessage", data);
  });

  //quando desconectar
  socket.on("disconnect", () => {
    console.log("user disconnected");
    removeUser(socket.id);
  });
});
