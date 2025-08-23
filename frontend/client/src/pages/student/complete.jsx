import React, { useState, useEffect } from 'react';
import '../../styles/signup.css';
import { useFirebase } from '../../firebase';
import axios from 'axios';
import { auth } from '../../firebase'; // adjust path if needed
import { useLocation } from 'react-router-dom';
const CompleteProfile = () => {
  const firebase = useFirebase();
  const location = useLocation();
  const emailFromGoogle = location.state?.emailFromGoogle || '';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    email: '', // Pre-filled, disabled
    gpa: '',
    city: '',
    state: '',
    incomeStatus: '',
    category: '',
    educationLevel: '',
    yearOfStudy: '',
    collegeName: '',
    recentDegree: '',
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, email: emailFromGoogle }));
  }, [emailFromGoogle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const currentUser = auth.currentUser;
      const firebaseUid = currentUser?.uid;

      if (!firebaseUid) {
        alert("User not logged in.");
        return;
      }

      const profileData = {
        ...formData,
        firebaseUid,
      };

      const res = await axios.post('http://localhost:5050/api/user/profile', profileData);
      console.log("✅ Profile saved:", res.data);
      alert("Profile completed successfully!");
    } catch (err) {
      console.error("Profile completion failed:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Complete Your Profile</h2>
        <p>We need more details to personalize scholarship matching.</p>

        <label>First Name *</label>
        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />

        <label>Last Name *</label>
        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />

        <div className="form-group">
          <label>Gender *</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === "female"}
                onChange={handleChange}
                required
              /> Female
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === "male"}
                onChange={handleChange}
                required
              /> Male
            </label>
          </div>
        </div>

        <label>Email (from Google)</label>
        <input type="email" name="email" value={formData.email} disabled />

        <label>Education Level *</label>
        <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} required>
          <option value="">--Select--</option>
          <option value="Prematric">Prematric</option>
          <option value="Postmatric">Postmatric</option>
          <option value="Undergraduate">Undergraduate</option>
          <option value="Postgraduate">Postgraduate</option>
          <option value="PhD">PhD</option>
        </select>

        {formData.educationLevel !== 'Prematric' && formData.educationLevel !== 'Postmatric' && (
          <>
            <label>Year of Study *</label>
            <select name="yearOfStudy" value={formData.yearOfStudy} onChange={handleChange} required>
              <option value="">--Select Year--</option>
              <option>1st Year</option>
              <option>2nd Year</option>
              <option>3rd Year</option>
              <option>4th Year</option>
            </select>

            <label>College Name *</label>
            <input type="text" name="collegeName" value={formData.collegeName} onChange={handleChange} required />

            <label>GPA (out of 10)</label>
            <input type="number" name="gpa" value={formData.gpa} onChange={handleChange} min="0" max="10" step="0.01" />
          </>
        )}

        <label>Most Recent Degree *</label>
        <select name="recentDegree" value={formData.recentDegree} onChange={handleChange} required>
          <option value="">--Select Degree--</option>
          <option value="10th">10th</option>
          <option value="12th">12th</option>
          <option value="Diploma">Diploma</option>
          <option value="Bachelor's">Bachelor's</option>
          <option value="Master's">Master's</option>
          <option value="PhD">PhD</option>
          <option value="None">None</option>
        </select>

        <label>City</label>
        <input type="text" name="city" value={formData.city} onChange={handleChange} />

        <label>State</label>
        <input type="text" name="state" value={formData.state} onChange={handleChange} />

        <label>Income Status *</label>
        <select name="incomeStatus" value={formData.incomeStatus} onChange={handleChange} required>
          <option value="">--Select--</option>
          <option>Low</option>
          <option>Middle</option>
          <option>High</option>
        </select>

        <label>Special Category</label>
        <select name="category" value={formData.category} onChange={handleChange}>
          <option value="">--Select--</option>
          <option>SC</option>
          <option>ST</option>
          <option>OBC</option>
          <option>PWD</option>
        </select>

        <button type="submit" className="submit-btn">Submit Profile</button>
      </form>
    </div>
  );
};

export default CompleteProfile;