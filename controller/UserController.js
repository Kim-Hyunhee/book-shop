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
  res.json("비밀번호 초기화 요청");
};

const passwordReset = (req, res) => {
  res.json("비밀번호 초기화");
};

module.exports = { join, login, passwordRequestReset, passwordReset };
