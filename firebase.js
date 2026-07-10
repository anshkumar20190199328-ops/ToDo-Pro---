// Firebase SDK Import
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  getDatabase
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyA8Lk6_3OZHrhookRAoH1y523KY2X4s9us",
  authDomain: "todo-web-14857.firebaseapp.com",
  databaseURL: "https://todo-web-14857-default-rtdb.firebaseio.com",
  projectId: "todo-web-14857",
  storageBucket: "todo-web-14857.firebasestorage.app",
  messagingSenderId: "881923789578",
  appId: "1:881923789578:web:15112c09d07a813483e0f3",
  measurementId: "G-9KVTE718CB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
const auth = getAuth(app);
const db = getDatabase(app);
const provider = new GoogleAuthProvider();

// Export
export {
  auth,
  db,
  provider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
};
