const express = require("express");
const { addLike, removeLike } = require("../controller/LikeController");
const router = express.Router();

router.use(express.json());

router.post("/:id", addLike);
router.delete("/:id", removeLike);

module.exports = router;
