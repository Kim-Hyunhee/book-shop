const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

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

module.exports = join;
