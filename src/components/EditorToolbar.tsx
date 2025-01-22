import React from 'react';
import FileOperations from './toolbar/FileOperations';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Scissors, Clipboard, Copy, Type, Grid, Settings
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EditorToolbarProps {
  onFormat: (command: string, value?: string) => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ onFormat }) => {
  const fontSizes = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '72'];
  const fontFamilies = ['Arial', 'Times New Roman', 'Calibri', 'Helvetica', 'Georgia', 'Verdana', 'Tahoma'];

  return (
    <div className="bg-white border-b border-gray-200 p-2 space-y-2 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-2">
        <FileOperations onFormat={onFormat} />
        
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
        </div>

        {/* Basic Formatting */}
        <div className="flex gap-1 px-2 border-r border-gray-200">
          <Button variant="ghost" size="sm" onClick={() => onFormat('bold')}>
            <Bold className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onFormat('italic')}>
            <Italic className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onFormat('underline')}>
            <Underline className="w-4 h-4" />
          </Button>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 px-2 border-r border-gray-200">
          <Button variant="ghost" size="sm" onClick={() => onFormat('justifyLeft')}>
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onFormat('justifyCenter')}>
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onFormat('justifyRight')}>
            <AlignRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Clipboard */}
        <div className="flex gap-1 px-2 border-r border-gray-200">
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

        {/* Additional Tools */}
        <div className="flex gap-1 px-2">
          <Button variant="ghost" size="sm" onClick={() => onFormat('toggleComments')}>
            <Grid className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onFormat('settings')}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditorToolbar;