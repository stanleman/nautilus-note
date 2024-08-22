"use client";

import { useState, useEffect } from "react";
import app from "@/config.js";
import { getAuth, User } from "firebase/auth";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

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

  return (
    <div className="flex flex-col h-screen sm:ml-[300px] mx-5 sm:mt-3 mt-16">
      <h1>Hello, {user?.displayName}</h1>
    </div>
  );
}
