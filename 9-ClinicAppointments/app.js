const express = require("express");
const multer = require("multer");
const {
  handleRenderIndex,
  handleRenderForm,
  handleUpsert,
  handleDeleteById,
} = require("./controller/appointment-controller");

const app = express();

app.use(express.urlencoded({ extended: true }));
const upload = multer({ storage: multer.memoryStorage() });

app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/appointments", handleRenderIndex);
app.get("/appointments/form", handleRenderForm);
app.get("/appointments/form/:appointmentId", handleRenderForm);
app.post("/appointments/upsert", upload.single("image"), handleUpsert);
app.post(
  "/appointments/upsert/:appointmentId",
  upload.single("image"),
  handleUpsert,
);
app.post("/appointments/delete/:appointmentId", handleDeleteById);

app.listen(3000);
