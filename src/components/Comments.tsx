import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  content: string;
  selection: string;
  position: { top: number; left: number };
  resolved: boolean;
  created_at: string;
  user_id: string;
  parent_comment_id: string | null;
  document_id: string | null;
}

interface CommentsProps {
  documentId?: string;
  onSuggestionApply: (originalText: string, suggestion: string) => void;
}

const Comments: React.FC<CommentsProps> = ({ documentId, onSuggestionApply }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  useEffect(() => {
    if (documentId) {
      loadComments();
    }
  }, [documentId]);

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('document_comments')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match the Comment interface
      const transformedComments: Comment[] = (data || []).map(comment => ({
        ...comment,
        selection: '', // Add default selection since it's not in the database
        position: comment.position || { top: 0, left: 0 },
      }));
      
      setComments(transformedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Failed to load comments');
    }
  };

  const addComment = async () => {
    const selection = window.getSelection();
    if (!selection || !selection.toString() || !newComment || !documentId) {
      toast.error("Please select text and enter a comment");
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('document_comments')
        .insert({
          document_id: documentId,
          content: newComment,
          position: {
            top: rect.top + window.scrollY,
            left: rect.right + window.scrollX,
          },
          parent_comment_id: replyTo,
          user_id: userData.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Transform the new comment to match the Comment interface
      const newCommentData: Comment = {
        ...data,
        selection: selection.toString(),
        position: data.position || { top: 0, left: 0 },
      };

      setComments([...comments, newCommentData]);
      setNewComment('');
      setReplyTo(null);
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const toggleResolved = async (commentId: string, currentResolved: boolean) => {
    try {
      const { error } = await supabase
        .from('document_comments')
        .update({ resolved: !currentResolved })
        .eq('id', commentId);

      if (error) throw error;

      setComments(comments.map(c => 
        c.id === commentId ? { ...c, resolved: !currentResolved } : c
      ));

      toast.success(`Comment marked as ${!currentResolved ? 'resolved' : 'unresolved'}`);
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const getThreadedComments = () => {
    const threads: { [key: string]: Comment[] } = {};
    comments.forEach(comment => {
      if (!comment.parent_comment_id) {
        if (!threads[comment.id]) {
          threads[comment.id] = [comment];
        } else {
          threads[comment.id].unshift(comment);
        }
      } else {
        if (!threads[comment.parent_comment_id]) {
          threads[comment.parent_comment_id] = [comment];
        } else {
          threads[comment.parent_comment_id].push(comment);
        }
      }
    });
    return threads;
  };

  return (
    <div className="w-64 bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4" />
        <h3 className="font-semibold">Comments</h3>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Enter comment or suggestion..."
          />
          <Button onClick={addComment} size="sm">Add</Button>
        </div>
        
        <ScrollArea className="h-[400px]">
          {Object.entries(getThreadedComments()).map(([threadId, thread]) => (
            <div key={threadId} className="mb-4 space-y-2">
              {thread.map((comment, index) => (
                <div 
                  key={comment.id} 
                  className={cn(
                    "p-2 border rounded-md",
                    index > 0 ? "ml-4" : "",
                    comment.resolved ? "bg-green-50" : "bg-white"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <p className="text-sm">{comment.content}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleResolved(comment.id, !!comment.resolved)}
                    >
                      {comment.resolved ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setReplyTo(comment.id)}
                    >
                      Reply
                    </Button>
                    {!comment.parent_comment_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSuggestionApply(comment.selection, comment.content)}
                      >
                        Apply
                      </Button>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(comment.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
};

export default Comments;