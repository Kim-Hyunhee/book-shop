const express = require("express");
const router = express.Router();
const {
  allBooks,
  bookDetail,
  booksByCategory,
} = require("../controller/BookController");

router.use(express.json());

router.get("/", allBooks);
router.get("/:id", bookDetail);
router.get("/", booksByCategory);

module.exports = router;
