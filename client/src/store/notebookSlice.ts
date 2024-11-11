import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notebook, Section, Note } from '../types';
import { Descendant } from 'slate';

interface NotebookState {
  items: Notebook[];
  currentNotebook: Notebook | null;
  currentSection: Section | null;
  currentNote: Note | null;
}

const initialState: NotebookState = {
  items: [],
  currentNotebook: null,
  currentSection: null,
  currentNote: null,
};

const notebookSlice = createSlice({
  name: 'notebooks',
  initialState,
  reducers: {
    addNotebook: (state, action: PayloadAction<Notebook>) => {
      state.items.push(action.payload);
    },
    addSection: (state, action: PayloadAction<{ notebookId: string; section: Section }>) => {
      const { notebookId, section } = action.payload;
      const notebook = state.items.find(nb => nb.id === notebookId);
      if (notebook) {
        notebook.sections.push(section);
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
      state.items.forEach((notebook: Notebook) => {
        notebook.sections.forEach((section: Section) => {
          const note = section.notes.find((n: Note) => n.id === id);
          if (note) {
            note.content = content;
            note.updatedAt = new Date();
          }
        });
      });
    },
    updateSectionTitle: (
      state,
      action: PayloadAction<{ sectionId: string; title: string }>
    ) => {
      const { sectionId, title } = action.payload;
      state.items.forEach((notebook: Notebook) => {
        const section = notebook.sections.find((s: Section) => s.id === sectionId);
        if (section) {
          section.title = title;
        }
      });
    },
    updateNoteTitle: (
      state,
      action: PayloadAction<{ noteId: string; title: string }>
    ) => {
      const { noteId, title } = action.payload;
      state.items.forEach((notebook: Notebook) => {
        notebook.sections.forEach((section: Section) => {
          const note = section.notes.find((n: Note) => n.id === noteId);
          if (note) {
            note.title = title;
          }
        });
      });
    },
    deleteSection: (
      state,
      action: PayloadAction<{ notebookId: string; sectionId: string }>
    ) => {
      const { notebookId, sectionId } = action.payload;
      const notebook = state.items.find(nb => nb.id === notebookId);
      if (notebook) {
        notebook.sections = notebook.sections.filter(s => s.id !== sectionId);
      }
    },
    deleteNote: (
      state,
      action: PayloadAction<{ sectionId: string; noteId: string }>
    ) => {
      const { sectionId, noteId } = action.payload;
      state.items.forEach((notebook: Notebook) => {
        const section = notebook.sections.find(s => s.id === sectionId);
        if (section) {
          section.notes = section.notes.filter(n => n.id !== noteId);
        }
      });
    },
    reorderSections: (
      state,
      action: PayloadAction<{ notebookId: string; sections: Section[] }>
    ) => {
      const { notebookId, sections } = action.payload;
      const notebook = state.items.find(nb => nb.id === notebookId);
      if (notebook) {
        notebook.sections = sections;
      }
    },
    reorderNotes: (
      state,
      action: PayloadAction<{ sectionId: string; notes: Note[] }>
    ) => {
      const { sectionId, notes } = action.payload;
      state.items.forEach((notebook: Notebook) => {
        const section = notebook.sections.find(s => s.id === sectionId);
        if (section) {
          section.notes = notes;
        }
      });
    },
    addNote: (
      state,
      action: PayloadAction<{ sectionId: string; note: Note }>
    ) => {
      const { sectionId, note } = action.payload;
      state.items.forEach((notebook: Notebook) => {
        const section = notebook.sections.find((s: Section) => s.id === sectionId);
        if (section) {
          section.notes.push(note);
        }
      });
    },
  },
});

export const {
  addNotebook,
  addSection,
  setCurrentNotebook,
  setCurrentSection,
  setCurrentNote,
  updateNoteContent,
  updateSectionTitle,
  updateNoteTitle,
  deleteSection,
  deleteNote,
  reorderSections,
  reorderNotes,
  addNote,
} = notebookSlice.actions;

export default notebookSlice.reducer;