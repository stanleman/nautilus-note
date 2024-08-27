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
  updateDoc,
  orderBy,
  onSnapshot,
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
import { Pencil, PencilLine, AlignLeft, Album } from "lucide-react";
import { Toaster, toast } from "sonner";
import DeleteCard from "./deleteCard";
import { Draggable } from "react-beautiful-dnd";

interface EditCardProps {
  listId: string;
  cardId: string;
  cardName: string;
  cardDesc: string;
  cardDueDate: string;
  index: number;
  onCardEdited: () => void;
}

export default function EditCard({
  listId,
  cardId,
  cardName,
  cardDesc,
  cardDueDate,
  index,
  onCardEdited,
}: EditCardProps) {
  const db = getFirestore(app);

  const [card, setCard] = useState({
    name: cardName,
    description: cardDesc,
    dueDate: cardDueDate,
    listId: "",
  });

  const cardOnChangeHandler = (e: any) => {
    setCard({
      ...card,
      [e.target.name]: e.target.value,
    });
  };

  const editCardHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const listRef = doc(db, "lists", listId);
    const listDoc = await getDoc(listRef);

    if (listDoc.exists()) {
      const listData = listDoc.data();
      const updatedCards = listData.cards.map((c: any) =>
        c.id === cardId
          ? {
              ...c,
              name: card.name,
              description: card.description,
              dueDate: card.dueDate,
            }
          : c
      );

      await updateDoc(listRef, { cards: updatedCards });

      toast.success("Card edited successfully");
      onCardEdited();
    } else {
      console.error("List document does not exist");
    }
  };

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
    <div>
      <AlertDialog>
        <AlertDialogTrigger
          onClick={() =>
            setCard({
              ...card,
              listId: listId,
            })
          }
          className="flex-shrink-0"
        >
          <Pencil className="w-4 h-4 cursor-pointer mt-1" />
        </AlertDialogTrigger>

        <AlertDialogTitle></AlertDialogTitle>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogDescription>
              <form className="mx-auto" onSubmit={editCardHandler}>
                <div className="mb-3 flex items-center gap-1">
                  <Album />
                  <input
                    type="text"
                    name="name"
                    className="text-xl font-bold rounded-lg block w-full p-2.5 bg-transparent border-gray-600 placeholder-gray-400 text-white"
                    required
                    value={card.name}
                    onChange={cardOnChangeHandler}
                  />
                </div>
                <div className="mb-3">
                  <p className="mb-2">Description</p>
                  <textarea
                    name="description"
                    className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                    placeholder="Card description"
                    value={card.description}
                    onChange={cardOnChangeHandler}
                  ></textarea>
                </div>
                <div className="mb-5">
                  <p className="mb-2">Due date</p>
                  <input
                    type="date"
                    min={today}
                    onKeyDown={(e) => e.preventDefault()}
                    name="dueDate"
                    className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                    value={card.dueDate}
                    onChange={cardOnChangeHandler}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="">
                    <AlertDialogCancel className="mr-2">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction type="submit">Submit</AlertDialogAction>
                  </div>
                  <DeleteCard
                    cardId={cardId}
                    listId={listId}
                    onCardDeleted={onCardEdited}
                  />
                </div>
              </form>
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
