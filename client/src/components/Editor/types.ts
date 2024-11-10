import { BaseEditor, Descendant } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';

export type BlockFormatType = 'numbered-list' | 'bulleted-list' | 'paragraph';
export type MarkFormatType = 'bold' | 'italic' | 'underline' | 'backgroundColor';
export type FormatType = BlockFormatType | MarkFormatType;

export type CustomElement = {
  type: BlockFormatType;
  children: CustomText[];
};

export type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  backgroundColor?: string;
};

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
} 