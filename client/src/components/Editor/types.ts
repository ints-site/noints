import { BaseEditor, Descendant } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';

export type BlockFormatType = 
  | 'numbered-list' 
  | 'bulleted-list' 
  | 'paragraph' 
  | 'list-item'
  | 'table'
  | 'table-row'
  | 'table-cell';

export type MarkFormatType = 'bold' | 'italic' | 'underline' | 'backgroundColor';
export type FormatType = BlockFormatType | MarkFormatType;

export interface CustomText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  backgroundColor?: string;
}

// 基础元素接口
interface BaseElement {
  type: BlockFormatType;
  children: (CustomText | BaseElement)[];
}

// 表格相关类型
export interface TableCellElement extends BaseElement {
  type: 'table-cell';
  children: CustomText[];
}

export interface TableRowElement extends BaseElement {
  type: 'table-row';
  children: TableCellElement[];
}

export interface TableElement extends BaseElement {
  type: 'table';
  rows: number;
  columns: number;
  children: TableRowElement[];
}

// 列表项类型
export interface ListItemElement extends BaseElement {
  type: 'list-item';
  children: CustomText[];
}

// 段落类型
export interface ParagraphElement extends BaseElement {
  type: 'paragraph';
  children: CustomText[];
}

// 有序列表类型
export interface NumberedListElement extends BaseElement {
  type: 'numbered-list';
  children: ListItemElement[];
}

// 无序列表类型
export interface BulletedListElement extends BaseElement {
  type: 'bulleted-list';
  children: ListItemElement[];
}

// 统一的 CustomElement 类型
export type CustomElement =
  | ParagraphElement
  | NumberedListElement
  | BulletedListElement
  | ListItemElement
  | TableElement
  | TableRowElement
  | TableCellElement;

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

export type MarkFormat = 'bold' | 'italic' | 'underline';

// Slate 类型声明
declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

export interface CustomKeyboardEvent {
  preventDefault: () => void;
}

export interface ToolbarProps {
  editor: CustomEditor;
  onExport?: (format: 'txt' | 'md' | 'html') => void;
  onThemeChange?: (isDark: boolean) => void;
  onToggleBlock: (format: BlockFormatType) => void;
  isBlockActive: (format: BlockFormatType) => boolean;
  onFindReplace?: () => void;
  currentSectionId?: string;
  fontSize: number;
  fontFamily: string;
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange: (family: string) => void;
  onInsertTable: (rows: number, cols: number) => void;
}

export type CustomDescendant = CustomElement | CustomText;

export interface NoteStats {
  wordCount: number;
  characterCount: number;
  readingTime: number;
  codeBlockCount: number;
  tableCount: number;
  lastModified: Date;
}