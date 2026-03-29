const {
  getAllTickets,
  getTicketById,
  upsertTicket,
  deleteTicketById,
} = require("../service/ticket-service");

const handleRenderIndex = async (req, res) => {
  const data = await getAllTickets();
  res.render("index", { tickets: data });
};
const handleRenderForm = async (req, res) => {
  const { ticketId } = req.params;
  const data = ticketId ? await getTicketById(ticketId) : null;
  res.render("form", { ticket: data });
};
const handleUpsertTicket = async (req, res) => {
  const { ticketId } = req.params;
  try {
    await upsertTicket(ticketId, req.body, req.file);
    res.redirect("/");
  } catch (err) {
    console.log(err.message);
    res.render("form", {
      ticket: { ticketId, ...req.body },
      error: err.message,
    });
  }
};
const handleDeleteTicketById = async (req, res) => {
  const { ticketId } = req.params;
  try {
    await deleteTicketById(ticketId);
    res.redirect("/");
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
};

module.exports = {
  handleRenderIndex,
  handleRenderForm,
  handleUpsertTicket,
  handleDeleteTicketById,
};
