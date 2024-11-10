import React, { useMemo, useState, useCallback } from 'react';
import { 
  createEditor, 
  Descendant, 
  Editor, 
  Element as SlateElement,
  Node as SlateNode,
  Transforms
} from 'slate';
import { Slate, Editable, withReact, RenderLeafProps } from 'slate-react';
import { withHistory } from 'slate-history';
import { useSelector } from 'react-redux';
import { useAutoSave } from '../../hooks/useAutoSave';
import Toolbar from './Toolbar';
import { CustomElement, CustomText, BlockFormatType } from './types';
import { RootState } from '../../store';

interface EditorProps {
  onThemeChange?: (isDark: boolean) => void;
}

const NoteEditor: React.FC<EditorProps> = ({ onThemeChange }) => {
  // 获取当前笔记
  const currentNote = useSelector((state: RootState) => state.notebooks.currentNote);

  // 使用 useMemo 优化编辑器创建
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  
  // 初始化编辑器内容
  const [value, setValue] = useState<CustomElement[]>([
    { type: 'paragraph', children: [{ text: '' }] },
  ]);

  // 切换块类型
  const toggleBlock = (format: BlockFormatType) => {
    const isActive = isBlockActive(format);
    const isList = ['numbered-list', 'bulleted-list'].includes(format);

    Transforms.unwrapNodes(editor, {
      match: n => 
        SlateElement.isElement(n) && 
        ['numbered-list', 'bulleted-list'].includes(n.type),
      split: true,
    });

    const newProperties: Partial<SlateElement> = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    };

    Transforms.setNodes<SlateElement>(editor, newProperties);

    if (!isActive && isList) {
      const block = { type: format, children: [] };
      Transforms.wrapNodes(editor, block);
    }
  };

  // 检查块类型是否激活
  const isBlockActive = (format: BlockFormatType) => {
    const [match] = Array.from(
      Editor.nodes(editor, {
        match: n =>
          SlateElement.isElement(n) && n.type === format,
      })
    );
    return !!match;
  };

  // 渲染元素和叶子节点的回调函数
  const renderElement = useCallback((props: any) => {
    switch (props.element.type) {
      case 'paragraph':
        return <p {...props.attributes}>{props.children}</p>;
      case 'bulleted-list':
        return <ul {...props.attributes}>{props.children}</ul>;
      case 'numbered-list':
        return <ol {...props.attributes}>{props.children}</ol>;
      case 'list-item':
        return <li {...props.attributes}>{props.children}</li>;
      default:
        return <p {...props.attributes}>{props.children}</p>;
    }
  }, []);

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    let style: React.CSSProperties = {};
    if (props.leaf.bold) style.fontWeight = 'bold';
    if (props.leaf.italic) style.fontStyle = 'italic';
    if (props.leaf.underline) style.textDecoration = 'underline';

    return (
      <span {...props.attributes} style={style}>
        {props.children}
      </span>
    );
  }, []);

  // 导出功能
  const handleExport = useCallback((format: 'txt' | 'md' | 'html') => {
    const text = value.map(n => SlateNode.string(n)).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    a.download = `note-${timestamp}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [value]);

  // 自动保存钩子
  useAutoSave(
    currentNote?.id || null, 
    value, 
    2000, 
    () => console.log('Note saved')
  );

  return (
    <div className="h-full flex flex-col">
      <Slate 
        editor={editor} 
        value={value} 
        onChange={(newValue) => setValue(newValue as CustomElement[])}
      >
        <Toolbar 
          editor={editor}
          onThemeChange={onThemeChange}
          onToggleBlock={toggleBlock}
          isBlockActive={isBlockActive}
          onExport={handleExport}
        />
        <Editable 
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="开始你的笔记..."
          className="flex-1 p-4 overflow-auto prose max-w-none dark:prose-invert"
        />
      </Slate>
    </div>
  );
};

export default NoteEditor;