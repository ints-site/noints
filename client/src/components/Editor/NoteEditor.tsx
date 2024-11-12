import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { 
  createEditor, 
  Descendant, 
  Editor, 
  Element as SlateElement,
  Node as SlateNode,
  Transforms,
  Text,
  Range,
  Point
} from 'slate';
import { Slate, Editable, withReact, RenderLeafProps } from 'slate-react';
import { withHistory } from 'slate-history';
import { useSelector, useDispatch } from 'react-redux';
import { useAutoSave } from '../../hooks/useAutoSave';
import Toolbar from './Toolbar';
import { 
  CustomElement, 
  CustomText, 
  BlockFormatType, 
  NoteStats, 
  TableElement, 
  TableRowElement, 
  TableCellElement, 
  ListItemElement, 
  ParagraphElement, 
  CustomDescendant 
} from './types';
import { RootState } from '../../store';
import { useHotkeys } from 'react-hotkeys-hook';
import { findAndReplace } from '../../utils/textOperations';
import { Node } from 'slate';
import { updateNoteContent } from '../../store/notebookSlice';
import { Table, TableRow, TableCell } from './elements/Table';
import { calculateNoteStats } from '../../utils/noteStats';
import DOMPurify from 'dompurify';
import { z } from 'zod';

interface EditorProps {
  onThemeChange?: (isDark: boolean) => void;
}

// 添加类型定义
interface CustomKeyboardEvent {
  preventDefault: () => void;
}

// Add sanitization helper
const sanitizeContent = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'u', 'ul', 'ol', 'li', 'table', 'tr', 'td'],
    ALLOWED_ATTR: ['class', 'style']
  });
};

// Add validation schema
const noteContentSchema = z.array(z.object({
  type: z.string(),
  children: z.array(z.object({
    text: z.string()
  }))
}));

// Add error boundary component
class EditorErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('Editor error caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-gray-600">
          Editor encountered an error. Please refresh the page.
        </div>
      );
    }
    return this.props.children;
  }
}

