const express = require("express");
const multer = require("multer");
const {
  handleRenderIndex,
  handleRenderForm,
  handleUpsert,
  handleDeleteRoomById,
} = require("./controller/room-controller");

const app = express();

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", "./views");

const upload = multer({ storage: multer.memoryStorage() });

app.get("/", handleRenderIndex);
app.get("/form", handleRenderForm);
app.get("/form/:roomId", handleRenderForm);
app.post("/rooms/upsert", upload.single("image"), handleUpsert);
app.post("/rooms/upsert/:roomId", upload.single("image"), handleUpsert);
app.post("/rooms/delete/:roomId", handleDeleteRoomById);

app.listen(3000);
