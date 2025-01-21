import React, { useState, useRef, useEffect } from 'react';
import EditorToolbar from './EditorToolbar';
import { cn } from '@/lib/utils';
import { useToast } from "@/components/ui/use-toast";

export const TextEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleFormat = (command: string, value?: string) => {
    try {
      if (command === 'find') {
        // Implement find functionality
        toast({
          title: "Find",
          description: "Find functionality coming soon",
        });
        return;
      }

      if (command === 'startDictation') {
        // Implement dictation
        toast({
          title: "Dictation",
          description: "Speech-to-text functionality coming soon",
        });
        return;
      }

      if (command === 'addComment') {
        // Implement comments
        toast({
          title: "Comments",
          description: "Comments functionality coming soon",
        });
        return;
      }

      if (command === 'insertComponent') {
        // Implement component insertion
        toast({
          title: "Insert Component",
          description: "Component insertion coming soon",
        });
        return;
      }

      if (['cut', 'copy', 'paste'].includes(command)) {
        if (command === 'cut') {
          document.execCommand('cut');
        } else if (command === 'copy') {
          document.execCommand('copy');
        } else {
          navigator.clipboard.readText().then(text => {
            document.execCommand('insertText', false, text);
          });
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

  return (
    <div className="min-h-screen bg-editor-background">
      <EditorToolbar onFormat={handleFormat} />
      <div className="max-w-6xl mx-auto p-8">
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
        />
      </div>
    </div>
  );
};

export default TextEditor;