import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import EditorToolbar from './EditorToolbar';
import Comments from './Comments';
import ImageManager from './ImageManager';
import TableManager from './TableManager';
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
import { useConversation } from '@11labs/react';
import { Canvas as FabricCanvas, Image as FabricImage } from 'fabric';

export const TextEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const { toast } = useToast();
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [currentContent, setCurrentContent] = useState<string>('');
  const [showComments, setShowComments] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es'>('en');

  const conversation = useConversation({
    overrides: {
      agent: {
        language: language,
      },
    },
  });

  useEffect(() => {
    if (!editorRef.current) return;

    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = editorRef.current.offsetWidth;
    canvas.height = editorRef.current.offsetHeight;
    editorRef.current.appendChild(canvas);

    // Initialize Fabric.js canvas
    fabricCanvasRef.current = new FabricCanvas(canvas, {
      width: canvas.width,
      height: canvas.height,
      backgroundColor: 'transparent',
    });

    return () => {
      fabricCanvasRef.current?.dispose();
      canvas.remove();
    };
  }, []);

  useEffect(() => {
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

  const handleFormat = async (command: string, value?: string) => {
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

      if (command === 'toggleComments') {
        setShowComments(!showComments);
        return;
      }

      if (command === 'startDictation') {
        if (isRecording) {
          await conversation.endSession();
          setIsRecording(false);
          toast({
            title: "Dictation Ended",
            description: `Dictation in ${language === 'en' ? 'English' : 'Spanish'} has ended`,
          });
        } else {
          await conversation.startSession({
            agentId: "default",
          });
          setIsRecording(true);
          toast({
            title: "Dictation Started",
            description: `Dictation in ${language === 'en' ? 'English' : 'Spanish'} has started`,
          });
        }
        return;
      }

      if (command === 'setLanguage') {
        setLanguage(value as 'en' | 'es');
        toast({
          title: "Language Changed",
          description: `Dictation language set to ${value === 'en' ? 'English' : 'Spanish'}`,
        });
        return;
      }

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

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && fabricCanvasRef.current) {
        FabricImage.fromURL(e.target.result as string, (img) => {
          img.scaleToWidth(200); // Set a default width
          fabricCanvasRef.current?.add(img);
          fabricCanvasRef.current?.renderAll();
          console.log('Image added to canvas');
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageLayerChange = (direction: 'front' | 'back') => {
    const activeObject = fabricCanvasRef.current?.getActiveObject();
    if (!activeObject) {
      toast({
        title: "No Image Selected",
        description: "Please select an image to change its layer",
        variant: "destructive",
      });
      return;
    }

    if (direction === 'front') {
      activeObject.bringToFront?.();
    } else {
      activeObject.sendToBack?.();
    }
    fabricCanvasRef.current?.renderAll();
  };

  const handleImageWrap = (wrap: 'inline' | 'float') => {
    const activeObject = fabricCanvasRef.current?.getActiveObject();
    if (!activeObject) {
      toast({
        title: "No Image Selected",
        description: "Please select an image to change its wrap setting",
        variant: "destructive",
      });
      return;
    }

    // Set the wrapping mode as a custom property
    activeObject.set('wrap', wrap);
    fabricCanvasRef.current?.renderAll();
  };

  const handleCreateTable = (rows: number, cols: number) => {
    const table = document.createElement('table');
    table.className = 'border-collapse border border-gray-300 my-4';
    
    for (let i = 0; i < rows; i++) {
      const row = table.insertRow();
      for (let j = 0; j < cols; j++) {
        const cell = row.insertCell();
        cell.className = 'border border-gray-300 p-2';
        cell.contentEditable = 'true';
        cell.textContent = `Cell ${i + 1}-${j + 1}`;
      }
    }

    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(table);
      } else {
        editorRef.current.appendChild(table);
      }
    }
  };

  const handleCreateChart = (data: any[]) => {
    console.log('Creating chart with data:', data);
  };

  const handleSuggestionApply = (originalText: string, suggestion: string) => {
    if (!editorRef.current) return;
    
    const content = editorRef.current.innerHTML;
    const newContent = content.replace(originalText, suggestion);
    editorRef.current.innerHTML = newContent;
    setCurrentContent(newContent);
    
    toast({
      title: "Success",
      description: "Suggestion applied successfully",
    });
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
          <div className="space-y-4">
            <ImageManager
              onImageUpload={handleImageUpload}
              onImageLayerChange={handleImageLayerChange}
              onImageWrap={handleImageWrap}
            />
            <TableManager
              onCreateTable={handleCreateTable}
              onCreateChart={handleCreateChart}
            />
          </div>
          <div
            ref={editorRef}
            contentEditable
            className={cn(
              "min-h-[842px] w-full p-8 bg-white rounded-lg shadow-sm mt-4",
              "focus:outline-none focus:ring-2 focus:ring-editor-primary/20",
              "text-editor-text text-base leading-relaxed",
              "transition-all duration-200"
            )}
            style={{ direction: 'ltr', unicodeBidi: 'plaintext' }}
            suppressContentEditableWarning
            onInput={(e) => setCurrentContent(e.currentTarget.innerHTML)}
          />
        </div>
        
        {showComments && (
          <Comments onSuggestionApply={handleSuggestionApply} />
        )}
        
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