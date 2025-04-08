const { WebSocketServer } = require("ws");

function peerProxy(
  httpServer,
  getConnectionData,
  getGameByPlayerEmail,
  getUserByToken,
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

  function updateRoomConnection(game, roomCode = null) {
    roomCode = roomCode || game.roomCode;

    console.log(
      `[${roomCode}] Updating connection data for all players in the room`
    );
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

  function sendRoomAlert(roomCode, alert) {
    console.log(`[${roomCode}] Sending alert to all players in the room`);
    if (!roomCode) return;
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

  socketServer.on("connection", async (socket, request) => {
    socket.isAlive = true;
    socket.authenticated = false;
    if (request.headers.cookie) {
      // From https://stackoverflow.com/questions/24951159/nodejs-how-to-get-cookie-in-ws-einaros

      //Not working any more
      //if(client.upgradeReq.headers.cookie) request.headers.cookie.split(';')...
      //This works
      var cookies = {};
      request.headers.cookie.split(";").forEach(function (cookie) {
        var parts = cookie.match(/(.*?)=(.*)$/);
        var name = parts[1].trim();
        var value = (parts[2] || "").trim();
        cookies[name] = value;
      });

      // console.log(`[     ] New websocket connection with cookies:`, cookies);
      if (cookies.token) {
        const user = await getUserByToken(cookies.token);
        if (user && user.email) {
          socket.email = user.email;
          socket.authenticated = true;
          console.log(`[     ] WS User authenticated: ${user.email}`);
        }
      }
    }

    if (!socket.authenticated) {
      console.log("[     ] Client not authenticated, ignoring request");
      socket.send(
        JSON.stringify({
          type: MsgTypes.System,
          value: {
            msg: "Authentication failed. Please log in again.",
          },
        })
      );
      socket.close();
      return;
    }
    console.log(`[     ] New websocket connection`);

    // Properly set up our client with an email and room code
    socket.on("message", async function message(data) {
      const event = JSON.parse(data);
      if (event.from && event.type && event.value) {
        switch (event.type) {
          case MsgTypes.gameConnect:
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
      // console
      //   .log(
      //   `[${socket.roomCode}] Received pong message from ${socket.email}`
      //   );
      socket.isAlive = true;
    });
  });

  // Periodically send out a ping message to make sure clients are alive
  setInterval(() => {
    socketServer.clients.forEach(function each(client) {
      if (client.isAlive === false) {
        console.log(
          `[${client.roomCode}] Terminated unresponsive websocket connection from ${client.email} `
        );
        removePlayerFromGame(client.email);
        return client.terminate();
      }

      client.isAlive = false;
      // console
      //   .log(
      //   `[${client.roomCode}] Sending ping message to ${client.email}`
      //   );
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
