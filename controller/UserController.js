const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const join = (req, res) => {
  const { email, password } = req.body;

  const sql = `INSERT INTO users (email, password) VALUES (?, ?)`;
  const values = [email, password];

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    res.status(StatusCodes.CREATED).json(results);
  });
};

const login = (req, res) => {
  const { email, password } = req.body;

  const sql = `SELECT * FROM users WHERE email = ?`;
  conn.query(sql, email, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    const loginUser = results[0];
    if (loginUser && loginUser.password == password) {
      const token = jwt.sign(
        { email: loginUser.email },
        process.env.PRIVATE_KEY,
        {
          expiresIn: "5m",
          issuer: "hyunhee",
        }
      );

      res.cookie("token", token, { httpOnly: true });
      console.log(token);

      return res.status(StatusCodes.OK).json(results);
    }
    // 401: Inauthorized (비인증; 서버가 누군지 모름) 403: Forbidden (접근 권리 없음; 서버가 누군지 알고 있음)
    return res.status(StatusCodes.UNAUTHORIZED).end();
  });
};

const passwordRequestReset = (req, res) => {
  const { email } = req.body;

  const sql = `SELECT * FROM users WHERE email = ?`;
  conn.query(sql, email, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    const user = results[0];
    if (user) {
      return res.status(StatusCodes.OK).json({ email });
    } else {
      return res.status(StatusCodes.FORBIDDEN).end();
    }
  });
};

const passwordReset = (req, res) => {
  const { email, password } = req.body;

  const sql = `UPDATE users SET password = ? WHERE email = ?`;
  const values = [password, email];
  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    if (results.affectedRows == 0) {
      return res.status(StatusCodes.BAD_REQUEST).end();
    } else {
      return res.status(StatusCodes.OK).json(results);
    }
  });
};

module.exports = { join, login, passwordRequestReset, passwordReset };
