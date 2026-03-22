const express = require("express");

const app = express();

app.get("/hello", (req, res) => {
  res.send("Hi cậu 2");
});

app.listen(3000, () => {
  console.log("App khởi rồi nèeeeee");
});
