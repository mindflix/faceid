import React, { useState, useEffect, useContext, createContext } from "react";
import firebase from "firebase/app";
import "firebase/auth";

firebase.initializeApp({
  apiKey: "AIzaSyDtq0jjaHwu4WkASgnq_mSZl9KiCIXLdrg",
  authDomain: "sudrihack-5e7cc.firebaseapp.com",
  databaseURL: "https://sudrihack-5e7cc.firebaseio.com",
  projectId: "sudrihack-5e7cc",
  storageBucket: "sudrihack-5e7cc.appspot.com",
  messagingSenderId: "982989374156",
  appId: "1:982989374156:web:4bd9178917e4f0c58d3869",
  measurementId: "G-8CFYPH8JK3",
});

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  const signin = (email, password) => {
    return firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((response) => {
        setUser(response.user);
        return response.user;
      });
  };
  const signup = (email, password) => {
    return firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((response) => {
        setUser(response.user);
        return response.user;
      });
  };
  const signout = () => {
    return firebase
      .auth()
      .signOut()
      .then(() => {
        setUser(false);
      });
  };
  const sendPasswordResetEmail = (email) => {
    return firebase
      .auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        return true;
      });
  };
  const confirmPasswordReset = (code, password) => {
    return firebase
      .auth()
      .confirmPasswordReset(code, password)
      .then(() => {
        return true;
      });
  };

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      setUser(user);
      setIsAuthenticating(false);
    });

    // Cleanup subscription on umount
    return () => unsubscribe();
  }, []);

  const values = {
    user,
    isAuthenticating,
    signin,
    signup,
    signout,
    sendPasswordResetEmail,
    confirmPasswordReset,
  };

  return (
    <AuthContext.Provider value={values}>
      {!isAuthenticating && children}
    </AuthContext.Provider>
  );
};
