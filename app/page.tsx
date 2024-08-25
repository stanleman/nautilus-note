"use client";

import { useState, useEffect } from "react";
import app from "@/config.js";
import { getAuth, User } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";

export default function Home() {
  const db = getFirestore(app);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);

  useEffect(() => {
    const auth = getAuth(app);
    const userCheck = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => userCheck();
  }, []);

  const fetchUsers = async () => {
    if (user) {
      console.log(user.uid);
      const usersRef = doc(db, "users", user?.uid);

      getDoc(usersRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        })
        .catch(() => {
          console.log("Failed to fetch board data");
        });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  return (
    <div className="flex flex-col sm:ml-[300px] mx-5 sm:mt-4 mt-16">
      {userData ? (
        <div>
          <h2 className="font-bold text-2xl">Home</h2>
          <p>
            Hello my name is {userData.name} and my email is {userData.email}
          </p>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
