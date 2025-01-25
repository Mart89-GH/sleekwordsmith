import React from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GitBranch, GitCommit } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';

interface Version {
  id: string;
  version_number: number;
  version_name: string | null;
  version_description: string | null;
  is_major_version: boolean;
  created_at: string;
}

interface VersionControlProps {
  documentId?: string;
  onVersionSelect: (content: string) => void;
}

const VersionControl: React.FC<VersionControlProps> = ({ documentId, onVersionSelect }) => {
  const [versions, setVersions] = React.useState<Version[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (documentId) {
      loadVersions();
    }
  }, [documentId]);

  const loadVersions = async () => {
    try {
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error('Error loading versions:', error);
      toast.error('Failed to load versions');
    } finally {
      setLoading(false);
    }
  };

  const handleVersionSelect = async (versionId: string) => {
    try {
      const { data, error } = await supabase
        .from('document_versions')
        .select('content')
        .eq('id', versionId)
        .single();

      if (error) throw error;
      if (data) {
        onVersionSelect(data.content);
        toast.success('Version loaded successfully');
      }
    } catch (error) {
      console.error('Error loading version:', error);
      toast.error('Failed to load version');
    }
  };

  return (
    <div className="w-64 bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="w-4 h-4" />
        <h3 className="font-semibold">Version History</h3>
      </div>
      
      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {versions.map((version) => (
            <div
              key={version.id}
              className="p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
              onClick={() => handleVersionSelect(version.id)}
            >
              <div className="flex items-center gap-2">
                <GitCommit className="w-4 h-4" />
                <span className="font-medium">
                  {version.version_name || `Version ${version.version_number}`}
                </span>
              </div>
              {version.version_description && (
                <p className="text-sm text-gray-500 mt-1">
                  {version.version_description}
                </p>
              )}
              <div className="text-xs text-gray-400 mt-1">
                {new Date(version.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default VersionControl;