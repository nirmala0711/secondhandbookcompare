const Wishlist = require("../models/Wishlist");
const database = require("../config/database");
const { getAuthUser } = require("../middleware/authMiddleware");

async function getWishlist(req, res) {
  const user = getAuthUser(req);
  const userId = user ? user.id : req.query.userId;
  if (!userId) return res.status(401).json({ success: false, items: [] });

  const items = database.isDbConnected
    ? await Wishlist.find({ userId })
    : database.memoryWishlist.filter((i) => i.userId === userId);
  return res.json({ success: true, items });
}

async function addWishlistItem(req, res) {
  const user = getAuthUser(req);
  const userId = user ? user.id : req.body.userId;
  if (!userId)
    return res.status(401).json({ success: false, message: "Please Login" });

  const book = req.body;
  const bookId = book.bookId || book.id || "";

  if (database.isDbConnected) {
    const existingItem = await Wishlist.findOne({
      userId,
      $or: bookId
        ? [{ bookId }]
        : [
            { title: book.title, website: book.website, price: book.price },
          ],
    });
    if (existingItem) return res.json({ success: true, item: existingItem });

    const item = await Wishlist.create({ ...book, bookId, userId });
    return res.json({ success: true, item });
  }

  const duplicate = database.memoryWishlist.find((item) =>
    item.userId === userId &&
    (bookId
      ? item.bookId === bookId
      : item.title === book.title &&
        item.website === book.website &&
        Number(item.price) === Number(book.price))
  );
  if (duplicate) return res.json({ success: true, item: duplicate });

  const newItem = { ...book, bookId, userId, id: `wish-${Date.now()}` };
  database.memoryWishlist.unshift(newItem);
  return res.json({ success: true, item: newItem });
}

async function deleteWishlistItem(req, res) {
  const id = req.params.id;
  if (database.isDbConnected) {
    await Wishlist.findByIdAndDelete(id).catch(() => {});
  } else {
    database.memoryWishlist = database.memoryWishlist.filter(
      (i) => i.id !== id && i._id !== id,
    );
  }
  return res.json({ success: true });
}

async function clearWishlist(req, res) {
  const user = getAuthUser(req);
  const userId = user ? user.id : req.query.userId;
  if (database.isDbConnected) {
    await Wishlist.deleteMany({ userId });
  } else {
    database.memoryWishlist = database.memoryWishlist.filter(
      (i) => i.userId !== userId,
    );
  }
  return res.json({ success: true });
}

module.exports = {
  getWishlist,
  addWishlistItem,
  deleteWishlistItem,
  clearWishlist,
};
