import { initializeApp } from "firebase/app";
import "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBvfOmSslVwRRM77yWdmWgi-x-oBKRQ-Ko",
  authDomain: "nautilus-note.firebaseapp.com",
  projectId: "nautilus-note",
  storageBucket: "nautilus-note.appspot.com",
  messagingSenderId: "513786692993",
  appId: "1:513786692993:web:8bf2a2658fdd2019d15480",
  measurementId: "G-KR0CDMC0XK",
};

const app = initializeApp(firebaseConfig);

export default app;
