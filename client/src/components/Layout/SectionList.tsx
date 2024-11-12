import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Section, Note } from '@shared/types';
import {
  addSection,
  addNote,
  setCurrentSection,
  setCurrentNote,
  updateSectionTitle,
  updateNoteTitle,
  deleteSection,
  deleteNote,
  reorderSections,
  reorderNotes
} from '../../store/notebookSlice';
import { RootState } from '../../store/types';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

const SortableItem = ({ id, children }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

const EditableItem: React.FC<{
  value: string;
  onSave: (newValue: string) => void;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
}> = ({ value, onSave, isEditing, setIsEditing }) => {
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    if (editValue.trim()) {
      onSave(editValue);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        className="px-2 py-1 w-full border rounded"
        autoFocus
      />
    );
  }

  return (
    <span onDoubleClick={() => setIsEditing(true)}>
      {value}
    </span>
  );
};

interface DragEvent extends DragEndEvent {
  source: { index: number };
  destination?: { index: number };
}

const ensureSections = (arr: any[]): Section[] => {
  return arr.map(item => ({
    id: item.id,
    title: item.title,
    notes: item.notes,
    notebookId: item.notebookId
  }));
};

const SectionList: React.FC = () => {
  const dispatch = useDispatch();
  const currentNotebook = useSelector((state: RootState) => state.notebooks.currentNotebook);
  const sections = useSelector((state: RootState) => 
    state.notebooks.items
      .find(nb => nb.id === currentNotebook?.id)?.sections || []
  );

  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    try {
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedSections = arrayMove(sections, oldIndex, newIndex);
        
        if (!currentNotebook) return;
        
        dispatch(reorderSections({
          notebookId: currentNotebook.id,
          sections: ensureSections(reorderedSections)
        }));
      }
    } catch (error) {
      console.error('Reordering error:', error);
    }
  };

  const handleAddSection = () => {
    if (!currentNotebook) {
      alert('Please select a notebook first');
      return;
    }
    
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      notes: [],
      notebookId: currentNotebook.id
    };

    dispatch(addSection({ notebookId: currentNotebook.id, section: newSection }));
  };

  const handleAddNote = (sectionId: string) => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: 'New Note',
      content: [{ type: 'paragraph', children: [{ text: '' }] }],
      sectionId,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    dispatch(addNote({ sectionId, note: newNote }));
  };

  const handleDeleteNote = (noteId: string, sectionId: string) => {
    dispatch(deleteNote({ 
      noteId,
      sectionId
    }));
  };

  if (!currentNotebook) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Please select a notebook first
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Sections</h2>
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleAddSection}
        >
          + New
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s: Section) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex-1 overflow-auto">
            {sections.map((section: Section) => (
              <SortableItem key={section.id} id={section.id}>
                <div className="border-b">
                  <div className="flex justify-between items-center p-3 hover:bg-gray-100">
                    <div className="flex-1">
                      <EditableItem
                        value={section.title}
                        onSave={(newTitle) => dispatch(updateSectionTitle({ sectionId: section.id, title: newTitle }))}
                        isEditing={editingSectionId === section.id}
                        setIsEditing={(value) => setEditingSectionId(value ? section.id : null)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="text-sm text-blue-500 hover:text-blue-600"
                        onClick={() => handleAddNote(section.id)}
                      >
                        + Note
                      </button>
                      <button
                        className="text-sm text-red-500 hover:text-red-600"
                        onClick={() => 
                          dispatch(deleteSection({ 
                            notebookId: currentNotebook.id, 
                            sectionId: section.id 
                          }))
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="pl-6">
                    {section.notes.map((note: Note) => (
                      <div
                        key={note.id}
                        className="flex justify-between items-center p-2 hover:bg-gray-100"
                        onClick={() => dispatch(setCurrentNote(note))}
                      >
                        <EditableItem
                          value={note.title}
                          onSave={(newTitle) => dispatch(updateNoteTitle({ noteId: note.id, title: newTitle }))}
                          isEditing={editingNoteId === note.id}
                          setIsEditing={(value) => setEditingNoteId(value ? note.id : null)}
                        />
                        <button
                          className="text-sm text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id, section.id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default SectionList;