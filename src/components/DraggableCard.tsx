import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card as CardType } from '../services/api';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Calendar, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface DraggableCardProps {
  card: CardType;
  onClick?: () => void;
  isDragging?: boolean;
}

const DraggableCard = ({ card, onClick, isDragging }: DraggableCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: card._id });

  const style = {
    // FIX 1: Use CSS.Translate instead of CSS.Transform
    // This prevents scale distortion which breaks "top-to-bottom" dragging
    transform: CSS.Translate.toString(transform), 
    transition,
    touchAction: 'none',
  };

  const priorityColors: Record<string, string> = {
    low: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200',
    medium: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    high: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
    urgent: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
  };

  const priorityKey = (card.priority || '').toLowerCase();
  
  const isCardDragging = isDragging || isSortableDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      // FIX 2: Add 'relative' so z-50 actually works
      className={cn("touch-none relative", isCardDragging ? "z-50 opacity-50" : "")}
    >
      <Card
        onClick={onClick}
        className={cn(
          'cursor-pointer p-3 transition-all hover:shadow-md hover:border-primary/50',
        )}
      >
        <h4 className="mb-2 font-medium leading-none">{card.title}</h4>
        
        {card.description && (
          <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
            {card.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {card.priority && (
            <Badge 
              variant="outline" 
              className={cn("font-normal capitalize", priorityColors[priorityKey])}
            >
              <AlertCircle className="mr-1 h-3 w-3" />
              {card.priority}
            </Badge>
          )}

          {card.dueDate && (
            <Badge variant="outline" className="font-normal text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" />
              {new Date(card.dueDate).toLocaleDateString()}
            </Badge>
          )}

          {card.labels && card.labels.length > 0 && (
            <div className="flex gap-1 ml-auto">
              {card.labels.slice(0, 2).map((label, idx) => (
                <div key={idx} className="h-2 w-6 rounded-full bg-primary/20" title={label} />
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DraggableCard;