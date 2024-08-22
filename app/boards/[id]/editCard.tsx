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
import { EllipsisVertical, Captions, AlignLeft, Album } from "lucide-react";
import { Toaster, toast } from "sonner";
import DeleteCard from "./deleteCard";

interface EditCardProps {
  listId: string;
  cardId: string;
  cardName: string;
  cardDesc: string;
  cardDueDate: string;
  onCardEdited: () => void;
}

export default function EditCard({
  listId,
  cardId,
  cardName,
  cardDesc,
  cardDueDate,
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

    await setDoc(doc(db, "cards", cardId), {
      name: card.name,
      description: card.description,
      listId: card.listId,
      dueDate: card.dueDate,
      updatedAt: new Date(),
    });

    toast.success("Card edited successfully");
    onCardEdited();
  };
  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger
          onClick={() =>
            setCard({
              ...card,
              listId: listId,
            })
          }
          className="flex justify-between items-center w-full text-start bg-blue-500 py-2 px-3 mt-2 rounded-md"
        >
          <p>{cardName}</p>
          <AlignLeft className="w-5 h-5 flex-shrink-0" />
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogDescription>
              <form className=" mx-auto" onSubmit={editCardHandler}>
                <div className="mb-3 flex items-center gap-1">
                  <Album />
                  <input
                    type="text"
                    name="name"
                    className="text-xl font-bold rounded-lg block w-full p-2.5 dark:bg-transparent dark:border-gray-600 dark:placeholder-gray-400 dark:text-white "
                    required
                    value={card.name}
                    onChange={cardOnChangeHandler}
                  />
                </div>

                <div className="mb-3">
                  <p className="mb-2">Description</p>
                  <textarea
                    name="description"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Card description"
                    required
                    value={card.description}
                    onChange={cardOnChangeHandler}
                  ></textarea>
                </div>

                <div className="mb-5">
                  <p className="mb-2">Due date</p>
                  <input
                    type="date"
                    name="dueDate"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required
                    value={card.dueDate}
                    onChange={cardOnChangeHandler}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex gap-1">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction type="submit">Submit</AlertDialogAction>
                  </div>

                  <DeleteCard cardId={cardId} onCardDeleted={onCardEdited} />
                </div>
              </form>
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
