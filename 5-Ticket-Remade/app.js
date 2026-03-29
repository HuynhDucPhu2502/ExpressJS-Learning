const express = require("express");
const multer = require("multer");
const {
  handleRenderIndex,
  handleRenderForm,
  handleUpsertTicket,
  handleDeleteTicketById,
} = require("./controller/ticket-controller");
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
const upload = multer({ storage: multer.memoryStorage() });

// View
app.set("view engine", "ejs");
app.set("views", "./views");

// View Route
app.get("/", handleRenderIndex);
app.get("/form/", handleRenderForm);
app.get("/form/:ticketId", handleRenderForm);

// Api Route
app.post("/tickets/upsert", upload.single("image"), handleUpsertTicket);
app.post(
  "/tickets/upsert/:ticketId",
  upload.single("image"),
  handleUpsertTicket,
);
app.post("/tickets/delete/:ticketId", handleDeleteTicketById);

// Listen
app.listen(3000, () => {
  console.log("Server on");
});
