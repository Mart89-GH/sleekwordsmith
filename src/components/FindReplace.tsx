import React, { useState } from 'react';
import { Search, Replace } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface FindReplaceProps {
  onFind: (text: string) => void;
  onReplace: (find: string, replace: string) => void;
}

const FindReplace: React.FC<FindReplaceProps> = ({ onFind, onReplace }) => {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const { toast } = useToast();

  const handleFind = () => {
    if (!findText) {
      toast({
        title: "Error",
        description: "Please enter text to find",
        variant: "destructive",
      });
      return;
    }
    onFind(findText);
  };

  const handleReplace = () => {
    if (!findText) {
      toast({
        title: "Error",
        description: "Please enter text to find",
        variant: "destructive",
      });
      return;
    }
    onReplace(findText, replaceText);
  };

  return (
    <div className="flex items-center gap-2 p-2">
      <Input
        type="text"
        placeholder="Find..."
        value={findText}
        onChange={(e) => setFindText(e.target.value)}
        className="w-32"
      />
      <Input
        type="text"
        placeholder="Replace..."
        value={replaceText}
        onChange={(e) => setReplaceText(e.target.value)}
        className="w-32"
      />
      <Button variant="ghost" size="sm" onClick={handleFind}>
        <Search className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={handleReplace}>
        <Replace className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default FindReplace;