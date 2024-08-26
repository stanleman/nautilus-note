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

      console.log(user);

      if (!userSnapshot.exists()) {
        await setDoc(userDoc, {
          id: user.uid,
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
          isPremium: false,
          createdAt: new Date(),
        });
      }

      router.push("/boards");
    } catch (error) {
      if (error instanceof Error) {
        console.log("Failed to sign in with Google: ", error.message);
      } else {
        console.log("Failed to sign in with Google: An unknown error occurred");
      }
    }
  };

  return (
    <div className=" flex md:flex-row flex-col h-screen bg-gradient-to-r from-[#136a8a] to-[#267871] ">
      <div className="h-full md:w-[50%] w-full flex flex-col justify-center md:items-start items-center md:text-start text-center gap-2 p-[80px]">
        <h1 className="text-xl sm:text-2xl md:text-4xl font-semibold">
          Introducing <span className="font-bold">Nautilus Note</span>
        </h1>

        <p className="text-sm sm:text-md md:text-xl">
          The number one tool in a students arsenal to maximise productivity.
        </p>

        <button
          onClick={signInWithGoogle}
          className=" bg-white  text-black hover:text-[#90E4C1] hover:font-bold  py-3 px-5 rounded-full text-sm flex gap-2 items-center hover:scale-105 duration-75"
        >
          Get productive now
        </button>
      </div>

      <div className="h-full md:w-[50%] w-full flex justify-center items-center md:bg-none bg-gradient-to-r from-[#136a8a] to-[#267871]">
        <Image src="/trello.png" width={550} height={550} alt="landing image" />
      </div>
    </div>
  );
}
