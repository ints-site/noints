import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Notebook } from '@shared/types';
import { addNotebook } from '../../store/notebookSlice';

interface RootState {
  notebooks: {
    items: Notebook[];
  };
}

const NotebookList: React.FC = () => {
  const dispatch = useDispatch();
  const notebooks = useSelector((state: RootState) => state.notebooks.items);

  const handleAddNotebook = () => {
    const newNotebook: Notebook = {
      id: `notebook-${Date.now()}`,
      title: 'New Notebook',
      sections: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    dispatch(addNotebook(newNotebook));
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Notebooks</h2>
        <button 
          className="text-sm bg-blue-500 px-2 py-1 rounded text-white"
          onClick={handleAddNotebook}
        >
          + New
        </button>
      </div>
      
      <div className="space-y-2">
        {notebooks && notebooks.length > 0 ? (
          notebooks.map((notebook: Notebook) => (
            <div 
              key={notebook.id}
              className="flex items-center p-2 hover:bg-gray-700 rounded cursor-pointer"
            >
              <span className="material-icons mr-2">notebook</span>
              {notebook.title}
            </div>
          ))
        ) : (
          <div className="text-gray-400 text-center py-4">
            No notebooks yet. Create one!
          </div>
        )}
      </div>
    </div>
  );
};

export default NotebookList; 