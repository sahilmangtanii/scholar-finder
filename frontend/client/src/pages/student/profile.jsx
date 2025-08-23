// src/components/Profile.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useFirebase } from '../../firebase';
import '../../styles/profile.css';
import Header from "./Header";
import { useNavigate } from 'react-router-dom';
import EditProfile from './editprofile';

const Profile = () => {
  const { user } = useFirebase();
  const [profileData, setProfileData] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const navigate = useNavigate();

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await axios.get('http://localhost:5050/api/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfileData(res.data.User);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };

    fetchProfile();
  }, [user]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage("");

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage("❌ Passwords do not match");
      return;
    }

    try {
      await user.reload();
      await user.reauthenticateWithCredential(
        window.firebase.auth.EmailAuthProvider.credential(user.email, currentPassword)
      );

      await user.updatePassword(newPassword);
      setPasswordMessage("✅ Password changed successfully");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowPasswordModal(false);
    } catch (error) {
      console.error("Password update failed:", error);
      setPasswordMessage("❌ " + error.message);
    }
  };

  if (!profileData) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <>
      <Header />
      <div className="profile-page">
        <h1 className="profile-heading">My Profile</h1>
        <div className="profile-card">
          <div className="avatar-circle">
            {profileData?.firstName?.[0]}{profileData?.lastName?.[0]}
          </div>
          <h2>{profileData?.firstName} {profileData?.lastName}</h2>
          <p><strong>Gender:</strong> {profileData?.gender}</p>
          <p><strong>Email:</strong> {profileData?.email}</p>

          <div className="button-row">
            <button onClick={handleEditProfile}>Edit Profile</button>
            <button onClick={() => setShowPasswordModal(true)}>Change Password</button>
          </div>
        </div>

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Change Password</h3>
              <form onSubmit={handlePasswordChange}>
                <label>Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />

                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />

                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />

                <div className="modal-buttons">
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                </div>
                {passwordMessage && <p className="password-message">{passwordMessage}</p>}
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;