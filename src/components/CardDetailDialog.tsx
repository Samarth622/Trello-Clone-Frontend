import { useState } from 'react';
import { cardsAPI, type Card } from '../services/api';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { Trash2, Save } from 'lucide-react';

interface CardDetailDialogProps {
  card: Card;
  boardId: string;
  onClose: () => void;
  onCardUpdated: () => void;
}

const CardDetailDialog = ({ card, boardId, onClose, onCardUpdated }: CardDetailDialogProps) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [priority, setPriority] = useState(card.priority || 'medium');
  const [dueDate, setDueDate] = useState(card.dueDate ? card.dueDate.split('T')[0] : '');
  const [labels, setLabels] = useState(card.labels?.join(', ') || '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);

    try {
      await cardsAPI.update(boardId, card._id, {
        title,
        description,
        priority: priority as 'low' | 'medium' | 'high' | 'urgent',
        dueDate: dueDate || undefined,
        labels: labels.split(',').map((l) => l.trim()).filter(Boolean),
      });
      toast({
        title: 'Card updated',
        description: 'Changes have been saved successfully.',
      });
      onCardUpdated();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update card. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this card?')) return;

    setIsLoading(true);
    try {
      await cardsAPI.delete(boardId, card._id);
      toast({
        title: 'Card deleted',
        description: 'The card has been removed.',
      });
      onCardUpdated();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not delete card.',
      });
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Card Details</DialogTitle>
          <DialogDescription>View and edit card information</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-priority">Priority</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high' | 'urgent')} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-duedate">Due Date</Label>
              <Input
                id="edit-duedate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-labels">Labels (comma-separated)</Label>
            <Input
              id="edit-labels"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              placeholder="bug, feature, urgent"
              disabled={isLoading}
            />
          </div>

          {card.assignees && card.assignees.length > 0 && (
            <div className="space-y-2">
              <Label>Assignees</Label>
              <div className="flex flex-wrap gap-2">
                {card.assignees.map((assignee) => (
                  <Badge key={assignee.id} variant="secondary">
                    {assignee.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Card
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardDetailDialog;
