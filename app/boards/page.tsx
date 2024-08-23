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
import EditBoard from "./editBoard";

export default function Boards() {
  const db = getFirestore(app);
  const [board, setBoard] = useState({
    name: "",
    color: "bg-white",
  });
  const [boardsData, setBoardsData]: Array<any> = useState();
  const auth = getAuth(app);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

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

  const fetchBoards = async () => {
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

          setBoardsData(boardList);
        }
      );

      return () => unsubscribe();
    }
  };

  useEffect(() => {
    fetchBoards();
  }, [user]);

  return (
    <div className="sm:ml-[300px] mx-5 sm:mt-3 mt-16 ">
      <AlertDialog>
        <div className="flex items-center gap-5">
          <h2 className="font-bold text-2xl">Your Boards </h2>
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
                    required
                    name="color"
                    onChange={boardOnChangeHandler}
                    className="mt-3 bg-gray-50 border border-gray-300  text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  >
                    <option
                      selected
                      disabled
                      value="bg-white"
                      className="text-gray-500"
                    >
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
                  <AlertDialogAction type="submit">Submit</AlertDialogAction>
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
              className={`${boardData.color} w-fit px-[70px] py-[50px] hover:scale-105 hover:cursor-pointer duration-200`}
              onClick={() => router.push(`/boards/${boardData.id}`)}
              key={boardData.id}
            >
              <p className="text-black">{boardData.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
