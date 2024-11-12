import { CustomDescendant } from '../components/Editor/types';

export interface Notebook {
  id: string;
  title: string;
  sections: Section[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Section {
  id: string;
  title: string;
  notes: Note[];
  notebookId: string;
}

export interface Note {
  id: string;
  title: string;
  content: CustomDescendant[];
  sectionId: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
} 