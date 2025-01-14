import { CardProps } from "@/types/cardTypes";
import "./index.css";

export default function Card({ card }: { card: CardProps }) {
  return (
    <div id={card.id} className={`c-box ${card.isDragging ? 'placeholder' : ''}`}>
      {card.name}
    </div>
  );
}
