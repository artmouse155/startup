const { WebSocketServer } = require("ws");

function peerProxy(httpServer, roomCodeByEmail, getConnectionData) {
  // Create a websocket object
  const MsgTypes = {
    System: "system",
    ConnectionData: "connectionData",
    connect: "connect",
    disconnect: "disconnect",
    gameConnect: "gameConnect",
    gameDisconnect: "gameDisconnect",
  };

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
    console.log(`[] New websocket connection`);

    // Properly set up our client with an email and room code
    socket.on("message", async function message(data) {
      const event = JSON.parse(data);
      if (event.from && event.type && event.value) {
        switch (event.type) {
          case MsgTypes.gameConnect:
            socket.email = event.from;
            socket.roomCode = await roomCodeByEmail(socket.email);
            console.log(
              `[${socket.roomCode}] New game websocket connection from ${socket.email}`
            );
            socket.send(
              JSON.stringify({
                type: MsgTypes.gameConnect,
                value: { msg: "connected", roomCode: socket.roomCode },
              })
            );
            break;
          case MsgTypes.ConnectionData:
            console.log(
              `[${socket.roomCode}] Websocket connection data request from ${socket.email}`
            );
            socket.send(
              JSON.stringify({
                type: MsgTypes.ConnectionData,
                value: await getConnectionData(socket.email),
              })
            );
            break;
        }
      } else {
        console.log("Received non-uniform message:", event);
      }
    });
    // });

    // Respond to pong messages by marking the connection alive
    socket.on("pong", () => {
      socket.isAlive = true;
    });
  });

  // Periodically send out a ping message to make sure clients are alive
  setInterval(() => {
    socketServer.clients.forEach(function each(client) {
      if (client.isAlive === false) {
        console.log(
          `[${socket.roomCode}] Terminated websocket connection from ${socket.email} `
        );
        return client.terminate();
      }

      client.isAlive = false;
      client.ping();
    });
  }, 10000);

  return {
    sendEvent: sendEvent,
  };
}

module.exports = { peerProxy };
