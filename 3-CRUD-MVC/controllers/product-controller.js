const {
  deleteProductById,
  getAllProducts,
  getProductById,
  upsertProduct,
} = require("../services/product-service");

const renderItem = async (req, res) => {
  const data = await getAllProducts();

  res.render("index", { products: data });
};

const renderForm = async (req, res) => {
  const { id } = req.params;
  const product = id ? await getProductById(id) : null;

  res.render("form", { product });
};

const handleUpsert = async (req, res) => {
  try {
    await upsertProduct(req.params.id, req.body, req.file);
    res.redirect("/");
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const handleDelete = async (req, res) => {
  try {
    await deleteProductById(req.params.id);
    res.redirect("/");
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = {
  renderItem,
  renderForm,
  handleUpsert,
  handleDelete,
};