const NoteEditor: React.FC<EditorProps> = ({ onThemeChange }) => {
  const dispatch = useDispatch();

  // 获取当前笔记
  const currentNote = useSelector((state: RootState) => state.notebooks.currentNote);

  // 修改 editor 的创建方式，添加更多的安全检查
  const editor = useMemo(() => {
    const e = withHistory(withReact(createEditor()));
    
    // 增强 normalizeNode 处理
    const { normalizeNode } = e;
    e.normalizeNode = ([node, path]) => {
      if (path.length === 0) {
        // 确保文档至少有一个段落
        if (SlateElement.isElement(node)) {
          if (node.children.length === 0) {
            const paragraph: ParagraphElement = {
              type: 'paragraph',
              children: [{ text: '' }]
            };
            Transforms.insertNodes(e, paragraph, { at: [0] });
            return;
          }
        }
      }

      // 确保所有节点都有有效的 children
      if (SlateElement.isElement(node)) {
        for (const [child, childPath] of Node.children(e, path)) {
          if (SlateElement.isElement(child) && (!child.children || child.children.length === 0)) {
            Transforms.removeNodes(e, { at: childPath });
            continue;
          }
        }
      }
      
      normalizeNode([node, path]);
    };

    // 增强 insertBreak 处理
    const { insertBreak } = e;
    e.insertBreak = () => {
      const { selection } = e;
      if (selection) {
        const [parent] = Editor.parent(e, selection);
        if (SlateElement.isElement(parent) && ['table-cell'].includes(parent.type)) {
          insertBreak();
          return;
        }
      }
      
      // Use Transforms.insertNodes with proper type casting
      Transforms.insertNodes(e, {
        type: 'paragraph',
        children: [{ text: '' }]
      } as CustomElement);
    };

    // 修改 deleteBackward 处理，使用正确的 API
    const { deleteBackward } = e;
    e.deleteBackward = (...args) => {
      const { selection } = e;
      if (selection && Range.isCollapsed(selection)) {
        const match = Editor.above(e, {
          match: n => SlateElement.isElement(n) && Editor.isBlock(e, n),
        });

        if (match) {
          const [block, path] = match;
          const start = Editor.start(e, path);

          if (
            SlateElement.isElement(block) &&
            block.type !== 'paragraph' &&
            Editor.isStart(e, selection.anchor, path)
          ) {
            Transforms.setNodes(e, { type: 'paragraph' });
            return;
          }
        }
      }
      deleteBackward(...args);
    };

    return e;
  }, []);

  // 修改 value 的初始化和更新
  const [value, setValue] = useState<Descendant[]>(() => {
    try {
      if (currentNote?.content) {
        return Array.isArray(currentNote.content) ? currentNote.content : [];
      }
    } catch (error) {
      console.warn('Error initializing editor value:', error);
    }
    return [{ type: 'paragraph', children: [{ text: '' }] }];
  });

  // Add state validation
  const validateEditorState = (state: unknown): state is Descendant[] => {
    try {
      return noteContentSchema.parse(state) !== null;
    } catch {
      return false;
    }
  };

  // 修改 handleChange 函数，添加更多的安全检查
  const handleChange = useCallback((newValue: Descendant[]) => {
    try {
      setValue(newValue);
    } catch (error) {
      console.warn('Error in handleChange:', error);
    }
  }, []);

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

    if (!isActive && isList) {
      const block = format === 'numbered-list' 
        ? { type: 'numbered-list' as const, children: [] as ListItemElement[] }
        : { type: 'bulleted-list' as const, children: [] as ListItemElement[] };
      Transforms.wrapNodes(editor, block);
    } else {
      const newProperties: Partial<SlateElement> = {
        type: isActive ? 'paragraph' as const : format,
      };
      Transforms.setNodes<SlateElement>(editor, newProperties);
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
    const { element, attributes, children } = props;
    
    switch (element.type) {
      case 'paragraph':
        return <p {...attributes}>{children}</p>;
      case 'bulleted-list':
        return <ul {...attributes}>{children}</ul>;
      case 'numbered-list':
        return <ol {...attributes}>{children}</ol>;
      case 'list-item':
        return <li {...attributes}>{children}</li>;
      case 'table':
        return <Table {...props} />;
      case 'table-row':
        return <TableRow {...props} />;
      case 'table-cell':
        return <TableCell {...props} />;
      default:
        return <p {...attributes}>{children}</p>;
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

  const [searchQuery, setSearchQuery] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [lineCount, setLineCount] = useState(0);

  // Add hotkey support
  useHotkeys('ctrl+f', (e: CustomKeyboardEvent) => {
    e.preventDefault();
    setShowFindReplace(true);
  });

  useHotkeys('ctrl+s', (e: CustomKeyboardEvent) => {
    e.preventDefault();
    handleSave();
  });

  // Add status bar calculations
  useEffect(() => {
    const text = value.map(n => Node.string(n)).join('\n');
    setWordCount(text.trim().split(/\s+/).length);
    setLineCount(value.length);
  }, [value]);

  // Add find and replace functionality
  const handleFindReplace = () => {
    findAndReplace(editor, searchQuery, replaceText);
  };

  const handleSave = useCallback(() => {
    if (currentNote?.id) {
      // 使用 useAutoSave 中的逻辑直接保存
      dispatch(updateNoteContent({ 
        id: currentNote.id, 
        content: value 
      }));
      console.log('Note saved manually');
    }
  }, [currentNote?.id, value]);

  // 添加新的状态
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Arial');

  const [noteStats, setNoteStats] = useState<NoteStats>({
    wordCount: 0,
    characterCount: 0,
    readingTime: 0,
    codeBlockCount: 0,
    tableCount: 0,
    lastModified: new Date()
  });

  // Update statistics when content changes
  useEffect(() => {
    // 过滤出 CustomElement 类型的节点
    const elements = value.filter((node): node is CustomElement => 
      'type' in node && typeof node.type === 'string'
    );
    
    const stats = calculateNoteStats(elements);
    setNoteStats(stats);
  }, [value]);

  // Add toolbar buttons for code block and table
  const insertTable = (rows = 3, cols = 3) => {
    const table: TableElement = {
      type: 'table',
      rows,
      columns: cols,
      children: Array(rows).fill(0).map((): TableRowElement => ({
        type: 'table-row',
        children: Array(cols).fill(0).map((): TableCellElement => ({
          type: 'table-cell',
          children: [{ text: '' }]
        }))
      }))
    };
    Transforms.insertNodes(editor, table);
  };

  // Add error boundary for content loading
  useEffect(() => {
    try {
      if (currentNote?.content) {
        const validContent: CustomDescendant[] = Array.isArray(currentNote.content) ? 
          currentNote.content : 
          [{ type: 'paragraph' as const, children: [{ text: '' }] }];
        setValue(validContent);
      }
    } catch (error) {
      console.error('Error loading note content:', error);
      setValue([{ type: 'paragraph', children: [{ text: '' }] }]);
    }
  }, [currentNote]);

  // Add support for more keyboard shortcuts
  useHotkeys('ctrl+b', (e: CustomKeyboardEvent) => {
    e.preventDefault();
    Editor.addMark(editor, 'bold', true);
  });

  useHotkeys('ctrl+i', (e: CustomKeyboardEvent) => {
    e.preventDefault();
    Editor.addMark(editor, 'italic', true);
  });

  useHotkeys('ctrl+u', (e: CustomKeyboardEvent) => {
    e.preventDefault();
    Editor.addMark(editor, 'underline', true);
  });

  // Add paste handling
  const handlePaste = useCallback((event: React.ClipboardEvent) => {
    event.preventDefault();
    const text = event.clipboardData.getData('text/plain');
    const sanitizedText = sanitizeContent(text);
    const lines = sanitizedText.split('\n');
    
    if (lines.length > 1) {
      const nodes: ParagraphElement[] = lines.map(line => ({
        type: 'paragraph' as const,
        children: [{ text: line }]
      }));
      Editor.insertFragment(editor, nodes);
    } else {
      Editor.insertText(editor, sanitizedText);
    }
  }, [editor]);

  return (
    <EditorErrorBoundary>
      <div className="h-full flex flex-col">
        <Slate 
          editor={editor} 
          value={value} 
          onChange={handleChange}
          key={currentNote?.id || 'editor'}
        >
          <Toolbar 
            editor={editor}
            onThemeChange={onThemeChange}
            onToggleBlock={toggleBlock}
            isBlockActive={isBlockActive}
            onExport={handleExport}
            onFindReplace={() => setShowFindReplace(true)}
            fontSize={fontSize}
            fontFamily={fontFamily}
            onFontSizeChange={setFontSize}
            onFontFamilyChange={setFontFamily}
            currentSectionId={currentNote?.sectionId}
            onInsertTable={insertTable}
          />
          {showFindReplace && (
            <div className="border-b p-2 flex gap-2 items-center">
              <input
                type="text"
                placeholder="Find..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-2 py-1 border rounded"
              />
              <input
                type="text"
                placeholder="Replace with..."
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                className="px-2 py-1 border rounded"
              />
              <button
                onClick={handleFindReplace}
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                Replace
              </button>
              <button
                onClick={() => setShowFindReplace(false)}
                className="px-2 py-1"
              >
                ✕
              </button>
            </div>
          )}
          <Editable 
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="开始你的笔记..."
            className="flex-1 p-4 overflow-auto prose max-w-none dark:prose-invert"
            style={{
              fontSize: `${fontSize}px`,
              fontFamily
            }}
            onPaste={handlePaste}
            spellCheck={false}
            autoFocus={true}
          />
          <div className="border-t px-4 py-2 text-sm text-gray-600 dark:text-gray-400 flex justify-between">
            <div>
              Lines: {lineCount} | Words: {wordCount}
            </div>
            <div>
              UTF-8
            </div>
          </div>
        </Slate>
        
        {/* Add statistics panel */}
        <div className="border-t px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <span>Words: {noteStats.wordCount}</span>
              <span>Characters: {noteStats.characterCount}</span>
              <span>Reading Time: {noteStats.readingTime} min</span>
            </div>
            <div className="flex gap-4">
              <span>Code Blocks: {noteStats.codeBlockCount}</span>
              <span>Tables: {noteStats.tableCount}</span>
              <span>Last Modified: {noteStats.lastModified.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>
    </EditorErrorBoundary>
  );
};

export default NoteEditor;