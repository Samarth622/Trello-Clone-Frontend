import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card } from '@/services/api';
import { List } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import DraggableCard from './DraggableCard';
import CreateCardDialog from './CreateCardDialog';

interface BoardListProps {
  list: List;
  cards: Card[];
  onCardClick: (card: Card) => void;
  onCardCreated: () => void;
  boardId: string;
}

const BoardList = ({ list, cards, onCardClick, onCardCreated, boardId }: BoardListProps) => {
  const [showCreateCard, setShowCreateCard] = useState(false);
  const { setNodeRef } = useDroppable({ id: list.id });

  const sortedCards = [...cards].sort((a, b) => a.position - b.position);

  const handleCardCreated = () => {
    onCardCreated();
    setShowCreateCard(false);
  };

  return (
    <div className="flex min-w-[280px] max-w-[280px] flex-col rounded-lg border border-border/50 bg-card shadow-sm">
      <div className="border-b border-border/50 p-3">
        <h3 className="font-semibold">{list.title}</h3>
        <p className="text-xs text-muted-foreground">{cards.length} cards</p>
      </div>

      <div ref={setNodeRef} className="flex-1 space-y-2 overflow-y-auto p-3">
        <SortableContext items={sortedCards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {sortedCards.map((card) => (
            <DraggableCard key={card.id} card={card} onClick={() => onCardClick(card)} />
          ))}
        </SortableContext>

        {sortedCards.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Drop cards here or add a new one
          </div>
        )}
      </div>

      <div className="border-t border-border/50 p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => setShowCreateCard(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Card
        </Button>
      </div>

      <CreateCardDialog
        open={showCreateCard}
        onOpenChange={setShowCreateCard}
        boardId={boardId}
        listId={list.id}
        onCardCreated={handleCardCreated}
      />
    </div>
  );
};

export default BoardList;