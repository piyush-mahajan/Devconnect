const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

const User = require("../../models/User");
//@route        POST api/user
// @desc test   Register user
// @acces       Public
router.post(
  "/",
  [
    check("name", "Name is require bhai").not().isEmpty(),
    check("email", "please include valid email bhai").isEmail(),
    check(
      "password",
      "please enter a paasword with 6 or more charecters bhai"
    ).isLength({ min: 6 }),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    const { name, email, password } = req.body;

    try {
      // see if user exists
      // console.log(User.email);

      let user = await User.findOne({ email });
      console.log(user);
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "user already exists" }] });
      }
      // get user gravatar
      const avatar = gravatar.url(email, {
        // size
        s: "200",
        // rating
        r: "pg",
        // default
        d: "mm",
      });
      user = new User({
        name,
        email,
        avatar,
        password,
      });

      // encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      //as it will return the promise so awaite
      await user.save();
      // create and assign a token

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) {
            throw err;
          }
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error");
    }
  }
);
module.exports = router;
