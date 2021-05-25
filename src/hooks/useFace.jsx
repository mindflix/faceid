import React, { useState, useEffect, useContext, createContext } from "react";
import firebase from "firebase/app";
import "firebase/firestore";

const db = firebase.firestore();

export default function useFace() {
  const [users, setUsers] = useState(null);

  const getDescriptors = () => {
    return db
      .collection("users")
      .get()
      .then((response) => response.forEach((doc) => console.log(doc.data())))
      .catch((error) => {
        console.log("Error getting documents: ", error);
      });
  };

  useEffect(() => {
    getDescriptors();
    setUsers(users);
  });

  const values = {
    users,
    getDescriptors,
  };

  return values;
}
