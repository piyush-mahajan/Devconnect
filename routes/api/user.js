const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
//@route        POST api/user
// @desc test   Register user
// @acces       Public
router.post(
  "/",
  [
    check("name", "Name is require bhai").not(),
    isEmpty(),
    check(
      "email",
      "please include valid email bhai".isEmail(),
      check(
        "password",
        "please enter a paasword with 6 or more charecters bhai"
      ).isLength({ min: 6 })
    ),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    res.send("user route");
  }
);
module.exports = router;
