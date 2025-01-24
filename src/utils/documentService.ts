import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Document {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const saveDocument = async (content: string, title: string = 'Untitled Document') => {
  try {
    const { data: document, error } = await supabase
      .from('documents')
      .insert([
        { content, title }
      ])
      .select()
      .single();

    if (error) throw error;
    
    console.log('Document saved:', document);
    return document;
  } catch (error) {
    console.error('Error saving document:', error);
    toast.error('Failed to save document');
    throw error;
  }
};

export const saveVersion = async (documentId: string, content: string) => {
  try {
    const { data: version, error } = await supabase
      .from('document_versions')
      .insert([
        { document_id: documentId, content }
      ])
      .select()
      .single();

    if (error) throw error;
    
    console.log('Version saved:', version);
    return version;
  } catch (error) {
    console.error('Error saving version:', error);
    toast.error('Failed to save version');
    throw error;
  }
};

export const uploadFile = async (file: File, documentId: string) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${documentId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('document_files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: fileRecord, error: dbError } = await supabase
      .from('files')
      .insert([
        {
          document_id: documentId,
          filename: file.name,
          file_path: filePath,
          file_type: file.type
        }
      ])
      .select()
      .single();

    if (dbError) throw dbError;

    console.log('File uploaded:', fileRecord);
    return fileRecord;
  } catch (error) {
    console.error('Error uploading file:', error);
    toast.error('Failed to upload file');
    throw error;
  }
};