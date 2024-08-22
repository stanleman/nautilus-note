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
import { Ellipsis } from "lucide-react";

interface CardProps {
  listId: string;
  refresh: boolean;
}

export default function Card({ listId, refresh }: CardProps) {
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
        cardsData.map((card: any) => (
          <div key={card.id}>
            <EditCard
              listId={listId}
              cardId={card.id}
              cardName={card.name}
              cardDesc={card.description}
              cardDueDate={card.dueDate}
              onCardEdited={fetchCards}
            />
          </div>
        ))
      ) : (
        <></>
      )}
    </div>
  );
}
