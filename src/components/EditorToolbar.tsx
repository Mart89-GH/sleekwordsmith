import React from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Scissors, Clipboard, Copy, Type, TextQuote, List, ListOrdered,
  Heading1, Heading2, Heading3, Undo, Redo, Search, Mic,
  PaintBucket, Grid, MessageSquare, FileText, Image, Table,
  Link, IndentIncrease, IndentDecrease, Superscript, Subscript,
  ArrowUpDown, Strikethrough, Eraser, FileInput, Printer, Download,
  Share2, Settings, HelpCircle
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
  onFormat: (command: string, value?: string) => void;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ onFormat }) => {
  const { toast } = useToast();
  const fontSizes = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '72'];
  const fontFamilies = ['Arial', 'Times New Roman', 'Calibri', 'Helvetica', 'Georgia', 'Verdana', 'Tahoma'];
  const tableSizes = ['2x2', '3x3', '4x4', '5x5'];

  const handleAdvancedFeature = (feature: string) => {
    console.log(`Advanced feature triggered: ${feature}`);
    toast({
      title: "Coming Soon",
      description: `The ${feature} feature will be implemented soon.`,
    });
  };

  return (
    <div className="bg-white border-b border-gray-200 p-2 space-y-2 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-2">
        {/* File Operations */}
        <div className="flex flex-col items-center gap-1 px-2 border-r border-gray-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <FileText className="w-4 h-4 mr-1" />
                File
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuItem onClick={() => handleAdvancedFeature("New Document")}>
                <FileInput className="w-4 h-4 mr-2" />
                New
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFormat('exportPDF')}>
                <Download className="w-4 h-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFormat('exportWord')}>
                <FileText className="w-4 h-4 mr-2" />
                Export as Word
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAdvancedFeature("Print")}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAdvancedFeature("Share")}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Clipboard Section */}
        <div className="flex flex-col items-center gap-1 px-2 border-r border-gray-200">
          <div className="flex gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Clipboard className="w-4 h-4 mr-1" />
                  Clipboard
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onFormat('cut')}>
                  <Scissors className="w-4 h-4 mr-2" />
                  Cut
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFormat('copy')}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFormat('paste')}>
                  <Clipboard className="w-4 h-4 mr-2" />
                  Paste
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
        </div>

        {/* Text Formatting Section */}
        <div className="flex flex-col items-center gap-1 px-2 border-r border-gray-200">
          <div className="flex gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Type className="w-4 h-4 mr-1" />
                  Format
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onFormat('bold')}>
                  <Bold className="w-4 h-4 mr-2" />
                  Bold
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFormat('italic')}>
                  <Italic className="w-4 h-4 mr-2" />
                  Italic
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFormat('underline')}>
                  <Underline className="w-4 h-4 mr-2" />
                  Underline
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFormat('strikethrough')}>
                  <Strikethrough className="w-4 h-4 mr-2" />
                  Strikethrough
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFormat('superscript')}>
                  <Superscript className="w-4 h-4 mr-2" />
                  Superscript
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFormat('subscript')}>
                  <Subscript className="w-4 h-4 mr-2" />
                  Subscript
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Paragraph Section */}
        <div className="flex flex-col items-center gap-1 px-2 border-r border-gray-200">
          <div className="flex gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <AlignLeft className="w-4 h-4 mr-1" />
                  Paragraph
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onFormat('justifyLeft')}>
                  <AlignLeft className="w-4 h-4 mr-2" />
                  Align Left
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFormat('justifyCenter')}>
                  <AlignCenter className="w-4 h-4 mr-2" />
                  Center
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFormat('justifyRight')}>
                  <AlignRight className="w-4 h-4 mr-2" />
                  Align Right
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFormat('justifyFull')}>
                  <AlignJustify className="w-4 h-4 mr-2" />
                  Justify
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFormat('indent')}>
                  <IndentIncrease className="w-4 h-4 mr-2" />
                  Increase Indent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFormat('outdent')}>
                  <IndentDecrease className="w-4 h-4 mr-2" />
                  Decrease Indent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFormat('lineHeight')}>
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Line Height
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Insert Section */}
        <div className="flex flex-col items-center gap-1 px-2 border-r border-gray-200">
          <div className="flex gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Grid className="w-4 h-4 mr-1" />
                  Insert
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Select onValueChange={(value) => onFormat('insertTable', value)}>
                    <SelectTrigger>
                      <Table className="w-4 h-4 mr-2" />
                      Insert Table
                    </SelectTrigger>
                    <SelectContent>
                      {tableSizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFormat('insertImage')}>
                  <Image className="w-4 h-4 mr-2" />
                  Insert Image
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tools Section */}
        <div className="flex flex-col items-center gap-1 px-2">
          <div className="flex gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4 mr-1" />
                  Tools
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onFormat('toggleFindReplace')}>
                  <Search className="w-4 h-4 mr-2" />
                  Find & Replace
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFormat('startDictation')}>
                  <Mic className="w-4 h-4 mr-2" />
                  Start Dictation
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFormat('stopDictation')}>
                  <Mic className="w-4 h-4 mr-2" />
                  Stop Dictation
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFormat('undo')}>
                  <Undo className="w-4 h-4 mr-2" />
                  Undo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFormat('redo')}>
                  <Redo className="w-4 h-4 mr-2" />
                  Redo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFormat('find')}>
                  <Search className="w-4 h-4 mr-2" />
                  Find
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAdvancedFeature("Clear Formatting")}>
                  <Eraser className="w-4 h-4 mr-2" />
                  Clear Formatting
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAdvancedFeature("Help")}>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );

};

export default EditorToolbar;
