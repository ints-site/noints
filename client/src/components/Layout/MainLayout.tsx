import React from 'react';
import NotebookList from './NotebookList';
import SectionList from './SectionList';
import NoteEditor from '../Editor/NoteEditor';

const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left sidebar - Notebooks */}
      <div className="w-64 bg-gray-800 text-white">
        <NotebookList />
      </div>
      
      {/* Middle sidebar - Sections & Notes */}
      <div className="w-72 bg-gray-200">
        <SectionList />
      </div>
      
      {/* Main content - Note Editor */}
      <div className="flex-1 bg-white">
        <NoteEditor />
      </div>
    </div>
  );
};

export default MainLayout; 