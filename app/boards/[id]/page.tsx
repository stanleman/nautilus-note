"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
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
  updateDoc,
  arrayUnion,
  writeBatch,
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
import {
  GripHorizontal,
  Trash2,
  Edit2,
  ArrowUpDown,
  Flag,
  ArrowLeft,
} from "lucide-react";
import EditList from "./editList";
import EditBoard from "../editBoard";
import DeleteList from "./deleteList";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { v4 as uuidv4 } from "uuid";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import throttle from "lodash.throttle";
import React from "react";
import EditCard from "./editCard";
import DeleteCard from "./deleteCard";
// import { Separator } from "@radix-ui/react-separator";

interface Card {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  createdAt: Date;
}

interface List {
  id: string;
  name: string;
  boardId: string;
  createdAt: string;
  cards: any;
  position: { x: number; y: number };
}

interface Board {
  name: string;
  color: string;
}

const LIST_WIDTH = 288;
const CARD_HEIGHT = 60;
const CANVAS_PADDING = 500;
const MIN_CANVAS_SIZE = 1000;
const SNAP_SIZE = 20;

// Replace your current MemoizedList component with this updated version
const MemoizedList = React.memo(
  ({
    list,
    onMouseDown,
    draggedList,
    updateListPosition,
    deleteCard,
    setCard,
    addCardHandler,
    cardOnChangeHandler,
    today,
    card,
    lists,
    moveCardToList,
    selectedCard,
    setSelectedCard,
    swapCards,
    fetchLists,
  }: {
    list: List;
    onMouseDown: (e: React.MouseEvent, listId: string) => void;
    draggedList: string | null;
    updateListPosition: (
      listId: string,
      position: { x: number; y: number }
    ) => void;
    deleteCard: (cardId: string, listId: string) => void;
    setCard: React.Dispatch<React.SetStateAction<any>>;
    addCardHandler: (e: React.FormEvent<HTMLFormElement>) => void;
    cardOnChangeHandler: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    today: string;
    card: any;
    lists: List[];
    moveCardToList: (
      cardId: string,
      fromListId: string,
      toListId: string
    ) => void;
    selectedCard: { cardId: string; listId: string } | null;
    setSelectedCard: React.Dispatch<
      React.SetStateAction<{ cardId: string; listId: string } | null>
    >;
    swapCards: (
      card1: { cardId: string; listId: string },
      card2: { cardId: string; listId: string }
    ) => void;
    fetchLists: () => void;
  }) => {
    const [showMoveOptions, setShowMoveOptions] = useState<string | null>(null);

    const handleCardClick = (clickedCardId: string) => {
      if (!selectedCard) {
        // First card selection
        setSelectedCard({ cardId: clickedCardId, listId: list.id });
      } else {
        // Second card selection - swap them
        if (
          selectedCard.cardId === clickedCardId &&
          selectedCard.listId === list.id
        ) {
          // Clicked the same card - deselect
          setSelectedCard(null);
        } else {
          // Swap cards
          swapCards(selectedCard, { cardId: clickedCardId, listId: list.id });
          setSelectedCard(null);
        }
      }
    };

    return (
      <div
        key={list.id}
        style={{
          position: "absolute",
          left: `${list.position.x}px`,
          top: `${list.position.y}px`,
          width: `${LIST_WIDTH}px`,
          transform: draggedList === list.id ? "scale(1.02)" : "none",
          zIndex: draggedList === list.id ? 100 : "auto",
          transition: draggedList === list.id ? "none" : "transform 0.2s ease",
        }}
        className="select-none"
      >
        <div className="w-72 bg-white rounded-lg shadow-lg border">
          <div
            className={`p-3 border-b bg-gray-50 rounded-t-lg ${
              draggedList === list.id ? "cursor-grabbing" : "cursor-grab"
            }`}
            onMouseDown={(e) => onMouseDown(e, list.id)}
          >
            <div className="flex justify-between items-center gap-2">
              <div className="flex items-center gap-2">
                <GripHorizontal size={16} className="text-gray-400" />
                <h3 className="font-medium text-gray-900">{list.name}</h3>
              </div>
              <div className="flex gap-1">
                <DeleteList
                  listId={list.id}
                  onListDeleted={() =>
                    updateListPosition(list.id, list.position)
                  }
                />
              </div>
            </div>
          </div>

          <div className="p-2 card-area">
            <div className="space-y-2 p-1 rounded" style={{ width: "100%" }}>
              {list.cards?.map((cardItem: any, cardIndex: any) => (
                <div
                  key={cardItem.id}
                  className={`bg-white rounded p-3 shadow-sm border hover:shadow-md transition-shadow relative ${
                    selectedCard?.cardId === cardItem.id &&
                    selectedCard?.listId === list.id
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                  onClick={() => handleCardClick(cardItem.id)}
                >
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-gray-900">
                        {cardItem.name}
                      </h4>
                      <div className="flex gap-1">
                        <button
                          className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded transition-colors relative"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMoveOptions(
                              showMoveOptions === cardItem.id
                                ? null
                                : cardItem.id
                            );
                          }}
                        >
                          <ArrowUpDown size={14} />
                          {showMoveOptions === cardItem.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                              <div className="py-1">
                                <div className="px-3 py-1 text-xs text-gray-500">
                                  Move to:
                                </div>
                                {lists
                                  .filter((l) => l.id !== list.id)
                                  .map((targetList) => (
                                    <button
                                      key={targetList.id}
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        moveCardToList(
                                          cardItem.id,
                                          list.id,
                                          targetList.id
                                        );
                                        setShowMoveOptions(null);
                                      }}
                                    >
                                      {targetList.name}
                                    </button>
                                  ))}
                              </div>
                            </div>
                          )}
                        </button>

                        <EditCard
                          listId={list.id}
                          cardId={cardItem.id}
                          cardName={cardItem.name}
                          cardDesc={cardItem.description}
                          cardDueDate={cardItem.dueDate}
                          onCardEdited={() => {
                            fetchLists();
                          }}
                        />
                      </div>
                    </div>

                    {cardItem.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {cardItem.description}
                      </p>
                    )}

                    {cardItem.dueDate && (
                      <div className="text-xs text-gray-500 py-1 rounded flex">
                        Due: {new Date(cardItem.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Rest of your component remains the same */}
            <AlertDialog>
              <AlertDialogTrigger
                onClick={(e) => {
                  e.stopPropagation();
                  setCard({
                    ...card,
                    listId: list.id,
                  });
                }}
                className="w-full mt-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm transition-colors text-left"
              >
                + Add a card
              </AlertDialogTrigger>
              <AlertDialogContent
                className="z-[9999]"
                onClick={(e) => e.stopPropagation()}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle>Add new card</AlertDialogTitle>
                  <AlertDialogDescription>
                    <form
                      className="mx-auto"
                      onSubmit={(e) => {
                        e.stopPropagation();
                        addCardHandler(e);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="mb-4">
                        <input
                          type="text"
                          name="name"
                          value={card.name}
                          className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 border border-gray-600 placeholder-gray-400 text-gray-600"
                          placeholder="Card title"
                          required
                          onChange={(e) => {
                            e.stopPropagation();
                            cardOnChangeHandler(e);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onFocus={(e) => e.stopPropagation()}
                        />
                      </div>

                      <div className="mb-4">
                        <textarea
                          name="description"
                          value={card.description}
                          className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 border border-gray-600 placeholder-gray-400 text-gray-600"
                          placeholder="Card description (optional)"
                          rows={3}
                          onChange={(e) => {
                            e.stopPropagation();
                            cardOnChangeHandler(e);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onFocus={(e) => e.stopPropagation()}
                        />
                      </div>

                      <div className="mb-4">
                        <input
                          type="date"
                          name="dueDate"
                          value={card.dueDate}
                          min={today}
                          className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 border border-gray-600 placeholder-gray-400 text-gray-600"
                          onChange={(e) => {
                            e.stopPropagation();
                            cardOnChangeHandler(e);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onFocus={(e) => e.stopPropagation()}
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          type="submit"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Add Card
                        </AlertDialogAction>
                      </div>
                    </form>
                  </AlertDialogDescription>
                </AlertDialogHeader>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    );
  }
);

export default function BoardItem({ params }: { params: { id: string } }) {
  const router = useRouter();
  const db = getFirestore(app);
  const auth = getAuth(app);
  const transformRef = useRef<any>(null);

  const [user, setUser] = useState<User | null>(null);
  const [boardsData, setBoardsData] = useState<Board | null>(null);
  const [boardDataLoading, setBoardDataLoading] = useState(true);
  const [boardDataError, setBoardDataError] = useState<string | null>(null);
  const [list, setList] = useState({ name: "" });
  const [listData, setListData] = useState<List[]>([]);
  const [listDataLoading, setListDataLoading] = useState(true);
  const [listDataError, setListDataError] = useState<string | null>(null);
  const [card, setCard] = useState({
    name: "",
    description: "",
    dueDate: "",
    listId: "",
  });
  const [draggedList, setDraggedList] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedCard, setSelectedCard] = useState<{
    cardId: string;
    listId: string;
  } | null>(null);

  useEffect(() => {
    const userCheck = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => userCheck();
  }, [auth]);

  const fetchBoards = async () => {
    if (!user) return;

    try {
      const boardsRef = doc(db, "boards", params.id);
      const docSnap = await getDoc(boardsRef);

      if (docSnap.exists()) {
        setBoardsData(docSnap.data() as Board);
      } else {
        setBoardDataError("Board not found");
      }
    } catch (error) {
      setBoardDataError("Failed to fetch board data");
    } finally {
      setBoardDataLoading(false);
    }
  };

  const fetchLists = async () => {
    if (!boardsData) return;

    try {
      const listsRef = collection(db, "lists");
      const q = query(listsRef, where("boardId", "==", params.id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return;

      const lists: List[] = [];
      const batch = writeBatch(db);
      let needsPositionUpdate = false;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.position) {
          needsPositionUpdate = true;
          data.position = {
            x: Math.random() * 500,
            y: Math.random() * 300,
          };
        }
        lists.push({ id: doc.id, ...data } as List);
      });

      if (needsPositionUpdate) {
        lists.forEach((list) => {
          const listRef = doc(db, "lists", list.id);
          batch.update(listRef, { position: list.position });
        });
        await batch.commit();
      }

      setListData(lists);
    } catch (error) {
      console.error("Error fetching lists:", error);
      setListDataError("Failed to fetch list data");
    } finally {
      setListDataLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, [user, params.id]);

  useEffect(() => {
    fetchLists();
  }, [boardsData, params.id]);

  const calculateCanvasSize = useCallback(() => {
    if (listData.length === 0)
      return { width: MIN_CANVAS_SIZE, height: MIN_CANVAS_SIZE };

    let bounds = {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
    };

    listData.forEach((list) => {
      bounds.minX = Math.min(bounds.minX, list.position.x);
      bounds.maxX = Math.max(bounds.maxX, list.position.x + LIST_WIDTH);

      const listHeight = 100 + (list.cards?.length * CARD_HEIGHT || 0);
      bounds.minY = Math.min(bounds.minY, list.position.y);
      bounds.maxY = Math.max(bounds.maxY, list.position.y + listHeight);
    });

    return {
      width: Math.max(
        MIN_CANVAS_SIZE,
        bounds.maxX - bounds.minX + CANVAS_PADDING
      ),
      height: Math.max(
        MIN_CANVAS_SIZE,
        bounds.maxY - bounds.minY + CANVAS_PADDING
      ),
    };
  }, [listData]);

  const [canvasSize, setCanvasSize] = useState(calculateCanvasSize());

  useEffect(() => {
    setCanvasSize(calculateCanvasSize());
  }, [calculateCanvasSize]);

  const listOnChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setList({
      ...list,
      [e.target.name]: e.target.value,
    });
  };

  const addListHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newPosition = {
      x: Math.random() * 400,
      y: Math.random() * 300,
    };

    try {
      await addDoc(collection(db, "lists"), {
        name: list.name,
        createdAt: new Date().toISOString(),
        boardId: params.id,
        cards: [],
        position: newPosition,
      });
      setList({ name: "" });
      await fetchLists();
      toast.success("List added successfully");
    } catch (error) {
      toast.error("Failed to add list");
      console.error(error);
    }
  };

  const throttledUpdate = useMemo(
    () =>
      throttle(
        async (listId: string, newPosition: { x: number; y: number }) => {
          try {
            const listRef = doc(db, "lists", listId);
            await updateDoc(listRef, { position: newPosition });
          } catch (error) {
            console.error("Error updating position:", error);
            fetchLists();
            toast.error("Failed to update list position");
          }
        },
        100
      ),
    [db]
  );

  const updateListPosition = useCallback(
    (listId: string, newPosition: { x: number; y: number }) => {
      const snappedPosition = {
        x: Math.round(newPosition.x / SNAP_SIZE) * SNAP_SIZE,
        y: Math.round(newPosition.y / SNAP_SIZE) * SNAP_SIZE,
      };

      setListData((prev) =>
        prev.map((list) =>
          list.id === listId ? { ...list, position: snappedPosition } : list
        )
      );
      throttledUpdate(listId, snappedPosition);
    },
    [throttledUpdate]
  );

  const handleListMouseDown = useCallback(
    (e: React.MouseEvent, listId: string) => {
      const target = e.target as HTMLElement;

      if (
        target.closest("button") ||
        target.closest(".card-area") ||
        target.closest("[role='dialog']") ||
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest("form") ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "BUTTON"
      ) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      setDraggedList(listId);

      if (!transformRef.current) return;

      const transformState = transformRef.current.instance.transformState;
      const { scale, positionX, positionY } =
        transformRef.current.instance.transformState;
      const containerRect =
        transformRef.current.instance.wrapperComponent?.getBoundingClientRect();

      if (!containerRect) return;

      const canvasX = (e.clientX - containerRect.left - positionX) / scale;
      const canvasY = (e.clientY - containerRect.top - positionY) / scale;

      const list = listData.find((l) => l.id === listId);
      if (list) {
        setDragOffset({
          x: canvasX - list.position.x,
          y: canvasY - list.position.y,
        });
      }
    },
    [listData]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggedList || !transformRef.current) return;

      const { instance } = transformRef.current;
      const { scale, positionX, positionY } = instance.transformState;
      const containerRect = instance.wrapperComponent?.getBoundingClientRect();

      if (!containerRect) return;

      const canvasX = (e.clientX - containerRect.left - positionX) / scale;
      const canvasY = (e.clientY - containerRect.top - positionY) / scale;

      const newPosition = {
        x: Math.max(
          0,
          Math.min(canvasX - dragOffset.x, canvasSize.width - LIST_WIDTH)
        ),
        y: Math.max(
          0,
          Math.min(canvasY - dragOffset.y, canvasSize.height - 200)
        ),
      };

      setListData((prev) =>
        prev.map((list) =>
          list.id === draggedList ? { ...list, position: newPosition } : list
        )
      );
    },
    [draggedList, dragOffset, canvasSize]
  );

  const handleMouseUp = useCallback(
    async (e: MouseEvent) => {
      if (!draggedList) return;

      const target = e.target as HTMLElement;
      if (
        target.closest("[role='dialog']") ||
        target.closest("form") ||
        target.closest("input") ||
        target.closest("textarea")
      ) {
        return;
      }

      const list = listData.find((l) => l.id === draggedList);
      if (list) {
        await updateListPosition(draggedList, list.position);
      }

      setDraggedList(null);
    },
    [draggedList, listData, updateListPosition]
  );

  useEffect(() => {
    if (!draggedList) return;

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggedList, handleMouseMove, handleMouseUp]);

  const boardDeleteHandler = async () => {
    try {
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
        return Promise.all(
          cardsSnapshot.docs.map((cardDoc) => deleteDoc(cardDoc.ref))
        );
      });

      await Promise.all(deleteCardsPromises);

      const deleteListPromises = listsSnapshot.docs.map((listDoc) =>
        deleteDoc(listDoc.ref)
      );
      await Promise.all(deleteListPromises);

      await deleteDoc(doc(db, "boards", params.id));

      router.push("/boards");
    } catch (error) {
      console.error("Error deleting board:", error);
      toast.error("Failed to delete board");
    }
  };

  const cardOnChangeHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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

    try {
      const listRef = doc(db, "lists", card.listId);
      await updateDoc(listRef, {
        cards: arrayUnion(newCard),
      });

      setListData((prev) =>
        prev.map((list) =>
          list.id === card.listId
            ? { ...list, cards: [...(list.cards || []), newCard] }
            : list
        )
      );

      setCard({ name: "", description: "", dueDate: "", listId: "" });
      toast.success("Card added successfully");
    } catch (error) {
      console.error("Error adding card:", error);
      fetchLists();
      toast.error("Failed to add card");
    }
  };

  const deleteCard = async (cardId: string, listId: string) => {
    try {
      const updatedCards =
        listData
          .find((list) => list.id === listId)
          ?.cards.filter((card: any) => card.id !== cardId) || [];

      const listRef = doc(db, "lists", listId);
      await updateDoc(listRef, { cards: updatedCards });

      setListData((prev) =>
        prev.map((list) =>
          list.id === listId ? { ...list, cards: updatedCards } : list
        )
      );

      toast.success("Card deleted successfully");
    } catch (error) {
      console.error("Error deleting card:", error);
      fetchLists();
      toast.error("Failed to delete card");
    }
  };

  const moveCardToList = async (
    cardId: string,
    fromListId: string,
    toListId: string
  ) => {
    try {
      const fromList = listData.find((list) => list.id === fromListId);
      const toList = listData.find((list) => list.id === toListId);

      if (!fromList || !toList) return;

      const cardToMove = fromList.cards.find((card: any) => card.id === cardId);
      if (!cardToMove) return;

      const updatedFromCards = fromList.cards.filter(
        (card: any) => card.id !== cardId
      );

      const updatedToCards = [...toList.cards, cardToMove];

      setListData((prev) =>
        prev.map((list) => {
          if (list.id === fromListId) {
            return { ...list, cards: updatedFromCards };
          }
          if (list.id === toListId) {
            return { ...list, cards: updatedToCards };
          }
          return list;
        })
      );

      const batch = writeBatch(db);
      batch.update(doc(db, "lists", fromListId), {
        cards: updatedFromCards,
      });
      batch.update(doc(db, "lists", toListId), {
        cards: updatedToCards,
      });

      await batch.commit();
      toast.success("Card moved successfully");
    } catch (error) {
      console.error("Error moving card:", error);
      fetchLists();
      toast.error("Failed to move card");
    }
  };

  const swapCards = async (
    card1: { cardId: string; listId: string },
    card2: { cardId: string; listId: string }
  ) => {
    try {
      const list1 = listData.find((list) => list.id === card1.listId);
      const list2 = listData.find((list) => list.id === card2.listId);

      if (!list1 || !list2) return;

      const card1Data = list1.cards.find(
        (card: any) => card.id === card1.cardId
      );
      const card2Data = list2.cards.find(
        (card: any) => card.id === card2.cardId
      );

      if (!card1Data || !card2Data) return;

      let newList1Cards = [...list1.cards];
      let newList2Cards = [...list2.cards];

      if (card1.listId === card2.listId) {
        const index1 = newList1Cards.findIndex(
          (card: any) => card.id === card1.cardId
        );
        const index2 = newList1Cards.findIndex(
          (card: any) => card.id === card2.cardId
        );

        if (index1 === -1 || index2 === -1) return;

        [newList1Cards[index1], newList1Cards[index2]] = [
          newList1Cards[index2],
          newList1Cards[index1],
        ];

        setListData((prev) =>
          prev.map((list) =>
            list.id === card1.listId ? { ...list, cards: newList1Cards } : list
          )
        );

        await updateDoc(doc(db, "lists", card1.listId), {
          cards: newList1Cards,
        });
      } else {
        newList1Cards = newList1Cards.filter(
          (card: any) => card.id !== card1.cardId
        );
        newList2Cards = newList2Cards.filter(
          (card: any) => card.id !== card2.cardId
        );

        newList1Cards.push(card2Data);
        newList2Cards.push(card1Data);

        setListData((prev) =>
          prev.map((list) => {
            if (list.id === card1.listId) {
              return { ...list, cards: newList1Cards };
            }
            if (list.id === card2.listId) {
              return { ...list, cards: newList2Cards };
            }
            return list;
          })
        );

        const batch = writeBatch(db);
        batch.update(doc(db, "lists", card1.listId), {
          cards: newList1Cards,
        });
        batch.update(doc(db, "lists", card2.listId), {
          cards: newList2Cards,
        });

        await batch.commit();
      }

      toast.success("Cards swapped successfully");
    } catch (error) {
      console.error("Error swapping cards:", error);
      fetchLists();
      toast.error("Failed to swap cards");
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  };

  const today = formatDate(new Date());

  if (boardDataLoading || listDataLoading) {
    return (
      <div className="h-screen w-full absolute flex flex-col bg-[#020817] justify-center items-center !z-[9999]">
        <h1 className="text-white text-xl font-semibold mb-3">Loading...</h1>
        <BarLoader color="#90E4C1" />
      </div>
    );
  }

  if (boardDataError) {
    return (
      <p className="sm:ml-[300px] mx-5 sm:mt-3 mt-16">
        Board data error: {boardDataError}
      </p>
    );
  }

  if (listDataError) {
    return (
      <p className="sm:ml-[300px] mx-5 sm:mt-3 mt-16">
        List data error: {listDataError}
      </p>
    );
  }

  // console.log(isDraggingCard);

  return (
    <div>
      <div className="w-full flex justify-start mt-4 mb-0 sm:hidden">
        <Button
          className="bg-transparent text-neutral-700 hover:bg-slate-600/10"
          onClick={() => router.push("/boards")}
        >
          <ArrowLeft size={20} />
        </Button>
      </div>
      <div className="sm:ml-[300px] mx-5 sm:mt-3 mt-3">
        {boardsData && (
          <div>
            <AlertDialog>
              <div className="flex items-center justify-between gap-5">
                <div className="flex gap-4 items-center">
                  <Button
                    className="bg-transparent text-neutral-700 hover:bg-slate-600/10 sm:flex hidden"
                    onClick={() => router.push("/boards")}
                  >
                    <ArrowLeft size={20} />
                  </Button>

                  <EditBoard
                    boardId={params.id}
                    userId={user?.uid as string}
                    boardName={boardsData.name}
                    boardColor={boardsData.color}
                    onBoardEdited={fetchBoards}
                  />

                  <div className="flex gap-2">
                    <AlertDialogTrigger className="bg-[#90E4C1] text-primary-foreground hover:bg-[#90E4C1]/90 px-4 py-[10px] rounded-md text-sm flex">
                      + Add List
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
              </div>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Add new list</AlertDialogTitle>
                  <AlertDialogDescription>
                    <form className="mx-auto" onSubmit={addListHandler}>
                      <div className="mb-5">
                        <input
                          type="text"
                          name="name"
                          value={list.name}
                          className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 border-gray-600 placeholder-gray-400 text-gray-600"
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

            <div className="mt-4 relative">
              <TransformWrapper
                ref={transformRef}
                initialScale={1}
                minScale={0.3}
                maxScale={3}
                limitToBounds={false}
                centerOnInit={false}
                disablePadding={true}
              >
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <>
                    <div className="zoom-controls absolute right-4 top-4 z-20 flex gap-2">
                      <Button
                        onClick={() => zoomIn()}
                        size="sm"
                        variant="outline"
                      >
                        +
                      </Button>
                      <Button
                        onClick={() => zoomOut()}
                        size="sm"
                        variant="outline"
                      >
                        -
                      </Button>
                      <Button
                        onClick={() => resetTransform()}
                        size="sm"
                        variant="outline"
                      >
                        Reset
                      </Button>
                    </div>

                    <TransformComponent
                      wrapperClass="!w-full !h-[calc(100vh-200px)] border rounded-lg overflow-hidden"
                      contentClass="!w-full !h-full relative"
                    >
                      <div
                        className="absolute bg-white"
                        style={{
                          width: `${canvasSize.width}px`,
                          height: `${canvasSize.height}px`,
                          // backgroundSize: "40px 40px",
                          // backgroundImage: `
                          //   linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                          //   linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                          // `,
                          left: "50%",
                          top: "50%",
                          transform: "translate(-50%, -50%)",
                        }}
                      >
                        {listData.map((list) => (
                          <MemoizedList
                            key={list.id}
                            list={list}
                            onMouseDown={handleListMouseDown}
                            draggedList={draggedList}
                            updateListPosition={updateListPosition}
                            deleteCard={deleteCard}
                            setCard={setCard}
                            addCardHandler={addCardHandler}
                            cardOnChangeHandler={cardOnChangeHandler}
                            today={today}
                            card={card}
                            lists={listData}
                            moveCardToList={moveCardToList}
                            selectedCard={selectedCard}
                            setSelectedCard={setSelectedCard}
                            swapCards={swapCards}
                            fetchLists={fetchLists}
                          />
                        ))}
                      </div>
                    </TransformComponent>
                  </>
                )}
              </TransformWrapper>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
