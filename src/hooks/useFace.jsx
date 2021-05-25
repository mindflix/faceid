import React, { useState, useEffect, useContext, createContext } from "react";
import * as faceapi from "face-api.js";
import firebase from "firebase/app";
import "firebase/firestore";

const db = firebase.firestore();

export function useFace() {
  const [users, setUsers] = useState([]);

  const getUsers = () => {
    db.collection("users")
      .get()
      .then((snapshot) => {
        const res = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsers(res);
      });
  };

  useEffect(() => {
    getUsers();
  }, []);

  // Return face methods
  return {
    users,
  };
}
