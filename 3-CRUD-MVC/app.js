const express = require("express");
const multer = require("multer");

const app = express();

// Middlewares
app.use(express.urlencoded({ extended: true }));
const upload = multer({ storage: multer.memoryStorage() });

// Views
app.set("view engine", "ejs");
app.set("views", "./views");

// Routes
const productController = require("./controllers/product-controller");

// Routes View
app.get("/", productController.renderItem);
app.get("/form", productController.renderForm);
app.get("/form/:id", productController.renderForm);

// Routes API
app.post("/products", upload.single("image"), productController.handleUpsert);
app.post(
  "/products/:id",
  upload.single("image"),
  productController.handleUpsert,
);
app.post("/products/delete/:id", productController.handleDelete);

// Listen
app.listen(3000, () => console.log("Server chạy dồi"));
