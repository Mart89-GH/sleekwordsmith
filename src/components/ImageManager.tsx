import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Upload, MoveHorizontal, ArrowUpDown, ImageDown, ImageUp } from 'lucide-react';

interface ImageManagerProps {
  onImageUpload: (file: File) => void;
  onImageLayerChange: (direction: 'front' | 'back') => void;
  onImageWrap: (wrap: 'inline' | 'float') => void;
}

const ImageManager: React.FC<ImageManagerProps> = ({ 
  onImageUpload, 
  onImageLayerChange,
  onImageWrap 
}) => {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        onImageUpload(file);
      } else {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-4 h-4 mr-2" />
        Upload Image
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onImageLayerChange('front')}
      >
        <ImageUp className="w-4 h-4 mr-2" />
        Bring to Front
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onImageLayerChange('back')}
      >
        <ImageDown className="w-4 h-4 mr-2" />
        Send to Back
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onImageWrap('inline')}
      >
        <ArrowUpDown className="w-4 h-4 mr-2" />
        Wrap Text
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onImageWrap('float')}
      >
        <MoveHorizontal className="w-4 h-4 mr-2" />
        Float with Text
      </Button>
    </div>
  );
};

export default ImageManager;