const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  email: { type: String, required: true, unique: true },

  educationLevel: {
    type: String,
    enum: ['Prematric', 'Postmatric', 'Undergraduate', 'Postgraduate', 'PhD'],
    required: true,
  },
  yearOfStudy: {
  type: String,
  enum: ['1st Year', '2nd Year', '3rd Year', '4th Year',],
  default: undefined,
},
  collegeName: { type: String,default: undefined, },

  gpa: {
    type: Number,
    min: 0,
    max: 10,
    default: undefined,
  },

  recentDegree: {
    type: String,
    enum: ['10th', '12th', 'Diploma', "Bachelor's", "Master's", 'PhD', 'None'],
    required: true,
  },

  city: { type: String, default: '' },
  state: { type: String, default: '' },

  incomeStatus: {
    type: String,
    enum: ['Low', 'Middle', 'High'],
    required: true,
  },

  category: {
    type: String,
    enum: ['SC', 'ST', 'OBC', 'PWD', ''],
    default: '',
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userProfileSchema);
