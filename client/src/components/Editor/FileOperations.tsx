import React from 'react';
import { Node } from 'slate';
import { useDispatch } from 'react-redux';
import { addNote } from '../../store/notebookSlice';
import { CustomEditor, BlockFormatType } from './types';

interface FileOperationsProps {
  editor: CustomEditor;
  currentSectionId?: string;
}

export const FileOperations: React.FC<FileOperationsProps> = ({ 
  editor, 
  currentSectionId 
}) => {
  const dispatch = useDispatch();

  const handleNewFile = () => {
    if (!currentSectionId) return;
    
    dispatch(addNote({
      sectionId: currentSectionId,
      note: {
        id: Date.now().toString(),
        title: 'New Note',
        content: [{ type: 'paragraph', children: [{ text: '' }] }],
        sectionId: currentSectionId,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }));
  };

  const handleOpenFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        // 将文本内容转换为 Slate 格式
        const content = text.split('\n').map(line => ({
          type: 'paragraph' as BlockFormatType,
          children: [{ text: line }]
        }));
        
        if (currentSectionId) {
          dispatch(addNote({
            sectionId: currentSectionId,
            note: {
              id: Date.now().toString(),
              title: file.name,
              content,
              sectionId: currentSectionId,
              tags: [],
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }));
        }
      }
    };
    reader.readAsText(file);
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