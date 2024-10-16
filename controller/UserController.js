const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

const join = (req, res) => {
  const { email, password } = req.body;

  const sql = `INSERT INTO users (email, password, salt) VALUES (?, ?, ?)`;

  // 회원 가입 시 비밀번호를 암호화해서 암호화 된 비밀번호와 salt값을 같이 저장
  const salt = crypto.randomBytes(10).toString("base64");
  const hashedPassword = crypto
    .pbkdf2Sync(password, salt, 10000, 10, "sha512")
    .toString("base64");

  const values = [email, hashedPassword, salt];
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

    // salt값 꺼내서 비밀번호를 암호화 해보고
    const hashPassword = crypto
      .pbkdf2Sync(password, loginUser.salt, 10000, 10, "sha512")
      .toString("base64");

    // => 디비 비밀번호랑 비교
    if (loginUser && loginUser.password == hashPassword) {
      const token = jwt.sign(
        { id: loginUser.id, email: loginUser.email },
        process.env.PRIVATE_KEY,
        {
          expiresIn: "3m",
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

  const sql = `UPDATE users SET password=?, salt=? WHERE email=?`;

  const salt = crypto.randomBytes(10).toString("base64");
  const hashPassword = crypto
    .pbkdf2Sync(password, salt, 10000, 10, "sha512")
    .toString("base64");

  const values = [hashPassword, salt, email];
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
