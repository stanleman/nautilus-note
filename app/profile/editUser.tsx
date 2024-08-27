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
import { Badge } from "@/components/ui/badge";

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

  const onSubmitHandler = async (e: any) => {
    e.preventDefault();

    await setDoc(doc(db, "users", id), {
      name: user.name,
      email: user.email,
      id: user.id,
      createdAt: user.createdAt,
      photoURL: user.photoURL,
      isPremium: false,
    });

    onUserEdited();

    toast.success("Username successfully edited");
  };

  return (
    <div>
      <div className="flex flex-col mt-7">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-semibold ">{name}</h1>
          <Badge
            className={`py-2 h-fit w-fit text-center ${
              isPremium
                ? "bg-gradient-to-r from-[#90E4C1] to-blue-300"
                : "bg-blue-400 hover:bg-blue-400"
            }`}
          >
            {isPremium ? <p>Premium</p> : <p>Standard</p>}
          </Badge>
        </div>
        <p className="text-lg text-gray-400">{email}</p>
      </div>

      <div className="flex flex-col mt-7">
        <form onSubmit={onSubmitHandler}>
          <p className="">Edit username</p>
          <div className="flex items-center gap-2">
            <input
              onChange={onChangeHandler}
              value={user.name}
              name="name"
              className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
            />

            <Button>Submit changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
