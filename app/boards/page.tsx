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
  getDoc,
  doc,
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
  const [userData, setUserData] = useState<any | null>(null);
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

  const fetchUsers = async () => {
    if (user) {
      console.log(user.uid);
      const usersRef = doc(db, "users", user?.uid);

      getDoc(usersRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        })
        .catch(() => {
          console.log("Failed to fetch board data");
        });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const boardOnChangeHandler = (e: any) => {
    setBoard({
      ...board,
      [e.target.name]: e.target.value,
    });
  };

  const addBoardHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (boardsData) {
      if (boardsData.length >= 10 && !userData.isPremium) {
        toast.error("You have reached your board limit");
      } else {
        await addDoc(collection(db, "boards"), {
          name: board.name,
          color: board.color,
          createdAt: new Date(),
          userId: user?.uid,
        });

        setBoard({ name: "", color: "bg-white" });

        toast.success("Board added successfully");
      }
    }
  };

  const [colors, setColors] = useState<any | null>(null);

  const fetchColors = async () => {
    const colorsRef = doc(db, "colors", "colors");

    getDoc(colorsRef).then((colorSnap) => {
      if (colorSnap.exists()) {
        setColors(colorSnap.data());
      } else {
        console.log("color list not found");
      }
    });
  };

  useEffect(() => {
    fetchColors();
  }, []);

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

  const colorToGradient: Record<string, string> = {
    "bg-white": "bg-gradient-to-br from-gray-100 to-gray-300",
    "bg-green-500": "bg-gradient-to-br from-green-100 to-green-300",
    "bg-blue-500": "bg-gradient-to-br from-blue-100 to-blue-300",
    "bg-orange-500": "bg-gradient-to-br from-orange-100 to-orange-300",
    "bg-pink-500": "bg-gradient-to-br from-pink-200 to-pink-400",
    "bg-red-500": "bg-gradient-to-br from-pink-300 to-pink-500",
    "bg-yellow-500": "bg-gradient-to-br from-yellow-200 to-yellow-400",
    "bg-purple-500": "bg-gradient-to-br from-purple-200 to-purple-400",
  };

  return (
    <div className="sm:ml-[300px] mx-5 sm:mt-4 mt-16 mb-6">
      {userData ? (
        <h2 className="font-bold text-3xl mt-20 mb-10">
          Welcome back, {userData.name}
        </h2>
      ) : (
        <></>
      )}

      <Toaster richColors closeButton />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ">
        <AlertDialog>
          <AlertDialogTrigger>
            <div className="rounded-2xl p-6 h-48 text-gray-400 hover:scale-[1.02] transition-transform duration-200 cursor-pointer border-gray-300 border-3 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold mb-2">＋</p>
                <p className="text-lg font-medium">Add a board</p>
              </div>
            </div>
          </AlertDialogTrigger>

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
                      className=" text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white "
                      placeholder="Board name"
                      required
                    />

                    <select
                      required
                      name="color"
                      onChange={boardOnChangeHandler}
                      className="mt-3  text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                    >
                      <option
                        selected
                        disabled
                        value="bg-white"
                        className="text-gray-500"
                      >
                        Select a color
                      </option>
                      {colors &&
                        Object.entries(colors).map(
                          ([colorName, colorValue]) => (
                            <option
                              key={colorName}
                              value={colorValue as any}
                              className={`${colorValue}  text-black`}
                            >
                              {colorName.charAt(0).toUpperCase() +
                                colorName.slice(1)}
                            </option>
                          )
                        )}
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

        {boardsData &&
          boardsData.map((boardData: any) => (
            <div
              key={boardData.id}
              className={`rounded-2xl p-6 h-48 text-black shadow-md hover:scale-[1.02] transition-transform duration-200 cursor-pointer ${
                colorToGradient[boardData.color] || "bg-gray-200"
              }`}
              onClick={() => router.push(`/boards/${boardData.id}`)}
            >
              <p className="text-xl ">{boardData.name}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
