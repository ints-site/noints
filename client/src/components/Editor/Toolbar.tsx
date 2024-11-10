import React from 'react';
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
  onExport?: (format: 'txt' | 'md' | 'html') => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onExport }) => {
  const editor = useSlate();

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
      </div>

      <div className="w-px bg-gray-300 h-6" />

      {/* 导出按钮 */}
      <div className="relative group">
        <button
          className="p-1 rounded hover:bg-gray-100 flex items-center gap-1"
          title="Export"
        >
          <span className="material-icons">download</span>
          <span className="text-sm">Export</span>
        </button>
        <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-md py-1 hidden group-hover:block">
          <button
            className="px-4 py-2 hover:bg-gray-100 w-full text-left"
            onClick={() => onExport?.('txt')}
          >
            Text (.txt)
          </button>
          <button
            className="px-4 py-2 hover:bg-gray-100 w-full text-left"
            onClick={() => onExport?.('md')}
          >
            Markdown (.md)
          </button>
          <button
            className="px-4 py-2 hover:bg-gray-100 w-full text-left"
            onClick={() => onExport?.('html')}
          >
            HTML (.html)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar; 