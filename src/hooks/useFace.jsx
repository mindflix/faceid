import React, { useState, useEffect, useContext, createContext } from "react";
import * as faceapi from "face-api.js";
import firebase from "firebase/app";
import "firebase/firestore";

const db = firebase.firestore();

export function useFace() {
  const [users, setUsers] = useState([]);
  const maxDescriptorDistance = 0.5;

  const getUsers = () => {
    db.collection("users").onSnapshot((snapshot) => {
      const res = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(res);
    });
  };

  const createMatcher = async (faceProfiles) => {
    let members = Object.keys(faceProfiles);
    let labeledDescriptors = members.map(
      (member) =>
        new faceapi.LabeledFaceDescriptors(
          faceProfiles[member].email,
          faceProfiles[member].descriptors.map(
            (descriptor) => new Float32Array(descriptor)
          )
        )
    );

    let faceMatcher = new faceapi.FaceMatcher(
      labeledDescriptors,
      maxDescriptorDistance
    );
    return faceMatcher;
  };

  useEffect(() => {
    getUsers();
  }, []);

  // Return face methods
  return {
    users,
    getUsers,
    createMatcher,
  };
}
