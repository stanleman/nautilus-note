"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getAuth, User } from "firebase/auth";
import app from "@/config.js";
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
import BarLoader from "react-spinners/BarLoader";
import { Ellipsis, Trash2 } from "lucide-react";
import Card from "./card";
import EditList from "./editList";
import EditBoard from "../editBoard";
import DeleteList from "./deleteList";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export default function BoardItem({ params }: { params: { id: string } }) {
  const router = useRouter();
  const db = getFirestore(app);
  const auth = getAuth(app);
  const [user, setUser] = useState<User | null>(null);

  const [boardsData, setBoardsData] = useState<any | null>(null);
  const [boardDataLoading, setBoardDataLoading] = useState(true);
  const [boardDataError, setBoardDataError] = useState<string | null>(null);

  const [list, setList] = useState({ name: "" });

  const [listData, setListData] = useState<any | null>(null);
  const [listDataLoading, setListDataLoading] = useState(true);
  const [listDataError, setListDataError] = useState<string | null>(null);

  const [refresh, setRefresh] = useState(false);

  console.log("id is", params.id);

  const [card, setCard] = useState({
    name: "",
    description: "",
    dueDate: "",
    listId: "",
  });

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

  const fetchBoards = async () => {
    if (user) {
      const boardsRef = doc(db, "boards", params.id);

      getDoc(boardsRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            setBoardsData(docSnap.data());
          } else {
            setBoardDataError("Board not found");
          }
        })
        .catch(() => {
          setBoardDataError("Failed to fetch board data");
        })
        .finally(() => {
          setBoardDataLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchBoards();
  }, [user, params.id, db]);

  const fetchLists = async () => {
    if (boardsData) {
      const listsRef = collection(db, "lists");

      const q = query(listsRef, where("boardId", "==", params.id));

      getDocs(q)
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            const lists = [] as any[];
            querySnapshot.forEach((doc) => {
              lists.push({ id: doc.id, ...doc.data() });
            });
            setListData(lists);
          } else {
            console.log("List not found");
          }
        })
        .catch(() => {
          setListDataError("Failed to fetch list data");
        })
        .finally(() => {
          setListDataLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchLists();
  }, [boardsData, params.id, db, list]);

  if (boardDataLoading || listDataLoading)
    return (
      <div className="h-screen w-full absolute flex flex-col bg-[#020817] justify-center items-center !z-[9999]">
        <h1 className="text-white text-xl font-semibold mb-3">Loading...</h1>
        <BarLoader color="#90E4C1" />
      </div>
    );
  if (boardDataError)
    return (
      <p className="sm:ml-[300px] mx-5 sm:mt-3 mt-16">
        Board data error: {boardDataError}
      </p>
    );
  if (listDataError)
    return (
      <p className="sm:ml-[300px] mx-5 sm:mt-3 mt-16">
        List data error: {listDataError}
      </p>
    );

  const listOnChangeHandler = (e: any) => {
    setList({
      ...list,
      [e.target.name]: e.target.value,
    });
  };

  const addListHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await addDoc(collection(db, "lists"), {
      name: list.name,
      createdAt: new Date(),
      boardId: params.id,
    });

    setList({ name: "" });

    toast.success("Board added successfully");
  };

  const boardDeleteHandler = async () => {
    const listsQuery = query(
      collection(db, "lists"),
      where("boardId", "==", params.id)
    );

    const listsSnapshot = await getDocs(listsQuery);

    const deleteCardsPromises = listsSnapshot.docs.map(async (listDoc) => {
      const cardsQuery = query(
        collection(db, "cards"),
        where("listId", "==", listDoc.id)
      );

      const cardsSnapshot = await getDocs(cardsQuery);
      const deleteCardPromises = cardsSnapshot.docs.map((cardDoc) =>
        deleteDoc(cardDoc.ref)
      );

      return Promise.all(deleteCardPromises);
    });

    await Promise.all(deleteCardsPromises);

    const deleteListPromises = listsSnapshot.docs.map((listDoc) =>
      deleteDoc(listDoc.ref)
    );

    await Promise.all(deleteListPromises);

    await deleteDoc(doc(db, "boards", params.id));

    router.push("/boards");
  };

  const cardOnChangeHandler = (e: any) => {
    setCard({
      ...card,
      [e.target.name]: e.target.value,
    });
  };

  const addCardHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await addDoc(collection(db, "cards"), {
      name: card.name,
      description: card.description,
      listId: card.listId,
      dueDate: card.dueDate,
      createdAt: new Date(),
    });

    setCard({
      name: "",
      description: "",
      dueDate: "",
      listId: "",
    });

    setRefresh(!refresh);

    toast.success("Card added successfully");
  };

  return (
    <div>
      <div className="w-full flex justify-end mt-4 mb-0 sm:hidden ">
        <Button
          className="bg-transparent text-neutral-300 hover:bg-slate-600/30"
          onClick={() => router.push("/boards")}
        >
          Return to boards page →
        </Button>
      </div>
      <div className="sm:ml-[300px] mx-5 sm:mt-3 mt-3">
        {boardsData && (
          <div>
            <AlertDialog>
              <div className="flex items-center justify-between gap-5">
                <div className="flex gap-4 items-center">
                  <EditBoard
                    boardId={params.id}
                    userId={user?.uid as string}
                    boardName={boardsData.name}
                    boardColor={boardsData.color}
                    onBoardEdited={fetchBoards}
                  />

                  <div className="flex gap-2">
                    <AlertDialogTrigger className="bg-[#90E4C1] text-primary-foreground hover:bg-[#90E4C1]/90 px-4 py-[10px] rounded-md text-sm flex">
                      <span className="min-[900px]:flex hidden">
                        Add new list
                      </span>
                      +
                    </AlertDialogTrigger>

                    <AlertDialog>
                      <AlertDialogTrigger className="text-white px-4 py-[10px] rounded-md text-sm bg-red-500 hover:bg-red-900 flex items-center gap-1">
                        <span className="min-[900px]:flex hidden">
                          Delete board
                        </span>
                        <Trash2 size={15} />
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your board and remove your data from our
                            servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-900 text-white"
                            onClick={boardDeleteHandler}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <Button
                  className="bg-transparent text-neutral-300 hover:bg-slate-600/30 sm:flex hidden"
                  onClick={() => router.push("/boards")}
                >
                  <span className="min-[783px]:flex hidden">
                    Return to boards page
                  </span>{" "}
                  →
                </Button>
              </div>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Add new list</AlertDialogTitle>
                  <AlertDialogDescription>
                    <form className=" mx-auto" onSubmit={addListHandler}>
                      <div className="mb-5">
                        <input
                          type="text"
                          name="name"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          placeholder="List name"
                          onChange={listOnChangeHandler}
                          required
                        />
                      </div>

                      <div className="flex gap-1">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction type="submit">
                          Submit
                        </AlertDialogAction>
                      </div>
                    </form>
                  </AlertDialogDescription>
                </AlertDialogHeader>
              </AlertDialogContent>
            </AlertDialog>
            <Toaster richColors closeButton />
            {listData && listData.length > 0 ? (
              <div className="flex list-container fixed w-[90vw] sm:w-[75vw] overflow-x-auto">
                {listData?.map((list: any) => (
                  <div
                    className="signature rounded-lg mt-5 min-w-48 p-2 mr-4 flex flex-col"
                    key={list.id}
                  >
                    <div className="w-full flex justify-between items-center">
                      <EditList
                        boardId={list.boardId}
                        listName={list.name}
                        listId={list.id}
                        onListEdited={fetchLists}
                      />

                      <DeleteList listId={list.id} onListDeleted={fetchLists} />
                    </div>

                    <Card listId={list.id} refresh={refresh} />

                    <AlertDialog>
                      <div className="flex items-center gap-5 mt-2">
                        <AlertDialogTrigger
                          onClick={() =>
                            setCard({
                              ...card,
                              listId: list.id,
                            })
                          }
                          className="bg-transparent w-full text-start text-neutral-300 hover:hover:bg-slate-600/30 px-1 py-[10px] rounded-md text-sm"
                        >
                          Add new card +
                        </AlertDialogTrigger>
                      </div>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Add new card</AlertDialogTitle>
                          <AlertDialogDescription>
                            <form
                              className=" mx-auto"
                              onSubmit={addCardHandler}
                            >
                              <div className="mb-5">
                                <input
                                  type="text"
                                  name="name"
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                  placeholder="Card name"
                                  required
                                  onChange={cardOnChangeHandler}
                                />
                              </div>

                              <div className="mb-5">
                                <textarea
                                  name="description"
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                  placeholder="Card description"
                                  required
                                  onChange={cardOnChangeHandler}
                                ></textarea>
                              </div>

                              <div className="mb-5">
                                <input
                                  type="date"
                                  name="dueDate"
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                  required
                                  onChange={cardOnChangeHandler}
                                />
                              </div>

                              <div className="flex gap-1">
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction type="submit">
                                  Submit
                                </AlertDialogAction>
                              </div>
                            </form>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3">You currently have no lists</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
