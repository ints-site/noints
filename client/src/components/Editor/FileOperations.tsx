import React from 'react';
import { Node } from 'slate';
import { useDispatch } from 'react-redux';
import { addNote } from '../../store/notebookSlice';
import { 
  CustomEditor, 
  BlockFormatType, 
  CustomElement,
  ParagraphElement 
} from './types';
import { z } from 'zod';
import DOMPurify from 'dompurify';

interface FileOperationsProps {
  editor: CustomEditor;
  currentSectionId?: string;
}

// Add validation schema
const noteContentSchema = z.array(z.object({
  type: z.string(),
  children: z.array(z.object({
    text: z.string()
  }))
}));

export const FileOperations: React.FC<FileOperationsProps> = ({ 
  editor, 
  currentSectionId 
}) => {
  const dispatch = useDispatch();

  const handleNewFile = () => {
    if (!currentSectionId) {
      console.error('No section selected');
      return;
    }
    
    try {
      const initialContent: ParagraphElement = {
        type: 'paragraph',
        children: [{ text: '' }]
      };

      dispatch(addNote({
        sectionId: currentSectionId,
        note: {
          id: crypto.randomUUID(),
          title: 'New Note',
          content: [initialContent],
          sectionId: currentSectionId,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }));
    } catch (error) {
      console.error('Error creating new file:', error);
    }
  };

  const handleOpenFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !currentSectionId) return;

      if (file.size > 5 * 1024 * 1024) {
        alert('File too large (max 5MB)');
        return;
      }

      if (!['text/plain', 'text/markdown'].includes(file.type)) {
        alert('Invalid file type (only .txt and .md supported)');
        return;
      }

      const text = await file.text();
      const sanitizedText = DOMPurify.sanitize(text);
      const content = sanitizedText.split('\n').map(line => ({
        type: 'paragraph',
        children: [{ text: line }]
      }));

      dispatch(addNote({
        sectionId: currentSectionId,
        note: {
          id: crypto.randomUUID(),
          title: DOMPurify.sanitize(file.name),
          content,
          sectionId: currentSectionId,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }));
    } catch (error) {
      console.error('Error opening file:', error);
      alert('Failed to open file');
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleNewFile}
        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        New File
      </button>
      <label className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer">
        Open File
        <input
          type="file"
          accept=".txt,.md"
          onChange={handleOpenFile}
          className="hidden"
        />
      </label>
    </div>
  );
}; 