import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

interface Comment {
  id: string;
  text: string;
  selection: string;
  position: { top: number; left: number };
}

interface CommentsProps {
  onSuggestionApply: (originalText: string, suggestion: string) => void;
}

const Comments: React.FC<CommentsProps> = ({ onSuggestionApply }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const { toast } = useToast();

  const addComment = () => {
    const selection = window.getSelection();
    if (!selection || !selection.toString() || !newComment) {
      toast({
        title: "Error",
        description: "Please select text and enter a comment",
        variant: "destructive",
      });
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment,
      selection: selection.toString(),
      position: {
        top: rect.top + window.scrollY,
        left: rect.right + window.scrollX,
      },
    };

    setComments([...comments, comment]);
    setNewComment('');
  };

  const applySuggestion = (comment: Comment) => {
    onSuggestionApply(comment.selection, comment.text);
    setComments(comments.filter(c => c.id !== comment.id));
    toast({
      title: "Success",
      description: "Suggestion applied successfully",
    });
  };

  return (
    <div className="fixed right-4 top-20 w-64 bg-white rounded-lg shadow-lg p-4">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Enter comment or suggestion..."
          />
          <Button onClick={addComment} size="sm">Add</Button>
        </div>
        
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {comments.map((comment) => (
              <div key={comment.id} className="p-2 border rounded-md">
                <p className="text-sm font-medium">Selected: "{comment.selection}"</p>
                <p className="text-sm mt-1">{comment.text}</p>
                <Button 
                  onClick={() => applySuggestion(comment)}
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                >
                  Apply Suggestion
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Comments;