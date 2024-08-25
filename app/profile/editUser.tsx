"use client";

import { useEffect, useState } from "react";
import app from "@/config.js";
import {
  getFirestore,
  addDoc,
  collection,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  query,
  where,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Toaster, toast } from "sonner";
import { getAuth, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface EditUserProps {
  userData: any;
  onUserEdited: () => void;
}

export default function EditUser({
  userData: { name, email, id, createdAt, photoURL, isPremium },
  onUserEdited,
}: EditUserProps) {
  const db = getFirestore(app);
  const router = useRouter();

  const [user, setUser] = useState({
    name: name,
    email: email,
    id: id,
    createdAt: createdAt,
    photoURL: photoURL,
    isPremium: false,
  });

  const onChangeHandler = (e: any) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmitHandler = async () => {
    await setDoc(doc(db, "users", id), {
      name: user.name,
      email: user.email,
      id: user.id,
      createdAt: user.createdAt,
      photoURL: user.photoURL,
      isPremium: false,
    });

    onUserEdited();

    router.push("/profile");
  };

  return (
    <div>
      <div className="mb-3 mt-5">
        <p className="mb-2">Username</p>
        <input
          onChange={onChangeHandler}
          onBlur={onSubmitHandler}
          value={user.name}
          name="name"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
      </div>

      <div className="mb-3">
        <p className="mb-2">Email</p>
        <input
          onChange={onChangeHandler}
          onBlur={onSubmitHandler}
          value={user.email}
          name="email"
          disabled
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
      </div>
    </div>
  );
}
