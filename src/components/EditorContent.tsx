import React, { forwardRef } from 'react';

interface EditorContentProps {
  content: string;
  onInput: (e: React.FormEvent<HTMLDivElement>) => void;
}

const EditorContent = forwardRef<HTMLDivElement, EditorContentProps>(
  ({ content, onInput }, ref) => {
    return (
      <div
        ref={ref}
        contentEditable
        className="min-h-[1123px] w-[794px] mx-auto p-8 bg-white rounded-lg shadow-sm
                 focus:outline-none focus:ring-2 focus:ring-editor-primary/20
                 text-editor-text text-base leading-relaxed
                 transition-all duration-200"
        suppressContentEditableWarning
        onInput={onInput}
        style={{ 
          direction: 'ltr',
          unicodeBidi: 'plaintext'
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
);

EditorContent.displayName = 'EditorContent';

export default EditorContent;