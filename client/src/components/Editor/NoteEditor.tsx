gitimport React, { useMemo, useState } from 'react';
import { createEditor, Descendant, BaseEditor } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import Toolbar from './Toolbar';

// 定义自定义元素类型
type CustomElement = {
  type: 'paragraph';
  children: CustomText[];
};

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

// 声明模块扩展
declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const NoteEditor: React.FC = () => {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = useState<Descendant[]>([
    {
      type: 'paragraph' as const,
      children: [{ text: '' }],
    },
  ]);

  return (
    <div className="h-full flex flex-col">
      <Toolbar />
      <div className="flex-1 p-6">
        <Slate
          editor={editor}
          value={value}
          onChange={newValue => setValue(newValue)}
        >
          <Editable
            className="h-full outline-none"
            placeholder="Start typing..."
          />
        </Slate>
      </div>
    </div>
  );
};

export default NoteEditor; 