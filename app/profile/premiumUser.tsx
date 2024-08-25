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
import { getAuth, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import EditUser from "./editUser";
import { SquareKanban, List } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface PremiumUserProps {
  userData: any;
  onUserEdited: () => void;
}

export default function PremiumUser({
  userData: { name, email, id, createdAt, photoURL, isPremium },
  onUserEdited,
}: PremiumUserProps) {
  const db = getFirestore(app);
  const router = useRouter();

  const [user, setUser] = useState({
    name: name,
    email: email,
    id: id,
    createdAt: createdAt,
    photoURL: photoURL,
    isPremium: isPremium,
  });

  const onSubmitHandler = async () => {
    await setDoc(doc(db, "users", id), {
      name: user.name,
      email: user.email,
      id: user.id,
      createdAt: user.createdAt,
      photoURL: user.photoURL,
      isPremium: true,
    });

    toast.success("You are now a Premium user");

    onUserEdited();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className="rounded-none px-10 text-black text-sm py-3 mt-4 bg-[#90E4C1] hover:bg-[#90E4C1]/90"
        disabled={isPremium}
      >
        Get premium plan
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will allow Nautilus Note to deduct funds from your bank
            account. You will be granted Premium access upon continuing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onSubmitHandler}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
