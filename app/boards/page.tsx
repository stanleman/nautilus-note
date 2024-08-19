"use client";

import { useState } from "react";
import app from "@/config.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
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

export default function Boards() {
  const db = getFirestore(app);
  const [board, setBoard] = useState("");

  const addBoardHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await addDoc(collection(db, "boards"), {
      name: board,
      createdAt: new Date(),
    });

    toast.success("Board added successfully");
  };

  return (
    <div className="sm:ml-[300px] mx-5 sm:mt-3 mt-16 h-screen">
      <AlertDialog>
        <div className="flex items-center gap-5">
          <h2 className="font-bold text-2xl">Boards name</h2>
          <AlertDialogTrigger className="bg-[#90E4C1] text-primary-foreground hover:bg-[#90E4C1]/90 px-4 py-[10px] rounded-md text-sm">
            Add new board +
          </AlertDialogTrigger>
        </div>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add new board</AlertDialogTitle>
            <AlertDialogDescription>
              <form className=" mx-auto" onSubmit={addBoardHandler}>
                <div className="mb-5">
                  <input
                    type="text"
                    name="name"
                    value={board}
                    onChange={(e) => setBoard(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Board name"
                    required
                  />
                </div>

                <div className="flex gap-1">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>
                    <button type="submit">Submit</button>
                  </AlertDialogAction>
                </div>
              </form>
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
      <Toaster richColors closeButton />
    </div>
  );
}
