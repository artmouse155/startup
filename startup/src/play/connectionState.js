export class ConnectionState {
  static Unknown = new ConnectionState("unknown");
  static Connected = new ConnectionState("connected");
  static Connecting = new ConnectionState("connecting");
  static Disconnected = new ConnectionState("disconnected");

  constructor(name) {
    this.name = name;
  }
}
