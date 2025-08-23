import React, { useEffect, useState } from 'react';
import '../../styles/Header.css';
import {
  AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Avatar,
  Badge, Tooltip, Box, Divider
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useFirebase } from '../../firebase';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logoutUser } = useFirebase();
  const [userData, setUserData] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const open = Boolean(anchorEl);
  const notificationOpen = Boolean(notificationAnchor);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleNotificationOpen = (event) => setNotificationAnchor(event.currentTarget);
  const handleNotificationClose = () => setNotificationAnchor(null);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };
  const handleNotificationClick = async () => {
  try {
    const token = await user.getIdToken();
    await axios.patch("http://localhost:5050/api/notifications/mark-all-read", {
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (err) {
    console.error("Failed to mark notifications as read", err);
  }
};

  useEffect(() => {
    
    const fetchUserProfile = async () => {
      if (!user) return;
      try {
        //console.log(token);
        const token = await user.getIdToken();
        console.log(token);
        const res = await axios.get("http://localhost:5050/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(res.data.User);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };

    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await axios.get("http://localhost:5050/api/notifications", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const allNotifications = res.data;
        const now = new Date();
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

        // ✅ Filter notifications created within the last 3 days
        const recentNotifications = allNotifications.filter(notification => {
          const createdAt = new Date(notification.createdAt);
          return createdAt >= threeDaysAgo;
        });

        setNotifications(recentNotifications);
      } catch (err) {
        console.error("Error fetching notifications", err);
      }
};

    fetchUserProfile();
    fetchNotifications();
  }, [user]);

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#1976d2', zIndex: 1300 }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Logo + Brand */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <img src="/logo.png" alt="Logo" style={{ height: 40 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Scholarship Finder
          </Typography>
        </Box>

        {/* Right side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton size="large" color="inherit" onClick={(e) => { handleNotificationOpen(e); handleNotificationClick(); }}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={notificationAnchor}
            open={notificationOpen}
            onClose={handleNotificationClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ style: { maxHeight: 300, width: '300px' } }}
          >
            <Typography sx={{ px: 2, py: 1, fontWeight: 'bold' }}>Notifications</Typography>
            <Divider />
            {notifications.length === 0 && (
              <MenuItem disabled>No notifications</MenuItem>
            )}
            {notifications.map((notif, index) => (
              <MenuItem key={index} sx={{ whiteSpace: 'normal', fontSize: 14 }}>
                {notif.message}
              </MenuItem>
            ))}
          </Menu>
          {/* Avatar */}
          <Tooltip title="Account settings">
            <IconButton onClick={handleMenuOpen}>
              <Avatar sx={{ bgcolor: '#fff', color: '#1976d2' }}>
                {userData?.firstName && userData?.lastName
                  ? `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase()
                  : 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;