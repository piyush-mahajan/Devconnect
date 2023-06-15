const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const Profile = require("../../models/Profile");
const User = require("../../models/User");

//@route        GET api/profile/me
// @desc         get current users profile
// @acces       Private
router.get("/me", async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );
    if (!profile) {
      return res.status(400).json({ msg: "there is no profile for this user" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error bhai");
  }
});

// @route   GET api/users/:id
// @desc    Get profile by user ID
// @access  Public
router.get("user/:id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) return res.status(400).json({ msg: "Profile not found" });
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route      POST api/profile
// @desc       Create or update user profile
// @access     Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // destructure the request
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,

      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;
    try {
      // Build profile object
      const profileFields = {};
      profileFields.user = req.user.id;
      if (company) profileFields.company = company;
      if (website) profileFields.website = website;
      if (location) profileFields.location = location;
      if (bio) profileFields.bio = bio;
      if (status) profileFields.status = status;
      if (githubusername) profileFields.githubusername = githubusername;
      if (skills) {
        profileFields.skills = skills.split(",").map((skill) => skill.trim());
      }
      // Build social object
      profileFields.social = {};
      if (youtube) profileFields.social.youtube = youtube;
      if (twitter) profileFields.social.twitter = twitter;

      if (facebook) profileFields.social.facebook = facebook;
      if (linkedin) profileFields.social.linkedin = linkedin;
      if (instagram) profileFields.social.instagram = instagram;
      console.log(profileFields.skills);
      try {
        let profile = await Profile.findOne({ user: req.user.id });
        if (profile) {
          //update
          profile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true, upsert: true }
          );
          return res.json(profile);
        }

        // create

        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
      } catch (err) {
        console.error(err.message);
        res.status(500).send("server error bro");
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("server error mere bhai");
    }
  }
);

// @route      GET api/profile
// @desc       get all profiles
// @access     Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", [
      "name",
      "avtar",
      "email",
    ]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error bhai");
  }
});
// @route      Delete api/profile
// @desc       delete profile,user and posts
// @access     Private
router.delete("/", auth, async (req, res) => {
  try {
    // @todo - remove users posts
    //remove the post from db

    // remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    // remove user
    await User.findByIdAndRemove(req.user.id);
    res.json({ msg: "user deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error bhai");
  }
});
// @route      PUT api/profile/experiance
// @desc       add profile experiance
// @access     Private
router.put(
  "/experiance",
  [
    auth,
    [
      check("title", "title is required").not().isEmpty(),
      check("company", "company is required").not().isEmpty(),
      check("from", "from date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    // check for errors
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // destructure the request
    const { title, company, location, from, to, current, description } =
      req.body;
    // create new object with the data that the user submits
    const newExp = {
      title,
      company,
      location,

      from,
      to,
      current,
      description,
    };
    // update the database
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      // unshift is like push but it pushes the new item to the beginning of the array
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      // if there is an error, log it and send a 500 error to the client
      console.error(err.message);
      res.status(500).send("server error bhai");
    }
  }
);
// @route      DELETE api/profile/experiance/:exp_id
module.exports = router;
