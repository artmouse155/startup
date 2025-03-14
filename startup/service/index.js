const express = require("express");
const app = express();

const port = process.argv.length > 2 ? process.argv[2] : 4000;

app.get("*", (_req, res) => {
  res.send({ msg: "Text Adventure Showdown service" });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
