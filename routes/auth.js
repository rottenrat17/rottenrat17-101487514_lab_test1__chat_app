const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create new account, save to MongoDB
router.post('/signup', async (req, res) => {
  try {
    const { username, firstname, lastname, password } = req.body;

    if (!username || !firstname || !lastname || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ username: username.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const user = new User({
      username: username.trim().toLowerCase(),
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      password
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user._id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// Not used - app uses Username + Room only, no password

module.exports = router;
