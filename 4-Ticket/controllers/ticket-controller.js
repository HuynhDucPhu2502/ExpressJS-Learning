const {
  deleteTicketById,
  getAllTickets,
  getTicketById,
  upsertTicket,
} = require("../services/ticket-service");

const handleRenderIndex = async (req, res) => {
  const { nameQuery, statusQuery } = req.query;

  const tickets = await getAllTickets(nameQuery, statusQuery);
  res.render("index", { tickets });
};

const handleRenderForm = async (req, res) => {
  const ticketId = req.params.ticketId;
  const ticket = ticketId ? await getTicketById(ticketId) : null;
  res.render("form", { ticket });
};

const handleUpsert = async (req, res) => {
  const { ticketId } = req.params;
  try {
    await upsertTicket(ticketId, req.body, req.file);
    res.redirect("/");
  } catch (err) {
    res.render("form", {
      ticket: { ticketId, ...req.body },
      error: err.message,
    });
  }
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
