import React from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormatToolbarProps {
  position: { top: number; left: number };
  onFormat: (command: string) => void;
}

const FormatToolbar: React.FC<FormatToolbarProps> = ({ position, onFormat }) => {
  const tools = [
    { icon: Bold, command: 'bold' },
    { icon: Italic, command: 'italic' },
    { icon: Underline, command: 'underline' },
    { icon: AlignLeft, command: 'justifyLeft' },
    { icon: AlignCenter, command: 'justifyCenter' },
    { icon: AlignRight, command: 'justifyRight' },
  ];

  return (
    <div
      className={cn(
        "fixed z-50 -translate-x-1/2 animate-fade-in",
        "bg-editor-toolbar backdrop-blur-sm rounded-lg shadow-lg",
        "border border-gray-200/50 p-1.5 flex gap-1"
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {tools.map(({ icon: Icon, command }) => (
        <button
          key={command}
          onClick={() => onFormat(command)}
          className={cn(
            "p-1.5 rounded hover:bg-gray-100/80",
            "text-editor-text transition-colors duration-200",
            "hover:text-editor-hover"
          )}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
};

export default FormatToolbar;