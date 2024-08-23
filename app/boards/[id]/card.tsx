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
} from "firebase/firestore";
import { Draggable } from "@hello-pangea/dnd";

interface CardProps {
  listId: string;
  refresh: boolean;
  index: number;
}

export default function Card({ listId, refresh, index }: CardProps) {
  const db = getFirestore(app);

  const [cardsData, setCardsData] = useState<any | null>(null);

  const fetchCards = async () => {
    const cardsQuery = query(
      collection(db, "cards"),
      where("listId", "==", listId)
    );

    const querySnapshot = await getDocs(cardsQuery);
    if (!querySnapshot.empty) {
      const cards = [] as any[];
      querySnapshot.forEach((doc) => {
        cards.push({ id: doc.id, ...doc.data() });
      });
      setCardsData(cards);
    } else {
      setCardsData([]);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [listId, refresh]);

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
                className={`flex !left-auto !top-auto justify-between items-center w-full text-start bg-blue-500 py-2 px-3 mt-2 rounded-md ${
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
                />
              </div>
            )}
          </Draggable>
        ))
      ) : (
        <></>
      )}
    </div>
  );
}
