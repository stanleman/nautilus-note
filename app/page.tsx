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

export default function Home() {
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
    <div className="flex flex-col h-screen">
      {user ? (
        <>
          <h1>Hello, {user.displayName}</h1>
        </>
      ) : (
        <>
          <button
            onClick={signInWithGoogle}
            className="w-48 bg-white hover:bg-neutral-200 text-black border-black border py-2 px-3 rounded text-sm flex gap-2 items-center hover:scale-105 duration-75"
          >
            <Image src="/google.png" width={17} height={17} alt="Google" />
            Sign in with Google
          </button>
        </>
      )}
    </div>
  );
}
