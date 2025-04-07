const { WebSocketServer } = require("ws");

function peerProxy(httpServer, roomCodeByEmail) {
  // Create a websocket object
  const socketServer = new WebSocketServer({ server: httpServer });

  // Send event to room code
  function sendEvent(roomCode, event) {
    socketServer.clients.forEach((client) => {
      if (
        client.readyState === WebSocket.OPEN &&
        client.roomCode === roomCode
      ) {
        client.send(JSON.stringify(event));
      }
    });
  }

  socketServer.on("connection", async (socket) => {
    socket.isAlive = true;
    socket.email = socket.from;
    socket.roomCode = await roomCodeByEmail(socket.email);
    console.log(
      `[${socket.roomCode}] New websocket connection from ${socket.email} `
    );

    // Forward messages to everyone in room code INCLUDING sender
    // socket.on("message", function message(data) {
    //   socketServer.clients.forEach((client) => {
    //     if (
    //       client.readyState === WebSocket.OPEN &&
    //       client.roomCode === socket.roomCode
    //     ) {
    //       client.send(data);
    //     }
    //   });
    // });

    // Respond to pong messages by marking the connection alive
    socket.on("pong", () => {
      socket.isAlive = true;
    });
  });

  // Periodically send out a ping message to make sure clients are alive
  setInterval(() => {
    socketServer.clients.forEach(function each(client) {
      if (client.isAlive === false) return client.terminate();

      client.isAlive = false;
      client.ping();
    });
  }, 10000);

  return {
    sendEvent: sendEvent,
  };
}

module.exports = { peerProxy };
