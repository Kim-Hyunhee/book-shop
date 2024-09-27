const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

const addToCart = (req, res) => {
  const { bookId, userId, quantity } = req.body;

  const sql = `INSERT INTO cartItems(book_id, quantity, user_id) VALUES (?, ?, ?);`;
  const values = [bookId, userId, quantity];
  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    return res.status(StatusCodes.CREATED).json(results);
  });
};

const getCartItems = (req, res) => {
  const { userId, selected } = req.body;

  const sql = `SELECT cartItems.id, book_id, books.title, books.summary, quantity, books.price
               FROM cartItems LEFT JOIN books
               ON cartItems.book_id = books.id
               WHERE user_id = ? AND cartItems.id IN (?);`;
  conn.query(sql, [userId, selected], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    return res.status(StatusCodes.OK).json(results);
  });
};

const removeCartItem = (req, res) => {};

module.exports = { addToCart, getCartItems, removeCartItem };
