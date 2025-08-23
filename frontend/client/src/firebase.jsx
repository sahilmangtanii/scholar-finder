import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { signOut } from "firebase/auth";
// import {getAuth} from 'firebase/auth';
import {
    setPersistence, browserSessionPersistence,
    getAuth,
    onAuthStateChanged,
    getIdToken,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
const FirebaseContext = createContext(null);

export const useFirebase = () => useContext(FirebaseContext);

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
export { auth }; // Export auth for use in other components

export const FirebaseProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState('');

   const signupUserwithEmailAndPassword = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        setUser(user);
        const token = await getIdToken(user);
        setToken(token);
        return user;
    } catch (error) {
        console.error("Error signing up:", error);
        throw error; // <- This allows you to catch it in your Signup page
    }
};

    const loginUserwithEmailAndPassword = async (email, password) => {
        try {
            await setPersistence(auth, browserSessionPersistence);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            //const token = await firebase.auth().currentUser.getIdToken();
            setUser(user);
            const token = await getIdToken(user);
            setToken(token);
            console.log("Firebase ID Token:", token);
            return user; // Return user for further processing if needed
        } catch (error) {
            console.error("Error logging in:", error);
            throw error; // Propagate the error to the caller
        }
    };

    const signinWithgoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await setPersistence(auth, browserSessionPersistence);
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            setUser(user);
            const token = await getIdToken(user);
            setToken(token);
            const email = result.user.email;
            return email; // Return email for further processing if needed
        } catch (error) {
            console.error("Error signing in with Google:", error);
            throw error;
        }
    };

    const logoutUser = async () => {
    try {
        await signOut(auth);
        setUser(null);
        setToken('');
        console.log("Logged out successfully");
    } catch (error) {
        console.error("Error logging out:", error);
    }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                getIdToken(user).then((token) => {
                    setToken(token);
                });
            } else {
                setUser(null);
                setToken('');
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <FirebaseContext.Provider value={{ user, token, signupUserwithEmailAndPassword, loginUserwithEmailAndPassword, signinWithgoogle, logoutUser }}>
            {children}
        </FirebaseContext.Provider>
    );
};