import React from 'react';

const SectionList: React.FC = () => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Sections</h2>
        <button className="text-sm bg-blue-500 px-2 py-1 rounded text-white">
          + New
        </button>
      </div>
      <div className="space-y-2">
        {/* Sections will be listed here */}
      </div>
    </div>
  );
};

export default SectionList; 