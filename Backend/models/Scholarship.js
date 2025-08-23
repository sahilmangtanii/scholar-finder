// models/Scholarship.js
const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  deadline: { type: Date},
  award: { type: String },
  link: { type: String, required: true },

  // ✅ Extracted via GPT
  eligibility: {
    text:{type:String, required:true},
    educationLevel: {
      type: String,
      enum: ['Prematric', 'Postmatric', 'Undergraduate', 'Postgraduate', 'PhD'],
      default: null
    },
    yearOfStudy: { type: String, default: null }, // e.g., '1st Year'
    gpa: { type: Number, min: 0, max: 10, default: null },
    recentDegree: {
      type: String,
      enum: ['10th', '12th', 'Diploma', "Bachelor's", "Master's", 'PhD'],
      default: null
    },
    state: { type: String, default: null },
    incomeStatus: {
      type: String,
      enum: ['Low', 'Middle', 'High'],
      default: null
    },
    category: {
      type: String,
      enum: ['SC', 'ST', 'OBC', 'PWD'],
      default: null
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      default: null
    },
  }
});


module.exports = mongoose.model("Scholarship", scholarshipSchema);