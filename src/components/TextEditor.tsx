import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import EditorToolbar from './EditorToolbar';
import EditorContent from './EditorContent';
import PageNavigation from './PageNavigation';
import Comments from './Comments';
import { useConversation } from '@11labs/react';
import { useToast } from "@/components/ui/use-toast";

interface Page {
  id: string;
  content: string;
}

const TextEditor = () => {
  const [pages, setPages] = useState<Page[]>([{ id: uuidv4(), content: '' }]);
  const [currentPage, setCurrentPage] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const conversation = useConversation({
    overrides: {
      agent: {
        language: language,
      },
    },
    customLlmExtraBody: {
      model: 'eleven_multilingual_v2'
    }
  });

  useEffect(() => {
    const checkPageOverflow = () => {
      if (editorRef.current) {
        const A4_HEIGHT_PX = 1123;
        if (editorRef.current.scrollHeight > A4_HEIGHT_PX) {
          const overflowContent = editorRef.current.innerHTML;
          const newPage: Page = { id: uuidv4(), content: '' };
          setPages(prevPages => {
            const updatedPages = [...prevPages];
            updatedPages[currentPage].content = overflowContent.substring(0, overflowContent.length / 2);
            newPage.content = overflowContent.substring(overflowContent.length / 2);
            return [...updatedPages, newPage];
          });
          setCurrentPage(prev => prev + 1);
        }
      }
    };

    const observer = new MutationObserver(checkPageOverflow);
    if (editorRef.current) {
      observer.observe(editorRef.current, { 
        childList: true, 
        subtree: true, 
        characterData: true 
      });
    }

    return () => observer.disconnect();
  }, [currentPage]);

  const handleFormat = async (command: string, value?: string) => {
    try {
      if (command === 'toggleComments') {
        setShowComments(!showComments);
        return;
      }

      if (command === 'startDictation') {
        if (isRecording) {
          conversation.endSession();
          setSessionId(null);
          setIsRecording(false);
        } else {
          const newSessionId = await conversation.startSession({
            agentId: 'default'
          });
          setSessionId(newSessionId);
          setIsRecording(true);
        }
        return;
      }

      if (command === 'setLanguage') {
        setLanguage(value as 'en' | 'es');
        return;
      }

      if (editorRef.current) {
        document.execCommand(command, false, value);
        editorRef.current.focus();
        console.log(`Applied format: ${command} with value: ${value}`);
      }
    } catch (error) {
      console.error('Error executing command:', command, error);
      toast({
        title: "Error",
        description: "There was an error executing the command",
        variant: "destructive",
      });
    }
  };

  const handleSuggestionApply = (originalText: string, suggestion: string) => {
    if (!editorRef.current) return;
    const content = editorRef.current.innerHTML;
    editorRef.current.innerHTML = content.replace(originalText, suggestion);
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const updatedPages = [...pages];
    updatedPages[currentPage].content = e.currentTarget.innerHTML;
    setPages(updatedPages);
    console.log('Content updated:', e.currentTarget.innerHTML);
  };

  return (
    <div className="min-h-screen bg-editor-background">
      <EditorToolbar onFormat={handleFormat} />
      <div className="max-w-6xl mx-auto p-8 flex gap-4">
        <div className="flex-1">
          <PageNavigation
            pages={pages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
          <EditorContent
            ref={editorRef}
            content={pages[currentPage].content}
            onInput={handleInput}
          />
        </div>
        {showComments && (
          <Comments onSuggestionApply={handleSuggestionApply} />
        )}
      </div>
    </div>
  );
};

export default TextEditor;