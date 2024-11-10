import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notebook, Section, Note } from '../types';

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
    addNotebook: (state, action: PayloadAction<Notebook>) => {
      state.items.push(action.payload);
    },
    setCurrentNotebook: (state, action: PayloadAction<Notebook>) => {
      state.currentNotebook = action.payload;
    },
    setCurrentSection: (state, action: PayloadAction<Section>) => {
      state.currentSection = action.payload;
    },
    setCurrentNote: (state, action: PayloadAction<Note>) => {
      state.currentNote = action.payload;
    }
  }
});

export const { 
  setNotebooks, 
  addNotebook,
  setCurrentNotebook,
  setCurrentSection,
  setCurrentNote
} = notebookSlice.actions;

export default notebookSlice.reducer; 