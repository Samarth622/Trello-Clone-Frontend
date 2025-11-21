import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { boardsAPI, listsAPI, cardsAPI, type Board, type List, type Card } from '../services/api';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import { ArrowLeft, Plus, Settings } from 'lucide-react';
import BoardList from '../components/BoardList';
import CreateListDialog from '../components/CreateListDialog';
import CardDetailDialog from '../components/CardDetailDialog';
import RecommendationsSidebar from '../components/RecommendationsSidebar';
import DraggableCard from '../components/DraggableCard';

const BoardView = () => {
  const { boardId } = useParams<{ boardId: string }>();

  const navigate = useNavigate();
  const { toast } = useToast();

  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateList, setShowCreateList] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const loadBoard = async () => {
    if (!boardId) return;
    
    try {
      const [boardRes, listsRes, cardsRes] = await Promise.all([
        boardsAPI.getById(boardId),
        listsAPI.getAll(boardId),
        cardsAPI.getAll(boardId),
      ]);

      setBoard(boardRes.data.board);
      setLists(listsRes.data.lists);

      console.log('Loaded cards:', cardsRes.data.cards);

      setCards(cardsRes.data.cards);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load board data.',
      });
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBoard();
  }, [boardId]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    // FIX: Ensure we compare strings correctly
    const card = cards.find((c) => c._id === active.id || c.id === active.id);
    if (card) {
      setActiveCard(card);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over || active.id === over.id) return;

    // FIX: Check both _id and id to be safe
    const activeCard = cards.find((c) => (c._id || c.id) === active.id);
    if (!activeCard || !boardId) return;

    // FIX: Use _id for lists
    const overList = lists.find((l) => l._id === over.id);
    const overCard = cards.find((c) => (c._id || c.id) === over.id);

    let targetListId = activeCard.list;
    let newPosition = activeCard.position;

    if (overList) {
      targetListId = overList._id; // FIX: Use _id
      const cardsInList = cards.filter((c) => c.list === targetListId);
      newPosition = cardsInList.length;
    } else if (overCard) {
      targetListId = overCard.list;
      newPosition = overCard.position;
    }

    if (targetListId === activeCard.list && newPosition === activeCard.position) return;

    try {
      // FIX: Ensure we send the correct card ID
      await cardsAPI.move(boardId, activeCard._id || activeCard.id, { targetListId, newPosition });
      await loadBoard();
      toast({
        title: 'Card moved',
        description: 'Card has been moved successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not move card.',
      });
    }
  };

  const handleListCreated = (list: List) => {
    setLists((prev) => [...prev, list]);
    setShowCreateList(false);
  };

  const handleCardCreated = () => {
    loadBoard();
  };

  const handleCardUpdated = () => {
    loadBoard();
    setSelectedCard(null);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!board) return null;

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-br from-background via-primary/5 to-secondary/5">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold">{board.title}</h1>
              {board.description && <p className="text-sm text-muted-foreground">{board.description}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowRecommendations(!showRecommendations)}>
              <Settings className="mr-2 h-4 w-4" />
              AI Recommendations
            </Button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-x-auto p-4">
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 pb-4">
              {/* FIX: Use list._id here so SortableContext knows the correct IDs */}
              <SortableContext items={lists.map((l) => l._id)} strategy={horizontalListSortingStrategy}>
                {lists.map((list) => (
                  <BoardList
                    key={list._id}
                    list={list}
                    cards={cards.filter((c) => c.list === list._id)}
                    onCardClick={setSelectedCard}
                    onCardCreated={handleCardCreated}
                    boardId={boardId!}
                  />
                ))}
              </SortableContext>

              <Button
                variant="outline"
                className="h-fit min-w-[280px] border-dashed"
                onClick={() => setShowCreateList(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add List
              </Button>
            </div>

            <DragOverlay>
              {activeCard ? <DraggableCard card={activeCard} isDragging /> : null}
            </DragOverlay>
          </DndContext>
        </div>

        {showRecommendations && boardId && (
          <RecommendationsSidebar boardId={boardId} onClose={() => setShowRecommendations(false)} />
        )}
      </main>

      <CreateListDialog
        open={showCreateList}
        onOpenChange={setShowCreateList}
        boardId={boardId!}
        onListCreated={handleListCreated}
      />

      {selectedCard && (
        <CardDetailDialog
          card={selectedCard}
          boardId={boardId!}
          onClose={() => setSelectedCard(null)}
          onCardUpdated={handleCardUpdated}
        />
      )}
    </div>
  );
};

export default BoardView;