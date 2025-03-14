export class ConnectionState {
  static Unknown = new ConnectionState("unknown");
  static Connected = new ConnectionState("connected"); // In game
  static Connecting = new ConnectionState("connecting"); // In lobby
  static Disconnected = new ConnectionState("disconnected");

  constructor(name) {
    this.name = name;
  }
}
