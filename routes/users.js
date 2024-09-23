const express = require("express");
const router = express.Router();
const join = require("../controller/UserController");

router.use(express.json());

router.post("/join", join);

router.post("/login", (req, res) => {
  res.json("로그인");
});

router.post("/reset", (req, res) => {
  res.json("비밀번호 초기화 요청");
});

router.put("/reset", (req, res) => {
  res.json("비밀번호 초기화");
});

module.exports = router;
