import React from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  Scissors, Clipboard, Copy, Type, TextQuote, List, ListOrdered,
  Heading1, Heading2, Heading3, Undo, Redo, Search, Mic,
  PaintBucket, Grid, MessageSquare
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
  onFormat: (command: string, value?: string) => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ onFormat }) => {
  const fontSizes = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '72'];
  const fontFamilies = ['Arial', 'Times New Roman', 'Calibri', 'Helvetica', 'Georgia'];

  return (
    <div className="bg-white border-b border-gray-200 p-2 space-y-2 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Clipboard Section */}
        <div className="flex flex-col items-center gap-1 px-2 border-r border-gray-200">
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => onFormat('cut')}>
              <Scissors className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onFormat('copy')}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onFormat('paste')}>
              <Clipboard className="w-4 h-4" />
            </Button>
          </div>
          <span className="text-xs text-gray-600">Clipboard</span>
        </div>

        {/* Font Section */}
        <div className="flex flex-col items-center gap-1 px-2 border-r border-gray-200">
          <div className="flex items-center gap-2">
            <Select onValueChange={(value) => onFormat('fontName', value)}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue placeholder="Font" />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((font) => (
                  <SelectItem key={font} value={font}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => onFormat('fontSize', value)}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                {fontSizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="text-xs text-gray-600">Font</span>
        </div>

        {/* Text Formatting Section */}
        <div className="flex flex-col items-center gap-1 px-2 border-r border-gray-200">
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => onFormat('bold')}>
              <Bold className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onFormat('italic')}>
              <Italic className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onFormat('underline')}>
              <Underline className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onFormat('foreColor')}>
              <Type className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onFormat('hiliteColor')}>
              <PaintBucket className="w-4 h-4" />
            </Button>
          </div>
          <span className="text-xs text-gray-600">Format</span>
        </div>

        {/* Paragraph Section */}
        <div className="flex flex-col items-center gap-1 px-2 border-r border-gray-200">
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => onFormat('justifyLeft')}>
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onFormat('justifyCenter')}>
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onFormat('justifyRight')}>
              <AlignRight className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onFormat('insertUnorderedList')}>
              <List className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onFormat('insertOrderedList')}>
              <ListOrdered className="w-4 h-4" />
            </Button>
          </div>
          <span className="text-xs text-gray-600">Paragraph</span>
        </div>

        {/* Styles Section */}
        <div className="flex flex-col items-center gap-1 px-2 border-r border-gray-200">
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => onFormat('formatBlock', 'h1')}>
              <Heading1 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onFormat('formatBlock', 'h2')}>
              <Heading2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onFormat('formatBlock', 'h3')}>
              <Heading3 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onFormat('formatBlock', 'blockquote')}>
              <TextQuote className="w-4 h-4" />
            </Button>
          </div>
          <span className="text-xs text-gray-600">Styles</span>
        </div>

        {/* Tools Section */}
        <div className="flex flex-col items-center gap-1 px-2">
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => onFormat('undo')}>
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onFormat('redo')}>
              <Redo className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onFormat('find')}>
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onFormat('startDictation')}>
              <Mic className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onFormat('addComment')}>
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onFormat('insertComponent')}>
              <Grid className="w-4 h-4" />
            </Button>
          </div>
          <span className="text-xs text-gray-600">Tools</span>
        </div>
      </div>
    </div>
  );
};

export default EditorToolbar;