const GameEvent = {
  System: "system",
  ConnectionData: "connectionData",
  End: "gameEnd",
  Start: "gameStart",
};

class Event {
  constructor(from, type, value) {
    this.from = from;
    this.type = type;
    this.value = value;
  }
}

class GameEventNotifier {
  newConnectionDataHandler = null;
  newMessageHandler = null;

  constructor() {
    let port = window.location.port;
    const protocol = window.location.protocol === "http:" ? "ws" : "wss";
    this.socket = new WebSocket(
      `${protocol}://${window.location.hostname}:${port}/ws`
    );
    this.socket.onopen = (event) => {
      this.receiveEvent(
        new Event("Self", GameEvent.System, { msg: "connected" })
      );
    };
    this.socket.onclose = (event) => {
      this.receiveEvent(
        new Event("Self", GameEvent.System, { msg: "disconnected" })
      );
    };
    this.socket.onmessage = async (msg) => {
      try {
        const event = JSON.parse(await msg.data.text());
        this.receiveEvent(event);
      } catch {}
    };
  }

  broadcastEvent(from, type, value) {
    const event = new Event(from, type, value);
    this.socket.send(JSON.stringify(event));
  }

  receiveEvent(event) {
    if (event.type === GameEvent.ConnectionData) {
      if (this.newConnectionDataHandler) {
        this.newConnectionDataHandler(event.value);
      }
    } else if (event.type === GameEvent.System) {
      console.log(event.value.msg);
      if (this.newMessageHandler) {
        this.newMessageHandler(event.value.msg);
      }
    } else {
      console.log(event);
    }
  }
}

const GameNotifier = new GameEventNotifier();
export { GameEvent, GameNotifier };
