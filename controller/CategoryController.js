const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

const allCategory = (req, res) => {
  const sql = `SELECT * FROM category`;
  conn.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    results = results.map(function (result) {
      const { category_id, category_name } = result;
      return {
        categoryId: category_id,
        categoryName: category_name,
      };
    });
    return res.status(StatusCodes.OK).json(results);
  });
};

module.exports = { allCategory };
