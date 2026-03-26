const express = require("express");
const multer = require("multer");
const ticketController = require("./controllers/ticket-controller");

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
const upload = multer({ storage: multer.memoryStorage() });

// Views
app.set("view engine", "ejs");
app.set("views", "./views");

// Views Route
app.get("/", ticketController.handleRenderIndex);
app.get("/form", ticketController.handleRenderForm);
app.get("/form/:ticketId", ticketController.handleRenderForm);

// Api Route
app.post(
  "/tickets/upsert",
  upload.single("imageUrl"),
  ticketController.handleUpsert,
);
app.post(
  "/tickets/upsert/:ticketId",
  upload.single("imageUrl"),
  ticketController.handleUpsert,
);
app.post("/tickets/delete/:ticketId", ticketController.handleDelete);

// Listen
app.listen(3000, () => {
  console.log("Server mở rồi nè");
});
