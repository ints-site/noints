import React from 'react';

const Toolbar: React.FC = () => {
  return (
    <div className="border-b p-2 flex gap-2">
      <button className="p-1 hover:bg-gray-100 rounded">
        <span className="material-icons">format_bold</span>
      </button>
      <button className="p-1 hover:bg-gray-100 rounded">
        <span className="material-icons">format_italic</span>
      </button>
      <button className="p-1 hover:bg-gray-100 rounded">
        <span className="material-icons">format_underlined</span>
      </button>
      <div className="w-px bg-gray-300 mx-2"></div>
      <button className="p-1 hover:bg-gray-100 rounded">
        <span className="material-icons">format_list_bulleted</span>
      </button>
      <button className="p-1 hover:bg-gray-100 rounded">
        <span className="material-icons">format_list_numbered</span>
      </button>
    </div>
  );
};

export default Toolbar; 