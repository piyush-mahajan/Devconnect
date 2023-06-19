const express = require("express");
const router = express.Router();
const request = require("request");
const config = require("config");

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
// @desc       delete profile experiance
// @access     Private
router.delete("/experiance/:exp_id", auth, async (req, res) => {
  try {
    // get the profile of the user
    const profile = await Profile.findOne({ user: req.user.id });
    // get the index of the experience that we want to remove
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);
    // remove the experience from the profile
    profile.experience.splice(removeIndex, 1);
    // save the profile
    await profile.save();
    // send the profile as a response
    res.json(profile);
  } catch (err) {
    // if there is an error, log it and send a 500 error to the client
    console.error(err.message);
    res.status(500).send("server error bhai");
  }
});
// @route      DELETE api/profile/education
// @desc       add profile education
// @access     Private
router.put(
  "/education",
  [
    auth,
    [
      check("school", "school is required").not().isEmpty(),
      check("degree", "degree is required").not().isEmpty(),
      check("fieldofstudy", "fieldofstudy is required").not().isEmpty(),
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
    const { school, degree, fieldofstudy, from, to, current, description } =
      req.body;
    // create new object with the data that the user submits
    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };
    // update the database
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      // unshift is like push but it pushes the new item to the beginning of the array
      profile.education.unshift(newEdu);
      await profile.save();
      res.json(profile);
    } catch (err) {
      // if there is an error, log it and send a 500 error to the client
      console.error(err.message);
      res.status(500).send("server error bhai");
    }
  }
);
// @route      DELETE api/profile/education/:edu_id
// @desc       delete profile education
// @access     Private
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    // get the profile of the user
    const profile = await Profile.findOne({ user: req.user.id });
    // get the index of the education that we want to remove
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);
    // remove the education from the profile
    profile.education.splice(removeIndex, 1);
    // save the profile
    await profile.save();
    // send the profile as a response
    res.json(profile);
  } catch (err) {
    // if there is an error, log it and send a 500 error to the client
    console.error(err.message);
    res.status(500).send("server error bhai");
  }
});
// @route      GET api/profile/github/:username
// @desc       get user repos from github
// @access     Public
router.get("/github/:username", (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        "githubClientId"
      )}&client_secret=${config.get("githubSecret")}`,
      method: "GET",
      headers: { "user-agent": "node.js" },
    };
    request(options, (error, response, body) => {
      if (error) console.error(error);
      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: "No Github profile found" });
      }
      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error bhai");
  }
});

module.exports = router;
