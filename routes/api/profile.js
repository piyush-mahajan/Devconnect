const express = require("express");
const router = express.Router();

//@route        GET api/profile
// @desc test   route
// @acces       Public
router.get("/", (req, res) => res.send("user route"));
module.exports = router;
