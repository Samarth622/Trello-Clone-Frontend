import { useState, useEffect } from 'react';
import { recommendationsAPI, type Recommendation } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { X, Lightbulb, TrendingUp, Link2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface RecommendationsSidebarProps {
  boardId: string;
  onClose: () => void;
}

const RecommendationsSidebar = ({ boardId, onClose }: RecommendationsSidebarProps) => {
  const [recommendations, setRecommendations] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const response = await recommendationsAPI.get(boardId);
        setRecommendations(response.data.recommendations);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load recommendations.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [boardId]);

  return (
    <div className="flex w-80 flex-col border-l border-border/50 bg-card">
      <div className="flex items-center justify-between border-b border-border/50 p-4">
        <h3 className="font-semibold">AI Recommendations</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : !recommendations ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No recommendations available
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.dueDateSuggestions && recommendations.dueDateSuggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Lightbulb className="h-4 w-4" />
                    Due Date Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recommendations.dueDateSuggestions.map((suggestion, idx) => (
                    <div key={idx} className="rounded-lg border border-border/50 p-2 text-xs">
                      <p className="mb-1 font-medium">Card: {suggestion.cardTitle}</p>
                      <p className="text-muted-foreground">{suggestion.reason}</p>
                      <Badge variant="outline" className="mt-1">
                        {new Date(suggestion.suggestedDue).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {recommendations.moveSuggestions && recommendations.moveSuggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    Move Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recommendations.moveSuggestions.map((suggestion, idx) => (
                    <div key={idx} className="rounded-lg border border-border/50 p-2 text-xs">
                      <p className="mb-1 font-medium">Card: {suggestion.cardTitle}</p>
                      <p className="text-muted-foreground">{suggestion.reason}</p>
                      <Badge variant="outline" className="mt-1">
                        → {suggestion.suggestedListId}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {recommendations.relatedGroups && recommendations.relatedGroups.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Link2 className="h-4 w-4" />
                    Related Groups
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recommendations.relatedGroups.map((group, idx) => (
                    <div key={idx} className="rounded-lg border border-border/50 p-2 text-xs">
                      <p className="mb-1 text-muted-foreground">{group.reason}</p>
                      <div className="flex flex-wrap gap-1">
                        {group.cards.map((card, cardIdx) => (
                          <Badge key={cardIdx} variant="secondary">
                            {card.title}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {(!recommendations.dueDateSuggestions || recommendations.dueDateSuggestions.length === 0) &&
              (!recommendations.moveSuggestions || recommendations.moveSuggestions.length === 0) &&
              (!recommendations.relatedGroups || recommendations.relatedGroups.length === 0) && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No recommendations available at this time
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsSidebar;
