const {
  getAll,
  getById,
  upsert,
  deleteById,
  handleThongKe,
} = require("../service/appointment-service");

const handleRenderIndex = async (req, res) => {
  const { nameQuery, statusQuery } = req.query;
  const data = await getAll(nameQuery, statusQuery);
  const data2 = await handleThongKe();
  res.render("index", { appointments: data, thongKe: data2 });
};

const handleRenderForm = async (req, res) => {
  const { appointmentId } = req.params;
  const data = appointmentId ? await getById(appointmentId) : null;
  res.render("form", { appointment: data });
};

const handleUpsert = async (req, res) => {
  const { appointmentId } = req.params;
  try {
    await upsert(appointmentId, req.body, req.file);
    res.redirect("/appointments");
  } catch (err) {
    res.render("form", {
      appointment: { appointmentId, ...req.body },
      error: err.message,
    });
  }
};

const handleDeleteById = async (req, res) => {
  const { appointmentId } = req.params;
  await deleteById(appointmentId);
  res.redirect("/appointments");
};

module.exports = {
  handleRenderIndex,
  handleRenderForm,
  handleUpsert,
  handleDeleteById,
};
