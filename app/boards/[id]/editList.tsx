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

interface EditListProps {
  listId: string;
  boardId: string;
  listName: string;
  listCards: String[];
  listCreatedDate: string;
  onListEdited: () => void;
}

export default function EditList({
  listId,
  boardId,
  listName,
  listCards,
  listCreatedDate,
  onListEdited,
}: EditListProps) {
  const db = getFirestore(app);

  const [list, setList] = useState({
    name: listName,
    boardId: "",
    updatedAt: new Date(),
  });

  const listOnChangeHandler = (e: any) => {
    setList({
      ...list,
      [e.target.name]: e.target.value,
    });
  };

  const editListHandler = async () => {
    await setDoc(doc(db, "lists", listId), {
      name: list.name,
      boardId: boardId,
      cards: listCards,
      createdAt: listCreatedDate,
    });

    // toast.success("List name edited successfully");
    onListEdited();
  };

  return (
    <div>
      <input
        type="text"
        name="name"
        className="bg-transparent w-full"
        value={list.name}
        onChange={listOnChangeHandler}
        onBlur={editListHandler}
      />
    </div>
  );
}
