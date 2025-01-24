import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import EditorToolbar from './EditorToolbar';
import Comments from './Comments';
import ImageManager from './ImageManager';
import TableManager from './TableManager';
import ChartCreator from './ChartCreator';
import { cn } from '@/lib/utils';
import { toast } from "sonner";
import { DocumentVersion, generatePDF, exportToWord } from '../utils/documentUtils';
import { Canvas, Image as FabricImage } from 'fabric';
import { useConversation } from '@11labs/react';
import { createRoot } from 'react-dom/client';

export const TextEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [currentContent, setCurrentContent] = useState<string>('');
  const [showComments, setShowComments] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [documentId, setDocumentId] = useState<string>();

  const conversation = useConversation({
    overrides: {
      agent: {
        language: language,
      },
    },
  });

  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    canvasContainerRef.current.innerHTML = '';
    canvasContainerRef.current.appendChild(canvas);

    fabricCanvasRef.current = new Canvas(canvas, {
      width: canvas.width,
      height: canvas.height,
      backgroundColor: 'transparent',
    });

    console.log('Canvas initialized:', fabricCanvasRef.current);

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }
    };
  }, []);

  const handleFormat = async (command: string, value?: string) => {
    try {
      switch (command) {
        case 'exportPDF':
          await generatePDF(editorRef.current);
          toast.success("PDF exported successfully");
          break;
        
        case 'exportWord':
          if (editorRef.current) {
            exportToWord(editorRef.current.innerHTML);
            toast.success("Word document exported successfully");
          }
          break;

        case 'print':
          window.print();
          break;

        case 'toggleComments':
          setShowComments(!showComments);
          break;

        case 'startDictation':
          if (isRecording) {
            await conversation.endSession();
            setIsRecording(false);
            toast.success(`Dictation in ${language === 'en' ? 'English' : 'Spanish'} has ended`);
          } else {
            await conversation.startSession({ agentId: "default" });
            setIsRecording(true);
            toast.success(`Dictation in ${language === 'en' ? 'English' : 'Spanish'} has started`);
          }
          break;

        case 'setLanguage':
          setLanguage(value as 'en' | 'es');
          toast.success(`Dictation language set to ${value === 'en' ? 'English' : 'Spanish'}`);
          break;

        default:
          if (value) {
            document.execCommand(command, false, value);
          } else {
            document.execCommand(command, false);
          }
          editorRef.current?.focus();
      }
    } catch (error) {
      console.error('Error executing command:', command, error);
      toast.error("There was an error executing the command");
    }
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && fabricCanvasRef.current) {
        const imgUrl = e.target.result.toString();
        
        FabricImage.fromURL(imgUrl, {
          crossOrigin: 'anonymous'
        }).then(img => {
          if (fabricCanvasRef.current && img) {
            img.set({
              left: 100,
              top: 100,
              scaleX: 0.5,
              scaleY: 0.5,
              objectCaching: false,
            });
            fabricCanvasRef.current.add(img);
            if (fabricCanvasRef.current.getObjects) {
              const objects = fabricCanvasRef.current.getObjects();
              const index = objects.length - 1;
              fabricCanvasRef.current.setActiveObject(img);
              fabricCanvasRef.current.renderAll();
              console.log('Image added to canvas at index:', index);
            }
          }
        }).catch(error => {
          console.error('Error loading image:', error);
          toast.error('Failed to load image');
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageLayerChange = (direction: 'front' | 'back') => {
    const activeObject = fabricCanvasRef.current?.getActiveObject();
    if (!activeObject) {
      toast.error('No image selected');
      return;
    }

    const objects = fabricCanvasRef.current?.getObjects() || [];
    const currentIndex = objects.indexOf(activeObject);
    const newIndex = direction === 'front' ? objects.length - 1 : 0;

    if (currentIndex !== newIndex) {
      objects.splice(currentIndex, 1);
      objects.splice(newIndex, 0, activeObject);
      fabricCanvasRef.current?.renderAll();
      console.log(`Object moved to ${direction}`);
    }
  };

  const handleChartCreate = (chartElement: JSX.Element) => {
    if (!editorRef.current) return;
    
    const chartContainer = document.createElement('div');
    const root = createRoot(chartContainer);
    root.render(chartElement);
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(chartContainer);
    } else {
      editorRef.current.appendChild(chartContainer);
    }
  };

  return (
    <div className="min-h-screen bg-editor-background">
      <EditorToolbar 
        onFormat={handleFormat} 
        content={currentContent}
        documentId={documentId}
      />
      <div className="max-w-6xl mx-auto p-8 flex gap-4">
        <div className="flex-1">
          <div className="space-y-4">
            <ImageManager
              onImageUpload={handleImageUpload}
              onImageLayerChange={handleImageLayerChange}
              onImageWrap={(wrap) => {
                const activeObject = fabricCanvasRef.current?.getActiveObject();
                if (!activeObject) {
                  toast.error('No image selected');
                  return;
                }
                activeObject.set('wrap', wrap);
                fabricCanvasRef.current?.renderAll();
              }}
            />
            <TableManager
              onCreateTable={(rows, cols) => {
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
              }}
              onCreateChart={handleChartCreate}
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
          <div ref={canvasContainerRef} className="mt-4" />
        </div>
        
        {showComments && (
          <Comments onSuggestionApply={(originalText, suggestion) => {
            if (!editorRef.current) return;
            
            const content = editorRef.current.innerHTML;
            const newContent = content.replace(originalText, suggestion);
            editorRef.current.innerHTML = newContent;
            setCurrentContent(newContent);
            
            toast.success("Suggestion applied successfully");
          }} />
        )}
      </div>
    </div>
  );
};

export default TextEditor;