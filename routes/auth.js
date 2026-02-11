const express = require('express');
const router = express.Router();
const User = require('../models/User');

// signup - save new user to mongo
router.post('/signup', async (req, res) => {
  try {
    var username = req.body.username;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var password = req.body.password;

    if (!username || !firstname || !lastname || !password) {
      return res.status(400).json({ success: false, message: 'fill all fields' });
    }

    username = username.trim().toLowerCase();
    var exist = await User.findOne({ username: username });
    if (exist) {
      return res.status(400).json({ success: false, message: 'username taken' });
    }

    var user = new User({
      username: username,
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      password: password
    });
    await user.save();

    res.json({
      success: true,
      message: 'Account created',
      user: { id: user._id, username: user.username, firstname: user.firstname, lastname: user.lastname }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'username taken' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// login - check username and password
router.post('/login', async (req, res) => {
  try {
    var username = req.body.username;
    var password = req.body.password;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'need username and password' });
    }

    var user = await User.findOne({ username: username.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'wrong username or password' });
    }

    var ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'wrong username or password' });
    }

    res.json({
      success: true,
      message: 'ok',
      user: { id: user._id, username: user.username, firstname: user.firstname, lastname: user.lastname }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
