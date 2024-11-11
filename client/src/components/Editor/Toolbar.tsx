import React, { useCallback, useState } from 'react';
import { Editor } from 'slate';
import { CustomEditor, MarkFormatType, BlockFormatType } from './types';
import { FileOperations } from './FileOperations';
import { FontSettings } from './FontSettings';

interface ToolbarProps {
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

const Toolbar: React.FC<ToolbarProps> = ({ 
  editor,
  onExport, 
  onThemeChange,
  onToggleBlock,
  isBlockActive,
  onFindReplace,
  currentSectionId,
  fontSize,
  fontFamily,
  onFontSizeChange,
  onFontFamilyChange,
  onInsertTable,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 检查当前格式是否激活
  const isFormatActive = (format: MarkFormatType) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  };

  // 切换格式
  const toggleFormat = (format: MarkFormatType) => {
    const isActive = isFormatActive(format);
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  };

  // 切换主题
  const toggleTheme = useCallback(() => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    onThemeChange?.(newMode);
  }, [isDarkMode, onThemeChange]);

  return (
    <div className="flex items-center justify-between gap-2 p-2 border-b dark:border-gray-700">
      <div className="flex items-center gap-2">
        <FileOperations editor={editor} currentSectionId={currentSectionId} />
        
        {/* Existing format buttons */}
        <div className="flex gap-1">
          <button
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 
              ${isFormatActive('bold') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
            onClick={() => toggleFormat('bold')}
            title="Bold (Ctrl+B)"
          >
            <span className="material-icons">format_bold</span>
          </button>
          
          <button
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700
              ${isFormatActive('italic') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
            onClick={() => toggleFormat('italic')}
            title="Italic (Ctrl+I)"
          >
            <span className="material-icons">format_italic</span>
          </button>
          
          <button
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700
              ${isFormatActive('underline') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
            onClick={() => toggleFormat('underline')}
            title="Underline (Ctrl+U)"
          >
            <span className="material-icons">format_underlined</span>
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
          
          <button
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700
              ${isBlockActive('bulleted-list') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
            onClick={() => onToggleBlock('bulleted-list')}
            title="Bullet List"
          >
            <span className="material-icons">format_list_bulleted</span>
          </button>
          
          <button
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700
              ${isBlockActive('numbered-list') ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
            onClick={() => onToggleBlock('numbered-list')}
            title="Numbered List"
          >
            <span className="material-icons">format_list_numbered</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onFindReplace?.()}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Find and Replace (Ctrl+F)"
        >
          <span className="material-icons">search</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Toggle Theme"
        >
          <span className="material-icons">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Export options */}
        <div className="relative group">
          <button
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Export"
          >
            <span className="material-icons">download</span>
          </button>
          <div className="absolute right-0 mt-1 hidden group-hover:block">
            <div className="bg-white dark:bg-gray-800 rounded shadow-lg py-1">
              <button
                onClick={() => onExport?.('txt')}
                className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Export as TXT
              </button>
              <button
                onClick={() => onExport?.('md')}
                className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Export as Markdown
              </button>
              <button
                onClick={() => onExport?.('html')}
                className="block w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Export as HTML
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <FontSettings
          fontSize={fontSize}
          fontFamily={fontFamily}
          onFontSizeChange={onFontSizeChange}
          onFontFamilyChange={onFontFamilyChange}
        />
      </div>

      <div className="flex gap-1">
        <button
          onClick={() => onInsertTable(3, 3)}
          className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Insert Table"
        >
          <span className="material-icons">table_chart</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;