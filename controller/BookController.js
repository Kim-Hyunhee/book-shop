const ensureAuthorization = require("../auth"); // 인증 모듈
const jwt = require("jsonwebtoken");
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

  let sql = `SELECT *, (SELECT count(*) FROM likes WHERE liked_book_id = books.id) AS likes FROM books`;
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
  // 로그인 상태가 아니면 => liked 빼고 보내주면 되고
  // 로그인 상태이면 => liked 추가해서
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
    const bookId = req.params.id;

    let sql = `SELECT *, 
               (SELECT count(*) FROM likes WHERE liked_book_id = books.id) AS likes`;
    const values = [bookId];

    // 로그인된 상태라면 liked 값을 추가
    if (authorization.id) {
      sql += `, (SELECT EXISTS (SELECT * FROM likes WHERE user_id = ? AND liked_book_id = ?)) AS liked`;
      values.unshift(authorization.id, bookId); // userId와 bookId를 values 배열 앞에 추가
    }

    sql += ` FROM books 
            LEFT JOIN category 
            ON books.category_id = category.category_id
            WHERE books.id=?;`;

    conn.query(sql, values, (err, results) => {
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
  }
};

module.exports = { allBooks, bookDetail };
