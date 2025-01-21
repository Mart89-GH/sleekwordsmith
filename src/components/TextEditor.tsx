import React, { useState, useRef, useEffect } from 'react';
import FormatToolbar from './FormatToolbar';
import { cn } from '@/lib/utils';

export const TextEditor = () => {
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const editorRef = useRef<HTMLDivElement>(null);

  const handleSelectionChange = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setToolbarPosition({
        top: rect.top - 40,
        left: rect.left + (rect.width / 2),
      });
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
    }
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const executeCommand = (command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-editor-background p-8">
      <div className="max-w-4xl mx-auto">
        {showToolbar && (
          <FormatToolbar
            position={toolbarPosition}
            onFormat={executeCommand}
          />
        )}
        <div
          ref={editorRef}
          contentEditable
          className={cn(
            "min-h-[500px] p-8 bg-white rounded-lg shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-editor-primary/20",
            "text-editor-text text-lg leading-relaxed",
            "transition-all duration-200"
          )}
          suppressContentEditableWarning
        />
      </div>
    </div>
  );
};

export default TextEditor;