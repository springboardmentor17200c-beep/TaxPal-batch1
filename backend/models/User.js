const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
 
  firebaseId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  country: { 
    type: String, 
    required: true 
  },
  income_bracket: { 
    type: String, 
    enum: ['low', 'middle', 'high'], 
    default: 'middle'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('User', UserSchema);