import React, { useMemo, useState, useCallback } from 'react';
import { createEditor, Descendant, Editor, Node as SlateNode } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { useAutoSave } from '../../hooks/useAutoSave';
import Toolbar from './Toolbar';
import { CustomElement, CustomText } from './types';

interface EditorProps {
  noteId?: string;
}

const NoteEditor: React.FC<EditorProps> = ({ noteId }) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [value, setValue] = useState<Descendant[]>([
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
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
    
    return <span {...props.attributes}>{children}</span>;
  }, []);

  // 计算字数
  const calculateWordCount = useCallback((value: Descendant[]) => {
    const text = value
      .map(n => SlateNode.string(n))
      .join('\n')
      .trim();
    
    // 检查是否包含CJK字符
    const hasCJK = /[\u4e00-\u9fff\u3400-\u4dbf]/.test(text);
    
    if (hasCJK) {
      // 如果包含CJK字符，直接计算字符数（排除空格和换行符）
      return text.replace(/\s+/g, '').length;
    } else {
      // 如果是纯英文，按空格分词
      return text.split(/\s+/).filter(Boolean).length;
    }
  }, []);

  // 导出功能
  const handleExport = useCallback((format: 'txt' | 'md' | 'html') => {
    const text = value.map(n => SlateNode.string(n)).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `note.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [value]);

  // 处理快捷键
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

  return (
    <div className="h-full flex flex-col">
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => {
          setValue(newValue);
          setWordCount(calculateWordCount(newValue));
        }}
      >
        <div className="border-b flex items-center justify-between px-4 py-2">
          <Toolbar onExport={handleExport} />
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
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </div>
          </div>
        </div>
        <div className="flex-1 p-6 overflow-auto">
          <Editable
            className="h-full outline-none prose max-w-none"
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