import React, { useState } from 'react';
import NotebookList from './NotebookList';
import SectionList from './SectionList';
import NoteEditor from '../Editor/NoteEditor';
import ResizablePanel from './ResizablePanel';

const MainLayout: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className={`flex h-screen ${isDark ? 'dark' : ''}`}>
      {/* Left sidebar - Notebooks */}
      <ResizablePanel
        width={250}
        minWidth={200}
        maxWidth={400}
        className="bg-gray-800 text-white dark:bg-gray-900"
      >
        <NotebookList />
      </ResizablePanel>
      
      {/* Middle sidebar - Sections & Notes */}
      <ResizablePanel
        width={300}
        minWidth={200}
        maxWidth={500}
        className="bg-gray-100 dark:bg-gray-800 dark:text-gray-100"
      >
        <SectionList />
      </ResizablePanel>
      
      {/* Main content - Note Editor */}
      <div className="flex-1 bg-white dark:bg-gray-700">
        <NoteEditor onThemeChange={setIsDark} />
      </div>
    </div>
  );
};

export default MainLayout; 