import { Notebook, Section, Note } from '../types';

export interface RootState {
  notebooks: {
    items: Notebook[];
    currentNotebook: Notebook | null;
    currentSection: Section | null;
    currentNote: Note | null;
  };
} 