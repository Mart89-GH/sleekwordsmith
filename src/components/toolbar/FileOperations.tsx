import React from 'react';
import { FileText, FileInput, Download, Printer, Share2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

interface FileOperationsProps {
  onFormat: (command: string, value?: string) => void;
}

const FileOperations: React.FC<FileOperationsProps> = ({ onFormat }) => {
  const { toast } = useToast();

  const handleAdvancedFeature = (feature: string) => {
    toast({
      title: "Coming Soon",
      description: `${feature} functionality will be available soon`,
    });
  };

  return (
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
  );
};

export default FileOperations;