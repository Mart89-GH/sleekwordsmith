import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import EditorToolbar from './EditorToolbar';
import { cn } from '@/lib/utils';
import { useToast } from "@/components/ui/use-toast";
import { DocumentVersion, generatePDF, exportToWord } from '../utils/documentUtils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export const TextEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [currentContent, setCurrentContent] = useState<string>('');

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

  const handleFormat = (command: string, value?: string) => {
    try {
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
    </div>
  );
};

export default TextEditor;