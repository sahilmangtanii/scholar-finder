import React, { useState } from 'react';
import '../../styles/signup.css';
import { useFirebase } from '../../firebase';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase'; // Adjust path to where you initialize Firebase
const Signup = () => {
  const firebase = useFirebase();
  const navigate = useNavigate();
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
    password: '',
    confirmPassword: '',
    agreed: false,
    educationLevel: '',
    yearOfStudy: '',
    collegeName: '',
    recentDegree: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreed) {
      alert("You must agree to terms and conditions.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    try {
     const firebaseUser = await firebase.signupUserwithEmailAndPassword(formData.email, formData.password);
     console.log("firebaseUser:", firebaseUser); 
      const firebaseUUid = firebaseUser.uid;
      console.log("Form Submitted:", formData);
      
      const profileData = {
        ...formData,
        firebaseUid: firebaseUUid, // ✅ This will now work
      };

    // ✅ Send data to backend using Axios
    const response = await axios.post('http://localhost:5050/api/user/profile', profileData);

    console.log("✅ Profile saved:", response.data);
    //alert("Signup successful!");
    navigate("/");
    } catch (err) {
      console.error("Signup failed:", err);
      const currentUser = auth.currentUser;
      if (currentUser) {
        await currentUser.delete();
        console.log("Deleted Firebase user due to failed signup.");
      }

      alert("Signup failed: " + err.message);
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Create Your Scholarship Finder Account</h2>
        <p>Your account helps you access and track personalized scholarship opportunities. Please fill out your details correctly. Fields marked with * are required.</p>

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

        <label>Email Address *</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />

         <label>Education Level *</label>
        <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} required>
          <option value="">--Select--</option>
          <option value="Prematric">Prematric</option>
          <option value="Postmatric">Postmatric</option>
          <option value="Undergraduate">Undergraduate</option>
          <option value="Postgraduate">Postgraduate</option>
          <option value="PhD">PhD</option>
        </select>

        {/* {formData.educationLevel === "Undergraduate" && (
          <>
            
          </>
        )} */}

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


        <label>Most Recent Degree Completed *</label>
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

       

        <label>Password *</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required />

        <label>Confirm Password *</label>
        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />

        <div className="terms-container">
          <label>
            <input
              type="checkbox"
              name="agreed"
              checked={formData.agreed}
              onChange={handleChange}
              required
            />
            I agree with Terms & Conditions
          </label>
        </div>

        <button type="submit" className="submit-btn">Sign Up</button>

        <p className="login-link">Already have an account? <a href="/login">Log in</a></p>
      </form>
    </div>
  );
};

export default Signup;