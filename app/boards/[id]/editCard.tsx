import app from "@/config.js";
import { useState } from "react";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
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
import { Ellipsis, Pencil } from "lucide-react";
import { toast } from "sonner";
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
  });

  const cardOnChangeHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCard({
      ...card,
      [e.target.name]: e.target.value,
    });
  };

  const editCardHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
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
        toast.error("List not found");
      }
    } catch (error) {
      console.error("Error editing card:", error);
      toast.error("Failed to edit card");
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = formatDate(new Date().toISOString());

  return (
    <AlertDialog>
      <AlertDialogTrigger className="flex-shrink-0">
        <Ellipsis className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded transition-colors" />
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Card</AlertDialogTitle>
          <AlertDialogDescription>
            <form className="mx-auto" onSubmit={editCardHandler}>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                >
                  Card Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full p-2 rounded border border-gray-300 "
                  required
                  value={card.name}
                  onChange={cardOnChangeHandler}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="w-full p-2 rounded border border-gray-300  min-h-[100px]"
                  value={card.description}
                  onChange={cardOnChangeHandler}
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="dueDate"
                  className="block text-sm font-medium mb-1"
                >
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  min={today}
                  className="w-full p-2 rounded border border-gray-300 "
                  value={card.dueDate}
                  onChange={cardOnChangeHandler}
                  onKeyDown={(e) => e.preventDefault()}
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                  <AlertDialogAction type="submit">
                    Save Changes
                  </AlertDialogAction>
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
  );
}
