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
import { Ellipsis, Trash, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toaster, toast } from "sonner";

interface DeleteListProps {
  listId: string;
  onListDeleted: () => void;
}

export default function DeleteList({ listId, onListDeleted }: DeleteListProps) {
  const db = getFirestore(app);

  const listDeleteHandler = async () => {
    try {
      const cardsQuery = query(
        collection(db, "cards"),
        where("listId", "==", listId)
      );

      const cardsSnapshot = await getDocs(cardsQuery);

      const deleteCardPromises = cardsSnapshot.docs.map((cardDoc) =>
        deleteDoc(cardDoc.ref)
      );

      await Promise.all(deleteCardPromises);

      await deleteDoc(doc(db, "lists", listId));

      onListDeleted();

      toast.success("List deleted successfully");
    } catch (error) {
      console.error("Error deleting list and its cards:", error);
    }
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Trash2 className="w-4 h-4 text-gray-200 hover:text-red-500 hover:scale-110 duration-200" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            className="hover:cursor-pointer"
            onClick={() => listDeleteHandler()}
          >
            Delete list
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
