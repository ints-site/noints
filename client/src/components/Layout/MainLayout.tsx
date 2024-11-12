import React, { useState } from 'react';
import NoteEditor from '../Editor/NoteEditor';

const MainLayout: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className={`h-screen ${isDark ? 'dark' : ''}`}>
      <div className="w-full h-full bg-white dark:bg-gray-700">
        <NoteEditor onThemeChange={setIsDark} />
      </div>
    </div>
  );
};

export default MainLayout; 