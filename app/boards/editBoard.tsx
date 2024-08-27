import app from "@/config.js";
import { useEffect, useState, useRef } from "react";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
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

  const [colors, setColors] = useState<any | null>(null);

  const fetchColors = async () => {
    const colorsRef = doc(db, "colors", "colors");

    getDoc(colorsRef).then((colorSnap) => {
      if (colorSnap.exists()) {
        setColors(colorSnap.data());
      } else {
        console.log("color list not found");
      }
    });
  };

  useEffect(() => {
    fetchColors();
  }, []);

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
        className=" border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white "
      >
        <option selected disabled value={board.color} className="!text-white">
          Edit board color
        </option>
        {colors &&
          Object.entries(colors).map(([colorName, colorValue]) => (
            <option
              key={colorName}
              className={`${colorValue}  text-black`}
              value={colorValue as any}
            >
              {colorName.charAt(0).toUpperCase() + colorName.slice(1)}
            </option>
          ))}
      </select>
    </div>
  );
}
