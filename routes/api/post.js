const express = require("express");
const router = express.Router();

//@route        GET api/post
// @desc test   route
// @acces       Public
router.get("/", (req, res) => res.send("user route"));
module.exports = router;
