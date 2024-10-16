const ensureAuthorization = require("../auth"); // 인증 모듈
const jwt = require("jsonwebtoken");
const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const dotenv = require("dotenv");
dotenv.config();

const addToCart = (req, res) => {
  const { bookId, quantity } = req.body;
  const authorization = ensureAuthorization(req, res);

  if (authorization instanceof jwt.TokenExpiredError) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "로그인 세션이 만료되었습니다. 다시 로그인 해주세요." });
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "잘못된 토큰입니다." });
  } else {
    const sql = `INSERT INTO cartItems(book_id, quantity, user_id) VALUES (?, ?, ?);`;
    const values = [bookId, quantity, authorization.id];
    conn.query(sql, values, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(StatusCodes.BAD_REQUEST).end();
      }

      return res.status(StatusCodes.CREATED).json(results);
    });
  }
};

const getCartItems = (req, res) => {
  const { selected } = req.body;
  const authorization = ensureAuthorization(req, res);

  if (authorization instanceof jwt.TokenExpiredError) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "로그인 세션이 만료되었습니다. 다시 로그인 해주세요." });
  } else if (authorization instanceof jwt.JsonWebTokenError) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "잘못된 토큰입니다." });
  } else {
    const sql = `SELECT cartItems.id, book_id, books.title, books.summary, quantity, books.price
    FROM cartItems LEFT JOIN books
    ON cartItems.book_id = books.id
    WHERE user_id = ? AND cartItems.id IN (?);`;
    conn.query(sql, [authorization.id, selected], (err, results) => {
      if (err) {
        console.log(err);
        return res.status(StatusCodes.BAD_REQUEST).end();
      }

      return res.status(StatusCodes.OK).json(results);
    });
  }
};
const removeCartItem = (req, res) => {
  const cartItemId = req.params.id;

  const sql = `DELETE FROM cartItems WHERE id = ?;`;
  conn.query(sql, cartItemId, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    return res.status(StatusCodes.OK).json(results);
  });
};

module.exports = { addToCart, getCartItems, removeCartItem };
