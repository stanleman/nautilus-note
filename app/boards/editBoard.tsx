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

  const editBoardHandler = async () => {
    await setDoc(doc(db, "boards", boardId), {
      name: board.name,
      userId: userId,
      color: boardColor,
      updatedAt: new Date(),
    });
    onBoardEdited();
  };

  return (
    <div>
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
    </div>
  );
}
