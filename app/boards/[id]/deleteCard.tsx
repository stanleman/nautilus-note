import app from "@/config.js";
import { useEffect, useState } from "react";
import {
  getFirestore,
  getDoc,
  doc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
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
import { Button } from "@/components/ui/button";

interface DeleteCardProps {
  cardId: string;
  onCardDeleted: () => void;
}

export default function DeleteCard({ cardId, onCardDeleted }: DeleteCardProps) {
  const db = getFirestore(app);

  const cardDeleteHandler = async () => {
    try {
      await deleteDoc(doc(db, "cards", cardId));
      toast.success("Card deleted successfully");
      onCardDeleted();
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  };

  return (
    <div>
      <AlertDialog>
        <AlertDialogTrigger className="bg-transparent text-neutral-300 hover:text-red-500 duration-200">
          Delete card
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              card and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-900 text-white"
              onClick={cardDeleteHandler}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
