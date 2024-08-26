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
  documentId,
  setDoc,
  orderBy,
  updateDoc,
  arrayUnion,
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
import { GripHorizontal, Trash2 } from "lucide-react";
import Card from "./card";
import EditList from "./editList";
import EditBoard from "../editBoard";
import DeleteList from "./deleteList";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { v4 as uuidv4 } from "uuid";

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
  const [isLoading, setIsLoading] = useState(false);

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

      const q = query(
        listsRef,
        where("boardId", "==", params.id),
        orderBy("createdAt", "asc")
      );

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
      createdAt: new Date().toLocaleTimeString(),
      boardId: params.id,
      cards: [],
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

    const newCard = {
      id: uuidv4(),
      name: card.name,
      description: card.description,
      dueDate: card.dueDate,
      createdAt: new Date(),
    };

    const listDocRef = doc(db, "lists", card.listId);
    await updateDoc(listDocRef, {
      cards: arrayUnion(newCard),
    });

    setCard({
      name: "",
      description: "",
      dueDate: "",
      listId: "",
    });

    setRefresh(!refresh);

    fetchLists();

    toast.success("Card added successfully");
  };

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) {
      return;
    }

    setIsLoading(true);

    if (type === "list") {
      const destinationRef = doc(db, "lists", listData[destination.index].id);
      const sourceRef = doc(db, "lists", listData[source.index].id);
      await updateDoc(destinationRef, {
        createdAt: listData[source.index].createdAt,
      });
      await updateDoc(sourceRef, {
        createdAt: listData[destination.index].createdAt,
      });
      fetchLists();
      setIsLoading(false);
      return;
    }

    const sourceList = listData.find(
      (list: any) => list.id === source.droppableId
    );

    console.log(sourceList);

    const destinationList = listData.find(
      (list: any) => list.id === destination.droppableId
    );

    console.log(destinationList);

    if (!sourceList || !destinationList) {
      console.error("Source or destination list not found");
      setIsLoading(false);
      return;
    }

    const validateList = (list: any) => {
      return list && Array.isArray(list.cards);
    };

    if (!validateList(sourceList) || !validateList(destinationList)) {
      console.error("Invalid list or cards array");
      setIsLoading(false);
      return;
    }

    try {
      if (source.droppableId === destination.droppableId) {
        console.log("Moving within same list");
        const updatedCards = Array.from(sourceList.cards);
        const [movedCard] = updatedCards.splice(source.index, 1);
        updatedCards.splice(destination.index, 0, movedCard);

        const listRef = doc(db, "lists", source.droppableId);
        await updateDoc(listRef, { cards: updatedCards });

        updateListsState(
          { ...sourceList, cards: updatedCards },
          destinationList
        );
      } else {
        console.log("Moving between different lists");
        console.log(sourceList);
        const sourceCards = Array.from(sourceList.cards);
        const [movedCard] = sourceCards.splice(source.index, 1);

        const destinationCards = Array.from(destinationList.cards);
        destinationCards.splice(destination.index, 0, movedCard);

        const sourceListRef = doc(db, "lists", source.droppableId);
        const destinationListRef = doc(db, "lists", destination.droppableId);

        console.log(sourceCards);
        console.log(destinationCards);

        await updateDoc(sourceListRef, { cards: sourceCards });
        await updateDoc(destinationListRef, { cards: destinationCards });

        updateListsState(
          { ...sourceList, cards: sourceCards },
          { ...destinationList, cards: destinationCards }
        );
      }
    } catch (error) {
      console.error("Error updating Firestore:", error);

      toast.error("Failed to update card positions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateListsState = (
    updatedSourceList: any,
    updatedDestinationList: any
  ) => {
    setListData((prevState: any) =>
      prevState.map((list: any) =>
        list.id === updatedSourceList.id
          ? { ...list, cards: updatedSourceList.cards }
          : list.id === updatedDestinationList.id
          ? { ...list, cards: updatedDestinationList.cards }
          : list
      )
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full absolute flex flex-col bg-[#020817] justify-center items-center !z-[9999]">
        <h1 className="text-white text-xl font-semibold mb-3">Loading...</h1>
        <BarLoader color="#90E4C1" />
      </div>
    );
  }

  const formatDate = (date: any) => {
    const d = new Date(date);
    const year = d.getFullYear();
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  };

  const today = formatDate(new Date());

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="">
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
                        +
                      </AlertDialogTrigger>

                      <AlertDialog>
                        <AlertDialogTrigger className="text-white px-4 py-[10px] rounded-md text-sm bg-red-500 hover:bg-red-900 flex items-center gap-1">
                          <Trash2 size={15} />
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete your board and remove your data
                              from our servers.
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

                        <div className="">
                          <AlertDialogCancel className="mr-2">
                            Cancel
                          </AlertDialogCancel>
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

              <Droppable droppableId="lists" type="list" direction="horizontal">
                {(provided, snapshot) => (
                  <div
                    className="sm:h-[calc(100vh-63px)] h-[calc(100vh-120px)] overflow-x-auto"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <div className="flex list-container w-[90vw] sm:w-[75vw]">
                      {listData && listData.length > 0 ? (
                        listData.map((list: any, index: any) => (
                          <Draggable
                            key={list.id}
                            draggableId={list.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                className="list-style rounded-lg mt-5 min-w-48 p-2 mr-4 flex flex-col"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  ...(snapshot.isDragging
                                    ? {
                                        boxShadow:
                                          "0 0 0 1px rgba(0, 0, 0, 0.1)",
                                      }
                                    : {}), // Optional: Add styling when dragging
                                }}
                              >
                                <div
                                  className="mb-1 w-full flex justify-center"
                                  {...provided.dragHandleProps}
                                >
                                  <GripHorizontal className="text-gray-400 w-4 h-4" />
                                </div>
                                <div className="w-full flex justify-between items-center gap-2">
                                  <EditList
                                    boardId={list.boardId}
                                    listName={list.name}
                                    listId={list.id}
                                    listCards={list.cards}
                                    listCreatedDate={list.createdAt}
                                    onListEdited={fetchLists}
                                  />
                                  <DeleteList
                                    listId={list.id}
                                    onListDeleted={fetchLists}
                                  />
                                </div>

                                <Droppable droppableId={list.id} type="task">
                                  {(provided, snapshot) => (
                                    <div
                                      className="flex flex-col"
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                    >
                                      <Card
                                        listId={list.id}
                                        refresh={refresh}
                                        index={index}
                                      />
                                      {provided.placeholder}

                                      <AlertDialog>
                                        <div className="flex items-center gap-5 mt-2">
                                          <AlertDialogTrigger
                                            onClick={() =>
                                              setCard({
                                                ...card,
                                                listId: list.id,
                                              })
                                            }
                                            className="bg-transparent w-full text-start text-neutral-300 hover:bg-slate-600/30 px-1 py-[10px] rounded-md text-sm"
                                          >
                                            Add new card +
                                          </AlertDialogTrigger>
                                        </div>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>
                                              Add new card
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                              <form
                                                className="mx-auto"
                                                onSubmit={addCardHandler}
                                              >
                                                <div className="mb-5">
                                                  <input
                                                    type="text"
                                                    name="name"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    placeholder="Card name"
                                                    required
                                                    onChange={
                                                      cardOnChangeHandler
                                                    }
                                                  />
                                                </div>

                                                <div className="mb-5">
                                                  <textarea
                                                    name="description"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    placeholder="Card description"
                                                    onChange={
                                                      cardOnChangeHandler
                                                    }
                                                  ></textarea>
                                                </div>

                                                <div className="mb-5">
                                                  <input
                                                    type="date"
                                                    name="dueDate"
                                                    min={today}
                                                    onKeyDown={(e) =>
                                                      e.preventDefault()
                                                    }
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    onChange={
                                                      cardOnChangeHandler
                                                    }
                                                  />
                                                </div>

                                                <div className="">
                                                  <AlertDialogCancel className="mr-2">
                                                    Cancel
                                                  </AlertDialogCancel>
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
                                  )}
                                </Droppable>
                              </div>
                            )}
                          </Draggable>
                        ))
                      ) : (
                        <p className="mt-3">You currently have no lists</p>
                      )}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          )}
        </div>
      </div>
    </DragDropContext>
  );
}
