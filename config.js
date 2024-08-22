import { initializeApp } from "firebase/app";
import "firebase/auth";

const firebaseConfig = {
  // Firestore 1
  // apiKey: "AIzaSyBvfOmSslVwRRM77yWdmWgi-x-oBKRQ-Ko",
  // authDomain: "nautilus-note.firebaseapp.com",
  // projectId: "nautilus-note",
  // storageBucket: "nautilus-note.appspot.com",
  // messagingSenderId: "513786692993",
  // appId: "1:513786692993:web:8bf2a2658fdd2019d15480",
  // measurementId: "G-KR0CDMC0XK",

  // Firestore 2
  apiKey: "AIzaSyASl8qnpLrJeDLExIDNDVwvqyCBrvIvjXs",
  authDomain: "nautilus-note-lmao.firebaseapp.com",
  projectId: "nautilus-note-lmao",
  storageBucket: "nautilus-note-lmao.appspot.com",
  messagingSenderId: "503090251112",
  appId: "1:503090251112:web:527487d09f7e941ff6c2dd",
};

const app = initializeApp(firebaseConfig);

export default app;
