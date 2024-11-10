import React from 'react';
import NotebookList from './NotebookList';
import SectionList from './SectionList';
import NoteEditor from '../Editor/NoteEditor';
import ResizablePanel from './ResizablePanel';

const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left sidebar - Notebooks */}
      <ResizablePanel
        width={250}
        minWidth={200}
        maxWidth={400}
        className="bg-gray-800 text-white"
      >
        <NotebookList />
      </ResizablePanel>
      
      {/* Middle sidebar - Sections & Notes */}
      <ResizablePanel
        width={300}
        minWidth={200}
        maxWidth={500}
        className="bg-gray-200"
      >
        <SectionList />
      </ResizablePanel>
      
      {/* Main content - Note Editor */}
      <div className="flex-1 bg-white">
        <NoteEditor />
      </div>
    </div>
  );
};

export default MainLayout; 