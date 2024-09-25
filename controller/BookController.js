const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

// (카테고리별,신간 여부) 전체 도서 목록 조회
const allBooks = (req, res) => {
  const { categoryId, news, limit, currentPage } = req.query;

  // limit : page 당 도서 수      ex. 3
  // currentPage : 현재 몇 페이지 ex. 1, 2, 3, ...
  // offset :                         0, 3, 6
  //                                  limit * (currentPage - 1)

  const offset = limit * (currentPage - 1);

  let sql = `SELECT * FROM books`;
  let values = [];
  if (categoryId && news) {
    sql += ` WHERE category_id = ? AND pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()`;
    values.push(categoryId);
  } else if (categoryId) {
    sql += ` WHERE category_id = ?`;
    values.push(categoryId);
  } else if (news) {
    sql += ` WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()`;
  }

  sql += ` LIMIT ? OFFSET ?`;
  values.push(parseInt(limit), offset);

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    if (results.length) {
      return res.status(StatusCodes.OK).json(results);
    } else {
      return res.status(StatusCodes.NOT_FOUND).end();
    }
  });
};

const bookDetail = (req, res) => {
  const { id } = req.params;

  const sql = `SELECT * FROM books LEFT JOIN category 
                ON books.category_id = category.id WHERE books.id = ?;`;
  conn.query(sql, id, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    if (results[0]) {
      return res.status(StatusCodes.OK).json(results[0]);
    } else {
      return res.status(StatusCodes.NOT_FOUND).end();
    }
  });
};

module.exports = { allBooks, bookDetail };
