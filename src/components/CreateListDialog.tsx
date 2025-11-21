import { useState } from 'react';
import { listsAPI, type List } from '../services/api';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';

interface CreateListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  onListCreated: (list: List) => void;
}

const CreateListDialog = ({ open, onOpenChange, boardId, onListCreated }: CreateListDialogProps) => {
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await listsAPI.create(boardId, { title });
      toast({
        title: 'List created',
        description: `${title} has been created successfully.`,
      });
      onListCreated(response.data);
      setTitle('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not create list. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
            <DialogDescription>Add a new list to organize your cards.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="list-title">List Title</Label>
              <Input
                id="list-title"
                placeholder="e.g., To Do, In Progress, Done"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create List'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateListDialog;
