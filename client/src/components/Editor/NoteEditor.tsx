import React, { useMemo, useState, useCallback } from 'react';
import { 
  createEditor, 
  Descendant, 
  Editor, 
  Element as SlateElement,
  Node as SlateNode,
  Transforms
} from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { useAutoSave } from '../../hooks/useAutoSave';
import Toolbar from './Toolbar';
import { CustomElement, CustomText } from './types';

interface EditorProps {
  noteId?: string;
  onThemeChange?: (isDark: boolean) => void;
}

const NoteEditor: React.FC<EditorProps> = ({ noteId, onThemeChange }) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [value, setValue] = useState<Descendant[]>([
    {
      type: 'paragraph',
      children: [{ text: '' }]
    }
  ]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [wordCount, setWordCount] = useState(0);

  // 使用自动保存 hook
  useAutoSave(noteId || null, value, 2000, () => {
    setSaveStatus('saving');
    setTimeout(() => setSaveStatus('saved'), 1000);
  });

  // 渲染元素
  const renderElement = useCallback((props: {
    element: CustomElement;
    children: React.ReactNode;
    attributes: any;
  }) => {
    switch (props.element.type) {
      case 'bulleted-list':
        return <ul {...props.attributes}>{props.children}</ul>;
      case 'numbered-list':
        return <ol {...props.attributes}>{props.children}</ol>;
      default:
        return <p {...props.attributes}>{props.children}</p>;
    }
  }, []);

  // 渲染叶子节点
  const renderLeaf = useCallback((props: {
    leaf: CustomText;
    children: React.ReactNode;
    attributes: any;
  }) => {
    let { children } = props;
    
    if (props.leaf.bold) {
      children = <strong>{children}</strong>;
    }
    if (props.leaf.italic) {
      children = <em>{children}</em>;
    }
    if (props.leaf.underline) {
      children = <u>{children}</u>;
    }
    
    // 添加背景色样式
    const style: React.CSSProperties = {};
    if (props.leaf.backgroundColor) {
      style.backgroundColor = props.leaf.backgroundColor;
    }
    
    return (
      <span {...props.attributes} style={style}>
        {children}
      </span>
    );
  }, []);

  // 修改计算字数的函数
  const calculateWordCount = useCallback((value: Descendant[]) => {
    const text = value
      .map(n => SlateNode.string(n))
      .join('\n')
      .trim();
    
    if (!text) return 0;
    
    // 分别计算中文和英文字数
    const cjkCount = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
    const englishWords = text
      .replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, '') // 移除中文字符
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    
    // 中文字符算一个字，英文单词算一个字
    return cjkCount + englishWords;
  }, []);

  // 修改导出函数，使filename参数可选
  const handleExport = useCallback((format: 'txt' | 'md' | 'html', filename?: string) => {
    const text = value.map(n => SlateNode.string(n)).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // 如果没有提供文件名，使用默认文件名
    a.download = filename || `note.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [value]);

  // 理快捷键
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!event.ctrlKey) return;

    switch (event.key) {
      case 'b': {
        event.preventDefault();
        editor.addMark('bold', true);
        break;
      }
      case 'i': {
        event.preventDefault();
        editor.addMark('italic', true);
        break;
      }
      case 'u': {
        event.preventDefault();
        editor.addMark('underline', true);
        break;
      }
      case 'z': {
        event.preventDefault();
        if (event.shiftKey) {
          editor.redo();
        } else {
          editor.undo();
        }
        break;
      }
      case 'y': {
        event.preventDefault();
        editor.redo();
        break;
      }
    }
  }, [editor]);

  // 添加主题切换处理
  const handleThemeChange = useCallback((isDark: boolean) => {
    onThemeChange?.(isDark);
  }, [onThemeChange]);

  return (
    <div className="h-full flex flex-col dark:bg-gray-700 dark:text-gray-100">
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => {
          setValue(newValue);
          const count = calculateWordCount(newValue);
          setWordCount(count);
        }}
      >
        <div className="border-b flex items-center justify-between px-4 py-2 dark:border-gray-600">
          <Toolbar 
            onExport={handleExport} 
            onThemeChange={handleThemeChange}
          />
          <div className="flex items-center gap-4">
            {/* 保存状态指示器 */}
            <div className="text-sm text-gray-500 flex items-center gap-1">
              {saveStatus === 'saving' && (
                <>
                  <span className="material-icons animate-spin text-blue-500">sync</span>
                  Saving...
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <span className="material-icons text-green-500">check</span>
                  Saved
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <span className="material-icons text-red-500">error</span>
                  Error saving
                </>
              )}
            </div>
            {/* 字数统计 */}
            <div className="text-sm text-gray-500">
              {wordCount} {wordCount === 1 ? 'character' : 'characters'}
            </div>
          </div>
        </div>
        <div className="flex-1 p-6 overflow-auto editor-content dark:bg-gray-700">
          <Editable
            className="h-full outline-none prose max-w-none dark:prose-invert"
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="Start typing..."
            onKeyDown={handleKeyDown}
            spellCheck={false}
          />
        </div>
      </Slate>
    </div>
  );
};

export default NoteEditor; 