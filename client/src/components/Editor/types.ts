import { BaseEditor, Descendant } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';

export type BlockFormatType = 'numbered-list' | 'bulleted-list' | 'paragraph' | 'list-item';
export type MarkFormatType = 'bold' | 'italic' | 'underline' | 'backgroundColor';
export type FormatType = BlockFormatType | MarkFormatType;

export interface CustomElement {
  type: BlockFormatType;
  children: CustomText[];
}

export interface CustomText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  backgroundColor?: string;
}

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

export type MarkFormat = 'bold' | 'italic' | 'underline';

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

export interface KeyboardEvent {
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
}

// 添加 Slate 元素的类型定义
declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

// 导出自定义的 Descendant 类型
export type CustomDescendant = CustomElement | CustomText; 