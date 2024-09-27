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

const getCartItems = (req, res) => {};

const removeCartItem = (req, res) => {};

module.exports = { addToCart, getCartItems, removeCartItem };
