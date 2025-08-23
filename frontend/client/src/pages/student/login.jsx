import React, { useState } from "react";
import "../../styles/login.css";
import { useFirebase } from "../../firebase";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { setPersistence, browserSessionPersistence } from "firebase/auth";
import { auth } from "../../firebase"; // Adjust path to where you initialize Firebase
// import homepage from "./homepage";
const Login = () => {
    const firebase = useFirebase();
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const handleForgotPassword = async (e) => {
    e.preventDefault();

    const email = prompt("Please enter your email for password reset:");
    if (!email) return;
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Check your inbox.");
    } catch (error) {
      console.error("Error sending reset email:", error);
      alert("Error: " + error.message);
    }
  };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMsg("");
        setPersistence(auth, browserSessionPersistence)
        .then (() => { return firebase.loginUserwithEmailAndPassword(email, password);
        }).then((user) => {
                const uid = user.uid;
                localStorage.setItem("userId", uid);
                navigate("/"); // Redirect to dashboard after successful login
                console.log("Login successful");
                console.log("User email:", email);
            })
            .catch((error) => {
                console.error("Login failed:", error);
                setErrorMsg("Login failed. Please check your email and password.");
                setTimeout(() => setErrorMsg(""), 3000);
            });
    };

    const handleGoogleLogin = async () => {
  try {
    const email = await firebase.signinWithgoogle();
    console.log("Signed in Google email:", email); // ✅ Check if email is defined

    const response = await axios.post(
      "http://localhost:5050/api/user/checkUserProfile",
      { email }
    );

    console.log("Backend response:", response.data);

    if (!response.data.exists) {
      navigate('/complete-profile', { state: { emailFromGoogle: email } });
    } else {
      navigate('/');
    }
  } catch (error) {
    console.error("Google login failed:", error);
    const currentUser = auth.currentUser;
    if (currentUser) {
    await currentUser.delete();
    console.log("Deleted Firebase user due to failed signup.");
    }

    // ✅ Log full Axios error
    if (error.response) {
      console.error("Backend responded with error:", error.response.data);
    } else if (error.request) {
      console.error("No response from backend:", error.request);
    } else {
      console.error("Axios error:", error.message);
    }
  }
};
    return (
      <>
        {errorMsg && (
        <div
          style={{
            backgroundColor: '#f44336',
            color: 'white',
            padding: '12px',
            textAlign: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000
          }}
        >
          {errorMsg}
        </div>
      )}
        <div
            className="login-page"
            style={{ backgroundImage: `url('/background.jpg')` }}
        >
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Login</h2>

                <label>Email Address</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label>Password</label>
                <div className="password-wrapper">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? "🙈" : "👁️"}
                    </button>
                </div>

                <button type="submit" className="btn-primary">Continue</button>

                <button onClick={handleGoogleLogin} type="button" className="btn-google">
                    Continue with Google
                </button>

                <div className="forgot-password">
                    <a href="#" onClick={handleForgotPassword}>Forgot your password?</a>
                </div>

                <div className="bottom-text">
                    Don’t have an account? <a href="/signup">Sign Up</a>
                </div>
            </form>
        </div>
      </>
    );
};

export default Login;
