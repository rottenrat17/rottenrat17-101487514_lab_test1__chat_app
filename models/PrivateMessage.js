/**
 * Private/DM messages between two users
 * Pratik Pokhrel, 101487514
 */

const mongoose = require('mongoose');

const privateMessageSchema = new mongoose.Schema({
  from_user: {
    type: String,
    required: [true, 'From user is required'],
    trim: true
  },
  to_user: {
    type: String,
    required: [true, 'To user is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  date_sent: {
    type: String,
    default: () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `${month}-${day}-${year} ${hours}:${minutes} PM`;
    }
  }
});

module.exports = mongoose.model('PrivateMessage', privateMessageSchema);
