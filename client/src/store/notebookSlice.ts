import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Descendant } from 'slate';
import { Notebook, Section, Note } from '@shared/types';

interface NotebookState {
  items: Notebook[];
  currentNotebook: Notebook | null;
  currentSection: Section | null;
  currentNote: Note | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: NotebookState = {
  items: [],
  currentNotebook: null,
  currentSection: null,
  currentNote: null,
  isLoading: false,
  error: null
};

const notebookSlice = createSlice({
  name: 'notebooks',
  initialState,
  reducers: {
    setNotebooks: (state, action: PayloadAction<Notebook[]>) => {
      state.items = action.payload;
    },
    addNotebook: {
      reducer: (state, action: PayloadAction<Notebook>) => {
        if (!action.payload.id) {
          state.error = 'Invalid notebook: missing ID';
          return;
        }
        state.items.push(action.payload);
      },
      prepare: (notebook: Partial<Notebook>) => {
        const newNotebook: Notebook = {
          id: notebook.id || `notebook-${Date.now()}`,
          title: notebook.title || 'Untitled Notebook',
          sections: notebook.sections || [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        return { payload: newNotebook };
      }
    },
    setCurrentNotebook: (state, action: PayloadAction<Notebook>) => {
      state.currentNotebook = action.payload;
    },
    setCurrentSection: (state, action: PayloadAction<Section>) => {
      state.currentSection = action.payload;
    },
    setCurrentNote: (state, action: PayloadAction<Note>) => {
      state.currentNote = action.payload;
    },
    updateNoteContent: (
      state,
      action: PayloadAction<{ id: string; content: Descendant[] }>
    ) => {
      const { id, content } = action.payload;
      state.items.forEach(notebook => {
        notebook.sections.forEach((section: Section) => {
          const note = section.notes.find((n: Note) => n.id === id);
          if (note) {
            note.content = content;
            note.updatedAt = new Date();
          }
        });
      });
    },
    addSection: (state, action: PayloadAction<{ notebookId: string; section: Section }>) => {
      const { notebookId, section } = action.payload;
      const notebook = state.items.find(nb => nb.id === notebookId);
      if (notebook) {
        notebook.sections.push(section);
      }
    },
    addNote: (state, action: PayloadAction<{ sectionId: string; note: Note }>) => {
      const { sectionId, note } = action.payload;
      state.items.forEach(notebook => {
        const section = notebook.sections.find(s => s.id === sectionId);
        if (section) {
          section.notes.push(note);
        }
      });
    },
    updateSectionTitle: (state, action: PayloadAction<{ sectionId: string; title: string }>) => {
      const { sectionId, title } = action.payload;
      state.items.forEach(notebook => {
        const section = notebook.sections.find(s => s.id === sectionId);
        if (section) {
          section.title = title;
        }
      });
    },
    updateNoteTitle: (state, action: PayloadAction<{ noteId: string; title: string }>) => {
      const { noteId, title } = action.payload;
      state.items.forEach(notebook => {
        notebook.sections.forEach((section: Section) => {
          const note = section.notes.find((n: Note) => n.id === noteId);
          if (note) {
            note.title = title;
          }
        });
      });
    },
    deleteSection: (state, action: PayloadAction<{ notebookId: string; sectionId: string }>) => {
      const { notebookId, sectionId } = action.payload;
      const notebook = state.items.find(nb => nb.id === notebookId);
      if (notebook) {
        notebook.sections = notebook.sections.filter(s => s.id !== sectionId);
      }
      if (state.currentSection?.id === sectionId) {
        state.currentSection = null;
        state.currentNote = null;
      }
    },
    deleteNote: (state, action: PayloadAction<{ noteId: string }>) => {
      const { noteId } = action.payload;
      state.items.forEach(notebook => {
        notebook.sections.forEach((section: Section) => {
          section.notes = section.notes.filter(n => n.id !== noteId);
        });
      });
      if (state.currentNote?.id === noteId) {
        state.currentNote = null;
      }
    },
    reorderSections: (state, action: PayloadAction<{
      notebookId: string;
      startIndex: number;
      endIndex: number;
    }>) => {
      const { notebookId, startIndex, endIndex } = action.payload;
      const notebook = state.items.find(nb => nb.id === notebookId);
      if (notebook) {
        const [removed] = notebook.sections.splice(startIndex, 1);
        notebook.sections.splice(endIndex, 0, removed);
      }
    },
    reorderNotes: (state, action: PayloadAction<{
      sectionId: string;
      startIndex: number;
      endIndex: number;
    }>) => {
      const { sectionId, startIndex, endIndex } = action.payload;
      state.items.forEach(notebook => {
        const section = notebook.sections.find(s => s.id === sectionId);
        if (section) {
          const [removed] = section.notes.splice(startIndex, 1);
          section.notes.splice(endIndex, 0, removed);
        }
      });
    },
  }
});

export const { 
  setNotebooks, 
  addNotebook,
  setCurrentNotebook,
  setCurrentSection,
  setCurrentNote,
  updateNoteContent,
  addSection,
  addNote,
  updateSectionTitle,
  updateNoteTitle,
  deleteSection,
  deleteNote,
  reorderSections,
  reorderNotes
} = notebookSlice.actions;

export default notebookSlice.reducer; 