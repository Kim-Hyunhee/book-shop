const express = require("express");
const router = express.Router();
const {
  addToCart,
  getCartItems,
  removeCartItem,
} = require("../controller/CartController");

router.use(express.json());

router.post("/", addToCart);
router.get("/", getCartItems);
router.delete("/:id", removeCartItem);

// router.get("/", (req, res) => {
//     res.json("장바구니 담기");
//   });

module.exports = router;
