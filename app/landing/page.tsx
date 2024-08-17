"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import app from "@/config.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

export default function Landing() {
  const [user, setUser] = useState<User | null>(null);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const router = useRouter();

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

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDoc = doc(db, "users", user.uid); // gets by uid
      const userSnapshot = await getDoc(userDoc); // finds by userDoc

      if (!userSnapshot.exists()) {
        await setDoc(userDoc, {
          id: user.uid,
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date(),
        });
      }

      router.push("/");
    } catch (error) {
      if (error instanceof Error) {
        console.log("Failed to sign in with Google: ", error.message);
      } else {
        console.log("Failed to sign in with Google: An unknown error occurred");
      }
    }
  };

  return (
    <div className=" grid grid-cols-2 h-screen  bg-gradient-to-b from-[#73C8A9] to-[#373B44]">
      <div className="h-full w-full">
        <h2 className="capitalize">Landing page</h2>

        <button
          onClick={signInWithGoogle}
          className=" bg-white hover:bg-neutral-200 text-black  py-3 px-5 rounded-full text-sm flex gap-2 items-center hover:scale-105 duration-75"
        >
          Get started
        </button>
      </div>

      <div className="h-full w-full">
        <h2 className="capitalize">Landing page</h2>

        <button
          onClick={signInWithGoogle}
          className=" bg-white hover:bg-neutral-200 text-black  py-3 px-5 rounded-full text-sm flex gap-2 items-center hover:scale-105 duration-75"
        >
          Get started
        </button>
      </div>
    </div>
  );
}
