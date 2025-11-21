import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { boardsAPI, type Board } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { Plus, Layers, LogOut, Lock, Users } from 'lucide-react';
import CreateBoardDialog from '../components/CreateBoardDialog';

const Dashboard = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadBoards = async () => {
    try {
      const response = await boardsAPI.getAll();
      setBoards(response.data.boards);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error loading boards',
        description: 'Could not fetch your boards. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBoards();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBoardCreated = (board: Board) => {
    setBoards((prev) => [board, ...prev]);
    setShowCreateDialog(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-primary/5 to-secondary/5">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">TaskFlow</h1>
              <p className="text-xs text-muted-foreground">Welcome back, {user?.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Your Boards</h2>
            <p className="text-muted-foreground">Manage and organize your projects</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Board
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : boards.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Layers className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-semibold">No boards yet</h3>
              <p className="mb-4 text-center text-muted-foreground">
                Create your first board to start organizing your tasks
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Board
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {boards.map((board) => (
              <Card
                key={board._id}
                className="cursor-pointer transition-all hover:shadow-lg"
                onClick={() => navigate(`/board/${board._id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="line-clamp-1">{board.title}</CardTitle>
                    {board.isPrivate ? (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Users className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  {board.description && (
                    <CardDescription className="line-clamp-2">{board.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Owner: {board.owner.name}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <CreateBoardDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onBoardCreated={handleBoardCreated}
      />
    </div>
  );
};

export default Dashboard;
