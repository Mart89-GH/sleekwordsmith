import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import EditorToolbar from './EditorToolbar';
import Comments from './Comments';
import VersionControl from './VersionControl';
import ImageManager from './ImageManager';
import TableManager from './TableManager';
import ChartCreator from './ChartCreator';
import { cn } from '@/lib/utils';
import { toast } from "sonner";
import { DocumentVersion, generatePDF, exportToWord } from '../utils/documentUtils';
import { Canvas, Image as FabricImage } from 'fabric';
import { useConversation } from '@11labs/react';
import { createRoot } from 'react-dom/client';
import { supabase } from '@/integrations/supabase/client';

export const TextEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [currentContent, setCurrentContent] = useState<string>('');
  const [showComments, setShowComments] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
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

        case 'toggleVersions':
          setShowVersions(!showVersions);
          break;

        case 'saveVersion':
          if (!documentId) {
            toast.error("Please save the document first");
            return;
          }
          const versionName = window.prompt('Enter version name (optional):');
          const versionDescription = window.prompt('Enter version description (optional):');
          const isMajor = window.confirm('Is this a major version?');
          
          try {
            const { error } = await supabase
              .from('document_versions')
              .insert([{
                document_id: documentId,
                content: currentContent,
                version_name: versionName,
                version_description: versionDescription,
                is_major_version: isMajor,
              }]);

            if (error) throw error;
            toast.success("Version saved successfully");
          } catch (error) {
            console.error('Error saving version:', error);
            toast.error("Failed to save version");
          }
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
            fabricCanvasRef.current.setActiveObject(img);
            fabricCanvasRef.current.renderAll();
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
    if (!activeObject || !fabricCanvasRef.current) {
      toast.error('No image selected');
      return;
    }

    const objects = fabricCanvasRef.current.getObjects();
    const currentIndex = objects.indexOf(activeObject);
    const newIndex = direction === 'front' ? objects.length - 1 : 0;

    if (currentIndex !== newIndex) {
      objects.splice(currentIndex, 1);
      objects.splice(newIndex, 0, activeObject);
      fabricCanvasRef.current.renderAll();
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
        onImageUpload={handleImageUpload}
        onImageLayerChange={handleImageLayerChange}
        onChartCreate={handleChartCreate}
      />
      <div className="max-w-6xl mx-auto p-8 flex gap-4">
        <div className="flex-1">
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
        
        <div className="space-y-4">
          {showVersions && (
            <VersionControl
              documentId={documentId}
              onVersionSelect={(content) => {
                if (editorRef.current) {
                  editorRef.current.innerHTML = content;
                  setCurrentContent(content);
                }
              }}
            />
          )}
          
          {showComments && (
            <Comments
              documentId={documentId}
              onSuggestionApply={(originalText, suggestion) => {
                if (!editorRef.current) return;
                
                const content = editorRef.current.innerHTML;
                const newContent = content.replace(originalText, suggestion);
                editorRef.current.innerHTML = newContent;
                setCurrentContent(newContent);
                
                toast.success("Suggestion applied successfully");
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TextEditor;