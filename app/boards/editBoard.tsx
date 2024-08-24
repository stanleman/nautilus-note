import app from "@/config.js";
import { useEffect, useState, useRef } from "react";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { Toaster, toast } from "sonner";

interface EditBoardProps {
  boardId: string;
  userId: string;
  boardName: string;
  boardColor: string;
  onBoardEdited: () => void;
}

export default function EditBoard({
  boardId,
  userId,
  boardName,
  boardColor,
  onBoardEdited,
}: EditBoardProps) {
  const db = getFirestore(app);
  const [board, setBoard] = useState({
    name: boardName,
    color: boardColor,
    userId: "",
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (inputRef.current && spanRef.current) {
      inputRef.current.style.width = `${spanRef.current.offsetWidth + 2}px`;
    }
  }, [board.name]);

  const boardOnChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBoard({
      ...board,
      [e.target.name]: e.target.value,
    });
  };

  const colorOnChangeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBoard({
      ...board,
      [e.target.name]: e.target.value,
    });
  };

  const editBoardHandler = async () => {
    await setDoc(doc(db, "boards", boardId), {
      name: board.name,
      userId: userId,
      color: board.color,
      updatedAt: new Date(),
    });
    onBoardEdited();
  };

  return (
    <div className="flex items-center gap-3">
      <span
        ref={spanRef}
        className="invisible absolute whitespace-pre"
        style={{ visibility: "hidden", whiteSpace: "pre" }}
      >
        {board.name}
      </span>
      <input
        ref={inputRef}
        type="text"
        name="name"
        className="bg-transparent"
        value={board.name}
        onChange={boardOnChangeHandler}
        onBlur={editBoardHandler}
        style={{ width: "auto" }}
      />

      <select
        onChange={colorOnChangeHandler}
        onBlur={editBoardHandler}
        name="color"
        className=" bg-gray-50 border border-gray-300  text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      >
        <option selected disabled value={board.color} className="!text-white">
          Edit board color
        </option>
        <option value="bg-red-500">Red</option>
        <option value="bg-blue-500">Blue</option>
        <option value="bg-green-500">Green</option>
        <option value="bg-orange-500">Orange</option>
        <option value="bg-yellow-500">Yellow</option>
        <option value="bg-purple-500">Purple</option>
      </select>
    </div>
  );
}
