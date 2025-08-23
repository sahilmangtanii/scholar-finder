import React, { useEffect, useState } from "react";
import { useFirebase } from "../../firebase";
import axios from "axios";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Container
} from "@mui/material";
import Header from "./Header";

const Dashboard = () => {
  const { user } = useFirebase();
  const [scholarships, setScholarships] = useState([]);
  const [userName, setUserName] = useState("");
  const userId = user?.uid;

  useEffect(() => {
    const fetchScholarships = async () => {
       if (!userId) {
      console.warn("⚠️ userId is undefined, skipping fetch");
      return;
    }

      try {
        const res = await axios.get(`http://localhost:5050/api/scholarships/match/${userId}`);
        console.log("Matched scholarships:", res.data);
        setScholarships(res.data);
      } catch (err) {
        console.error("Error fetching matched scholarships", err);
      }
    };

    const fetchUserProfile = async () => {
    console.log("Fetch user profile called");

    if (!user) {
      console.log("No user object found");
      return;
    }

    try {
      const token = await user.getIdToken();
      console.log("Fetched token:", token);

      const res = await axios.get("http://localhost:5050/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("User data fetched:", res.data.User.firstName);
      setUserName(res.data.User.firstName);
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    }
  };

    fetchUserProfile();
    fetchScholarships();
  }, [user]);

  return (
    <>
      <Header />
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          backgroundImage: 'url("/background.jpg")',
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          padding: "100px 20px 40px 20px"
        }}
      >
        {/* Dark Overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            zIndex: 1
          }}
        />

        {/* Foreground Content */}
        <Container sx={{ position: "relative", zIndex: 2 }}>
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              color: "#fff",
              fontWeight: "bold",
              textAlign: "center"
            }}
          >
            Welcome, {userName}
          </Typography>

          <Typography
            variant="h4"
            sx={{
              mb: 4,
              color: "#fff",
              textAlign: "center"
            }}
          >
            🎓 Matched Scholarships for You
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            {scholarships.map((scholarship, index) => (
              <Grid item key={index} xs={12} sm={6}>
                <Card
                  sx={{
                    height: "280px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderRadius: 3,
                    boxShadow: 4,
                    padding: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.95)"
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom noWrap>
                      {scholarship.title}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Award:</strong> {scholarship.award || "Not specified"}
                    </Typography>
                    <Typography variant="body2">
                     <strong>Deadline:</strong>{" "}
                      {scholarship.deadline
                        ? new Date(scholarship.deadline).toLocaleDateString("en-IN", {
                            timeZone: "Asia/Kolkata",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "N/A"}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}
                    >
                      <strong>Eligibility:</strong> {scholarship.eligibility?.text || "Check details"}
                    </Typography>
                  </CardContent>
                  <Box sx={{ textAlign: "right" }}>
                    <Button
                      variant="outlined"
                      size="small"
                      href={scholarship.link || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default Dashboard;