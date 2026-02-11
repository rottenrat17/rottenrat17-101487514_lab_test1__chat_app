/**
 * Room routes - predefined chat rooms
 * Pratik Pokhrel, 101487514
 */

const express = require('express');
const router = express.Router();

// Rooms from the lab spec + a few extras
const PREDEFINED_ROOMS = [
  'News',
  'devops',
  'cloud computing',
  'covid19',
  'sports',
  'nodeJS',
  'general',
  'web development',
  'database'
];

// Get list of available rooms
router.get('/', (req, res) => {
  res.json({ success: true, rooms: PREDEFINED_ROOMS });
});

module.exports = { router, PREDEFINED_ROOMS };
