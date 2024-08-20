"use client";

import { useEffect, useState } from "react";
import app from "@/config.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  query,
  where,
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

export default function Boards() {
  const db = getFirestore(app);
  const [board, setBoard] = useState({
    name: "",
    color: "",
  });
  const [boardsData, setBoardsData]: Array<any> = useState();
  const auth = getAuth(app);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userCheck = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => userCheck();
  }, [auth]);

  const boardOnChangeHandler = (e: any) => {
    setBoard({
      ...board,
      [e.target.name]: e.target.value,
    });
  };

  const addBoardHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await addDoc(collection(db, "boards"), {
      name: board.name,
      color: board.color,
      createdAt: new Date(),
      userId: user?.uid,
    });

    setBoard({ name: "", color: "" });

    toast.success("Board added successfully");
  };

  useEffect(() => {
    if (user) {
      const boardsRef = collection(db, "boards");

      const q = query(boardsRef, where("userId", "==", user?.uid));

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot: QuerySnapshot<DocumentData>) => {
          const boardList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as any[];
          console.log(boardList);
          setBoardsData(boardList);
        }
      );

      return () => unsubscribe();
    }
  }, [user]);

  return (
    <div className="sm:ml-[300px] mx-5 sm:mt-3 mt-16 ">
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
                    value={board.name}
                    onChange={boardOnChangeHandler}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Board name"
                    required
                  />

                  <select
                    name="color"
                    onChange={boardOnChangeHandler}
                    className="mt-3 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  >
                    <option selected disabled>
                      Select a color
                    </option>
                    <option value="bg-red-500">Red</option>
                    <option value="bg-blue-500">Blue</option>
                    <option value="bg-green-500">Green</option>
                    <option value="bg-orange-500">Orange</option>
                    <option value="bg-yellow-500">Yellow</option>
                    <option value="bg-purple-500">Purple</option>
                  </select>
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

      {!boardsData || boardsData?.length == 0 ? (
        <p className="mt-3">You currently have no boards</p>
      ) : (
        <div className="flex flex-wrap gap-3 mt-5">
          {boardsData?.map((boardData: any) => (
            <div
              className={`${boardData.color} w-fit px-[70px] py-[50px] hover:scale-105 duration-200`}
            >
              <p className="text-black">{boardData.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
