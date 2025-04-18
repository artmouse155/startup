const MsgTypes = {
  System: "system",
  ConnectionData: "connectionData",
  connect: "connect",
  disconnect: "disconnect",
  gameConnect: "gameConnect",
  gameDisconnect: "gameDisconnect",
};

class Event {
  constructor(from, type, value) {
    this.from = from;
    this.type = type;
    this.value = value;
  }
}

class GameEventNotifier {
  constructor({
    newConnectionDataHandler,
    newMessageHandler,
    connectedGetter,
    connectedSetter,
    gameConnectedGetter,
    gameConnectedSetter,
  }) {
    this.newConnectionDataHandler = newConnectionDataHandler;
    this.newMessageHandler = newMessageHandler;
    this.connectedGetter = connectedGetter;
    this.connectedSetter = connectedSetter;
    this.gameConnectedGetter = gameConnectedGetter;
    this.gameConnectedSetter = gameConnectedSetter;
    let port = window.location.port;
    const protocol = window.location.protocol === "http:" ? "ws" : "wss";
    this.socket = new WebSocket(
      `${protocol}://${window.location.hostname}:${port}/ws`
    );
    this.socket.onopen = (event) => {
      this.receiveEvent(
        new Event("Self", MsgTypes.connect, { msg: "connected" })
      );
    };
    this.socket.onclose = (event) => {
      this.receiveEvent(
        new Event("Self", MsgTypes.disconnect, { msg: "disconnected" })
      );
    };
    this.socket.onmessage = async (msg) => {
      try {
        const event = JSON.parse(await msg.data);
        this.receiveEvent(event);
      } catch (err) {
        console.error("Error parsing message: ", msg.data, "Error: ", err);
      }
    };
  }

  broadcastEvent(from, type, value) {
    const event = new Event(from, type, value);
    this.socket.send(JSON.stringify(event));
  }

  receiveEvent(event) {
    // console.log("[WS] Received event:", event);
    switch (event.type) {
      case MsgTypes.connect:
        this.connectedSetter(true);
        // console.log("[WS] Connected to server:", event.value.msg);
        break;
      case MsgTypes.disconnect:
        this.connectedSetter(false);
        // console.log("[WS] Disconnected from server:", event.value.msg);
        break;
      case MsgTypes.gameConnect:
        // console.log("[WS] Game connected: ", event.value.msg);
        this.gameConnectedSetter(true);
        this.requestConnectionData();
        break;
      case MsgTypes.gameDisconnect:
        // console.log("[WS] Game disconnected:", event.value.msg);
        this.gameConnectedSetter(false);
        break;
      case MsgTypes.ConnectionData:
        if (this.newConnectionDataHandler) {
          this.newConnectionDataHandler(event.value);
        }
        break;
      case MsgTypes.System:
        // console.log(event.value.msg);
        if (this.newMessageHandler) {
          this.newMessageHandler(event.value.msg);
        }
        break;
      default:
        // console.log(event);
        break;
    }
  }

  connectToGameServer(email) {
    this.email = email;
    this.broadcastEvent(email, MsgTypes.gameConnect, { msg: "GET" });
  }

  requestConnectionData() {
    this.broadcastEvent(this.email, MsgTypes.ConnectionData, { msg: "GET" });
  }
}

export { MsgTypes, GameEventNotifier };
