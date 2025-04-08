const { WebSocketServer } = require("ws");

function peerProxy(
  httpServer,
  roomCodeByEmail,
  getConnectionData,
  getGameByPlayerEmail,
  removePlayerFromGame
) {
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
      if (client.roomCode === roomCode) {
        client.send(JSON.stringify(event));
      }
    });
  }

  function updateRoomConnection(game) {
    console.log(
      `[${game.roomCode}] Updating connection data for all players in the room`
    );
    if (!game) return;

    const roomCode = game.roomCode;
    socketServer.clients.forEach((client) => {
      if (client.roomCode === roomCode) {
        client.send(
          JSON.stringify({
            type: MsgTypes.ConnectionData,
            value: getConnectionData(game, client.email),
          })
        );
      }
    });
  }

  function sendRoomAlert(game, alert) {
    console.log(`[${game.roomCode}] Sending alert to all players in the room`);
    if (!game) return;

    const roomCode = game.roomCode;
    socketServer.clients.forEach((client) => {
      if (client.roomCode === roomCode) {
        client.send(
          JSON.stringify({
            type: MsgTypes.System,
            value: {
              msg: alert,
            },
          })
        );
      }
    });
  }

  socketServer.on("connection", async (socket) => {
    socket.isAlive = true;
    console.log(`[     ] New websocket connection`);

    // Properly set up our client with an email and room code
    socket.on("message", async function message(data) {
      const event = JSON.parse(data);
      if (event.from && event.type && event.value) {
        switch (event.type) {
          case MsgTypes.gameConnect:
            socket.email = event.from;
            const game = await getGameByPlayerEmail(socket.email);
            if (game) {
              socket.roomCode = game.roomCode;
              console.log(
                `[${socket.roomCode}] New game websocket connection from ${socket.email}`
              );
              socket.send(
                JSON.stringify({
                  type: MsgTypes.gameConnect,
                  value: {
                    msg: "connected",
                    connectionData: getConnectionData(game, socket.email),
                  },
                })
              );
            }
            break;
          case MsgTypes.ConnectionData:
            console.log(
              `[${socket.roomCode}] Websocket connection data request from ${socket.email}`
            );
            socket.send(
              JSON.stringify({
                type: MsgTypes.ConnectionData,
                value: await getConnectionData(
                  await getGameByPlayerEmail(socket.email),
                  socket.email
                ),
              })
            );
            break;
        }
      } else {
        console.log("Received non-uniform message:", event);
      }
    });
    // });

    socket.on("close", () => {
      console.log(
        `[${
          socket.roomCode || `     `
        }] Terminated closed websocket connection from ${socket.email}`
      );
      removePlayerFromGame(socket.email);
    });

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
          `[${socket.roomCode}] Terminated unresponsive websocket connection from ${socket.email} `
        );
        removePlayerFromGame(socket.email);
        return client.terminate();
      }

      client.isAlive = false;
      client.ping();
    });
  }, 10000);

  return {
    sendEvent: sendEvent,
    updateRoomConnection: updateRoomConnection,
    sendRoomAlert: sendRoomAlert,
  };
}

module.exports = { peerProxy };
