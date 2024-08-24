"use client";

import app from "@/config.js";
import { useEffect, useState } from "react";
import EditCard from "./editCard";
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
  orderBy,
} from "firebase/firestore";
import { Draggable } from "@hello-pangea/dnd";

interface CardProps {
  listId: string;
  refresh: boolean;
  index: any;
}

export default function Card({ listId, refresh, index }: CardProps) {
  const db = getFirestore(app);

  const [cardsData, setCardsData] = useState<any | null>(null);

  const fetchCards = async () => {
    const listDocRef = doc(db, "lists", listId);
    const listDoc = await getDoc(listDocRef);

    if (listDoc.exists()) {
      const listData = listDoc.data();
      const cards = listData?.cards || [];
      setCardsData(cards);
    } else {
      setCardsData([]);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [refresh]);

  return (
    <div>
      {cardsData && cardsData.length > 0 ? (
        cardsData.map((card: any, index: number) => (
          <Draggable key={card.id} draggableId={card.id} index={index}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className={`flex justify-between items-center w-full  text-start bg-blue-500 py-2 px-3 mt-2 rounded-md ${
                  snapshot.isDragging ? "bg-blue-500/50" : ""
                }`}
              >
                {card.name}
                <EditCard
                  listId={listId}
                  cardId={card.id}
                  cardName={card.name}
                  cardDesc={card.description}
                  cardDueDate={card.dueDate}
                  onCardEdited={fetchCards}
                  index={index}
                />
              </div>
            )}
          </Draggable>
        ))
      ) : (
        <div>
          <Draggable draggableId={String(index)} index={index}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              ></div>
            )}
          </Draggable>
        </div>
      )}
    </div>
  );
}
