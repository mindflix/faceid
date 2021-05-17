import app from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import AuthService from "./AuthService";

//* Config Firebase
//TODO : mettre les tokens dans un .env
const firebaseConfig = {
  apiKey: "AIzaSyDtq0jjaHwu4WkASgnq_mSZl9KiCIXLdrg",
  authDomain: "sudrihack-5e7cc.firebaseapp.com",
  databaseURL: "https://sudrihack-5e7cc.firebaseio.com",
  projectId: "sudrihack-5e7cc",
  storageBucket: "sudrihack-5e7cc.appspot.com",
  messagingSenderId: "982989374156",
  appId: "1:982989374156:web:4bd9178917e4f0c58d3869",
  measurementId: "G-8CFYPH8JK3",
};

//* Init de firebase et des services
app.initializeApp(firebaseConfig);
const auth = app.auth();

//* On charge et exporte tout nos services
//? A revoir dans le futur car je pense que la perf doit pas être ouf...
export const authService = new AuthService(auth);
