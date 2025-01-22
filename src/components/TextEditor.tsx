import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import EditorToolbar from './EditorToolbar';
import Comments from './Comments';
import { useConversation } from '@11labs/react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

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
    // Check if current page content exceeds A4 height
    const checkPageOverflow = () => {
      if (editorRef.current) {
        const A4_HEIGHT_PX = 1123; // A4 height in pixels at 96 DPI
        if (editorRef.current.scrollHeight > A4_HEIGHT_PX) {
          // Create new page with overflow content
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
          const sessionId = await conversation.startSession();
          setSessionId(sessionId);
          setIsRecording(true);
        }
        return;
      }

      if (command === 'setLanguage') {
        setLanguage(value as 'en' | 'es');
        return;
      }

      // Handle standard formatting commands
      document.execCommand(command, false, value);
      editorRef.current?.focus();
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

  const handlePageChange = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      setCurrentPage(pageIndex);
    }
  };

  return (
    <div className="min-h-screen bg-editor-background">
      <EditorToolbar onFormat={handleFormat} />
      <div className="max-w-6xl mx-auto p-8 flex gap-4">
        <div className="flex-1">
          {/* Page Navigation */}
          <div className="mb-4 flex gap-2">
            {pages.map((_, index) => (
              <Button
                key={index}
                variant={currentPage === index ? "default" : "outline"}
                onClick={() => handlePageChange(index)}
              >
                Page {index + 1}
              </Button>
            ))}
          </div>

          {/* Editor */}
          <div
            ref={editorRef}
            contentEditable
            className="min-h-[1123px] w-[794px] mx-auto p-8 bg-white rounded-lg shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-editor-primary/20
                     text-editor-text text-base leading-relaxed
                     transition-all duration-200"
            suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: pages[currentPage].content }}
            onInput={(e) => {
              const updatedPages = [...pages];
              updatedPages[currentPage].content = e.currentTarget.innerHTML;
              setPages(updatedPages);
            }}
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