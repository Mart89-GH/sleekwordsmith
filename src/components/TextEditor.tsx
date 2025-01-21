import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import EditorToolbar from './EditorToolbar';
import FindReplace from './FindReplace';
import { cn } from '@/lib/utils';
import { useToast } from "@/components/ui/use-toast";
import { DocumentVersion, generatePDF, exportToWord } from '../utils/documentUtils';
import { handleImageUpload } from '../utils/imageUtils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

export const TextEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [currentContent, setCurrentContent] = useState<string>('');
  const [showFindReplace, setShowFindReplace] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    // Save version every 30 seconds if content changed
    const saveInterval = setInterval(() => {
      if (editorRef.current && editorRef.current.innerHTML !== currentContent) {
        const newVersion: DocumentVersion = {
          content: editorRef.current.innerHTML,
          timestamp: new Date(),
          id: uuidv4(),
        };
        setVersions(prev => [newVersion, ...prev]);
        setCurrentContent(editorRef.current.innerHTML);
        
        console.log('Auto-saved version:', newVersion.timestamp);
      }
    }, 30000);

    return () => clearInterval(saveInterval);
  }, [currentContent]);

  useEffect(() => {
    if (transcript && editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(transcript));
      } else {
        editorRef.current.innerHTML += transcript;
      }
      resetTranscript();
    }
  }, [transcript]);

  const handleFormat = (command: string, value?: string) => {
    console.log('Executing command:', command, value);
    try {
      if (command === 'exportPDF' || command === 'exportWord' || command === 'restoreVersion') {
        if (command === 'exportPDF') {
          generatePDF(editorRef.current)
            .then(() => {
              toast({
                title: "Success",
                description: "PDF exported successfully",
              });
            })
            .catch(() => {
              toast({
                title: "Error",
                description: "Failed to export PDF",
                variant: "destructive",
              });
            });
          return;
        }

        if (command === 'exportWord') {
          if (editorRef.current) {
            exportToWord(editorRef.current.innerHTML);
            toast({
              title: "Success",
              description: "Word document exported successfully",
            });
          }
          return;
        }

        if (command === 'restoreVersion') {
          if (value && editorRef.current) {
            const version = versions.find(v => v.id === value);
            if (version) {
              editorRef.current.innerHTML = version.content;
              setCurrentContent(version.content);
              toast({
                title: "Success",
                description: "Version restored successfully",
              });
            }
          }
          return;
        }
      }

      if (command === 'insertImage') {
        fileInputRef.current?.click();
        return;
      }

      if (command === 'insertTable') {
        const rows = parseInt(value?.split('x')[0] || '2');
        const cols = parseInt(value?.split('x')[1] || '2');
        insertTable(rows, cols);
        return;
      }

      if (command === 'startDictation') {
        if (browserSupportsSpeechRecognition) {
          SpeechRecognition.startListening();
        } else {
          toast({
            title: "Error",
            description: "Your browser doesn't support speech recognition",
            variant: "destructive",
          });
        }
        return;
      }

      if (command === 'stopDictation') {
        SpeechRecognition.stopListening();
        return;
      }

      if (command === 'toggleFindReplace') {
        setShowFindReplace(!showFindReplace);
        return;
      }

      // Handle standard formatting commands
      if (value) {
        document.execCommand(command, false, value);
      } else {
        document.execCommand(command, false);
      }
      
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

  const handleImageUploadChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const imageUrl = await handleImageUpload(file);
        document.execCommand('insertImage', false, imageUrl);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
        });
      }
    }
  };

  const insertTable = (rows: number, cols: number) => {
    let table = '<table border="1" style="border-collapse: collapse;">';
    for (let i = 0; i < rows; i++) {
      table += '<tr>';
      for (let j = 0; j < cols; j++) {
        table += '<td style="padding: 8px; min-width: 50px;"></td>';
      }
      table += '</tr>';
    }
    table += '</table>';
    document.execCommand('insertHTML', false, table);
  };

  const handleFind = (text: string) => {
    const content = editorRef.current?.innerHTML || '';
    const regex = new RegExp(text, 'gi');
    const highlightedContent = content.replace(regex, match => `<mark>${match}</mark>`);
    if (editorRef.current) {
      editorRef.current.innerHTML = highlightedContent;
    }
  };

  const handleReplace = (find: string, replace: string) => {
    const content = editorRef.current?.innerHTML || '';
    const regex = new RegExp(find, 'gi');
    const newContent = content.replace(regex, replace);
    if (editorRef.current) {
      editorRef.current.innerHTML = newContent;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-editor-background">
      <EditorToolbar onFormat={handleFormat} />
      {showFindReplace && (
        <FindReplace onFind={handleFind} onReplace={handleReplace} />
      )}
      <div className="max-w-6xl mx-auto p-8 flex gap-4">
        <div className="flex-1">
          <div
            ref={editorRef}
            contentEditable
            className={cn(
              "min-h-[842px] w-full p-8 bg-white rounded-lg shadow-sm",
              "focus:outline-none focus:ring-2 focus:ring-editor-primary/20",
              "text-editor-text text-base leading-relaxed",
              "transition-all duration-200"
            )}
            suppressContentEditableWarning
            onInput={(e) => setCurrentContent(e.currentTarget.innerHTML)}
          />
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="fixed right-4 top-20">
              Version History
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Document History</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-100px)] mt-4">
              <div className="space-y-4">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleFormat('restoreVersion', version.id)}
                  >
                    <p className="text-sm text-gray-500">
                      {formatDate(version.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUploadChange}
      />
    </div>
  );
};

export default TextEditor;
