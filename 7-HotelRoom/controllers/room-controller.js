const {
  getAllRooms,
  getRoomById,
  upsertRoom,
  deleteRoomById,
  getLengthByRoomType,
} = require("../services/room-service");

const handleRenderIndex = async (req, res) => {
  const { nameQuery, statusQuery } = req.query;
  const data = await getAllRooms(nameQuery, statusQuery);
  const data2 = await getLengthByRoomType();
  res.render("index", { rooms: data, roomLengths: data2 });
};

const handleRenderForm = async (req, res) => {
  const { roomId } = req.params;
  const data = roomId ? await getRoomById(roomId) : null;
  res.render("form", { room: data });
};

const handleUpsertRoom = async (req, res) => {
  const { roomId } = req.params;
  try {
    await upsertRoom(roomId, req.body, req.file);
    res.redirect("/");
  } catch (err) {
    res.render("form", { room: { roomId, ...req.body }, error: err.message });
  }
};
const handleDeleteRoomById = async (req, res) => {
  const { roomId } = req.params;
  await deleteRoomById(roomId);
  res.redirect("/");
};

module.exports = {
  handleRenderIndex,
  handleRenderForm,
  handleUpsertRoom,
  handleDeleteRoomById,
};
