import React, { useEffect, useState } from 'react';
import '../../styles/editProfile.css';
import axios from 'axios';
import { useFirebase } from '../../firebase';
import Header from './Header'; // Import Header componen
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
const EditProfile = () => {
  const firebase = useFirebase();
  const navigate = useNavigate(); // Initialize useNavigate
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    email: '',
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
    const fetchUserData = async () => {
      if (!firebase.user) return;
      try {
        const token = await firebase.user.getIdToken();
        const res = await axios.get('http://localhost:5050/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData(res.data.User); // or res.data depending on your API shape
      } catch (error) {
        console.error("Failed to load profile data:", error);
      }
    };

    fetchUserData();
  }, [firebase.user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await firebase.user.getIdToken();
      await axios.put('http://localhost:5050/api/user/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Profile updated successfully!");
      navigate('/profile'); // Redirect to profile page after successful update
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  return (
    <>
      <Header />
   
    <div className="edit-container">
      <form className="edit-form" onSubmit={handleSubmit}>
        <h2>Edit Your Profile</h2>

        <label>First Name *</label>
        <input name="firstName" value={formData.firstName} onChange={handleChange} required />

        <label>Last Name *</label>
        <input name="lastName" value={formData.lastName} onChange={handleChange} required />

        <label>Gender *</label>
        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">--Select--</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <label>Email (read-only)</label>
        <input name="email" value={formData.email} readOnly />

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
              <option value="">--Select--</option>
              <option>1st Year</option>
              <option>2nd Year</option>
              <option>3rd Year</option>
              <option>4th Year</option>
            </select>

            <label>College Name *</label>
            <input name="collegeName" value={formData.collegeName} onChange={handleChange} required />

            <label>GPA (0-10)</label>
            <input
              type="number"
              name="gpa"
              value={formData.gpa || ''}
              onChange={handleChange}
              min="0"
              max="10"
              step="0.01"
            />
          </>
        )}

        <label>Most Recent Degree *</label>
        <select name="recentDegree" value={formData.recentDegree} onChange={handleChange} required>
          <option value="">--Select--</option>
          <option value="10th">10th</option>
          <option value="12th">12th</option>
          <option value="Diploma">Diploma</option>
          <option value="Bachelor's">Bachelor's</option>
          <option value="Master's">Master's</option>
          <option value="PhD">PhD</option>
          <option value="None">None</option>
        </select>

        <label>City</label>
        <input name="city" value={formData.city} onChange={handleChange} />

        <label>State</label>
        <input name="state" value={formData.state} onChange={handleChange} />

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

        <button type="submit" className="submit-btn">Save Changes</button>
      </form>
    </div>
     </>
  );
};

export default EditProfile;