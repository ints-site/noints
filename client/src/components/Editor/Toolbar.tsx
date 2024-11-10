import React, { useState, useCallback } from 'react';
import { useSlate } from 'slate-react';
import { Editor, Element as SlateElement, Node, Transforms } from 'slate';
import { CustomElement, CustomText, FormatType, MarkFormatType, BlockFormatType } from './types';

interface FormatButtonProps {
  format: FormatType;
  icon: string;
  onClick: () => void;
  isActive?: boolean;
}

const FormatButton: React.FC<FormatButtonProps> = ({ format, icon, onClick, isActive }) => (
  <button
    className={`p-1 rounded ${
      isActive ? 'bg-gray-200' : 'hover:bg-gray-100'
    }`}
    onMouseDown={(e) => {
      e.preventDefault();
      onClick();
    }}
    title={format}
  >
    <span className="material-icons">{icon}</span>
  </button>
);

const isMarkFormat = (format: FormatType): format is MarkFormatType => {
  return ['bold', 'italic', 'underline'].includes(format);
};

const isCustomElement = (node: Node): node is CustomElement => {
  return SlateElement.isElement(node) && 'type' in node;
};

interface ToolbarProps {
  onExport?: (format: 'txt' | 'md' | 'html', filename?: string) => void;
  onThemeChange?: (isDark: boolean) => void;
}

// 修改 ExportDialog 组件
const ExportDialog: React.FC<{
  isOpen: boolean;
  format: 'txt' | 'md' | 'html';
  onConfirm: (filename: string) => void;
  onCancel: () => void;
}> = ({ isOpen, format, onConfirm, onCancel }) => {
  const [filename, setFilename] = useState('');

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg p-6 w-96 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-medium mb-4">Export Note</h3>
        <input
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="Enter filename"
          className="w-full px-3 py-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCancel();
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const finalFilename = filename || 'untitled';
              onConfirm(`${finalFilename}.${format}`);
            }}
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

// 修改 ColorButton 组件
const ColorButton: React.FC<{
  color: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ color, isActive, onClick }) => (
  <button
    className={`w-6 h-6 rounded border ${isActive ? 'ring-2 ring-blue-500' : ''}`}
    style={{ backgroundColor: color }}
    onMouseDown={(e) => {
      e.preventDefault();
      onClick();
    }}
    title={`Background ${color}`}
  />
);

const COLORS = [
  '#ffffff', // white
  '#fef3c7', // amber-100
  '#dcfce7', // green-100
  '#dbeafe', // blue-100
  '#fce7f3', // pink-100
  '#f3e8ff', // purple-100
];

const Toolbar: React.FC<ToolbarProps> = ({ onExport, onThemeChange }) => {
  const editor = useSlate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [exportDialog, setExportDialog] = useState<{
    isOpen: boolean;
    format?: 'txt' | 'md' | 'html';
  }>({ isOpen: false });

  // 检查当前选中文本的格式
  const isFormatActive = (format: FormatType) => {
    if (isMarkFormat(format)) {
      const marks = Editor.marks(editor) as Partial<CustomText> | null;
      return marks ? !!marks[format] : false;
    } else {
      const [match] = Array.from(Editor.nodes(editor, {
        match: n => 
          isCustomElement(n) && n.type === format,
      }));
      return !!match;
    }
  };

  // 切换文本格式
  const toggleFormat = (format: MarkFormatType) => {
    const isActive = isFormatActive(format);
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  };

  // 切换列表格式
  const toggleList = (format: BlockFormatType) => {
    const isActive = isFormatActive(format);

    Transforms.setNodes(
      editor,
      { type: isActive ? 'paragraph' : format },
      { 
        match: n => SlateElement.isElement(n) && (!('type' in n) || isCustomElement(n)),
        mode: 'highest'
      }
    );
  };

  // 添加撤销/重做功能
  const handleUndo = () => {
    editor.undo();
  };

  const handleRedo = () => {
    editor.redo();
  };

  // 切换主题模式
  const toggleTheme = useCallback(() => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    onThemeChange?.(newMode);
    // 添加或移除 dark 类到 body
    document.documentElement.classList.toggle('dark');
  }, [isDarkMode, onThemeChange]);

  return (
    <div className="flex items-center gap-2">
      {/* 现有的按钮 */}
      <div className="flex gap-1">
        <FormatButton
          format="bold"
          icon="format_bold"
          onClick={() => toggleFormat('bold')}
          isActive={isFormatActive('bold')}
        />
        <FormatButton
          format="italic"
          icon="format_italic"
          onClick={() => toggleFormat('italic')}
          isActive={isFormatActive('italic')}
        />
        <FormatButton
          format="underline"
          icon="format_underlined"
          onClick={() => toggleFormat('underline')}
          isActive={isFormatActive('underline')}
        />
        
        <div className="w-px bg-gray-300 mx-2" />
        
        <FormatButton
          format="bulleted-list"
          icon="format_list_bulleted"
          onClick={() => toggleList('bulleted-list')}
          isActive={isFormatActive('bulleted-list')}
        />
        <FormatButton
          format="numbered-list"
          icon="format_list_numbered"
          onClick={() => toggleList('numbered-list')}
          isActive={isFormatActive('numbered-list')}
        />

        <div className="w-px bg-gray-300 mx-2" />
        
        <button
          className="p-1 rounded hover:bg-gray-100 flex items-center gap-1"
          onClick={toggleTheme}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <span className="material-icons">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </div>

      <div className="w-px bg-gray-300 h-6" />

      {/* 导出按钮 */}
      <div className="relative">
        <button
          className="p-1 rounded hover:bg-gray-100 flex items-center gap-1"
          title="Export"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="material-icons">download</span>
          <span className="text-sm">Export</span>
        </button>
        <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-md py-1 hidden group-hover:block z-10">
          <button
            type="button"
            className="px-4 py-2 hover:bg-gray-100 w-full text-left"
            onClick={(e) => {
              e.stopPropagation();
              setExportDialog({ isOpen: true, format: 'txt' });
            }}
          >
            Text (.txt)
          </button>
          <button
            type="button"
            className="px-4 py-2 hover:bg-gray-100 w-full text-left"
            onClick={(e) => {
              e.stopPropagation();
              setExportDialog({ isOpen: true, format: 'md' });
            }}
          >
            Markdown (.md)
          </button>
          <button
            type="button"
            className="px-4 py-2 hover:bg-gray-100 w-full text-left"
            onClick={(e) => {
              e.stopPropagation();
              setExportDialog({ isOpen: true, format: 'html' });
            }}
          >
            HTML (.html)
          </button>
        </div>
      </div>

      {/* 导出对话框 */}
      <ExportDialog
        isOpen={exportDialog.isOpen}
        format={exportDialog.format!}
        onConfirm={(filename) => {
          onExport?.(exportDialog.format!, filename);
          setExportDialog({ isOpen: false });
        }}
        onCancel={() => setExportDialog({ isOpen: false })}
      />
    </div>
  );
};

export default Toolbar; 