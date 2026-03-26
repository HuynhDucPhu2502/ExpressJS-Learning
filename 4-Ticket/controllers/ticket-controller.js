const {
  deleteTicketById,
  getAllTickets,
  getTicketById,
  upsertTicket,
} = require("../services/ticket-service");

const handleRenderIndex = async (req, res) => {
  const tickets = await getAllTickets();
  res.render("index", { tickets });
};

const handleRenderForm = async (req, res) => {
  const ticketId = req.params.ticketId;
  const ticket = ticketId ? await getTicketById(ticketId) : null;
  res.render("form", { ticket });
};

const handleUpsert = async (req, res) => {
  const { ticketId } = req.params;

  await upsertTicket(ticketId, req.body, req.file);
  res.redirect("/");
};

const handleDelete = async (req, res) => {
  await deleteTicketById(req.params.ticketId);
  res.redirect("/");
};

module.exports = {
  handleRenderForm,
  handleRenderIndex,
  handleDelete,
  handleUpsert,
};
