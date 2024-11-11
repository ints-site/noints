import { Editor, Transforms, Text } from 'slate';
import { CustomEditor } from '../components/Editor/types';

export const findAndReplace = (
  editor: CustomEditor,
  searchText: string,
  replaceText: string
) => {
  if (!searchText) return;

  const matches = Editor.nodes(editor, {
    match: (node) => 
      Text.isText(node) && 
      node.text.toLowerCase().includes(searchText.toLowerCase()),
  });

  for (const [node, path] of matches) {
    if (Text.isText(node)) {
      const { text } = node;
      const parts = text.split(new RegExp(`(${searchText})`, 'gi'));
      const newTexts = parts.map(part => 
        part.toLowerCase() === searchText.toLowerCase()
          ? replaceText
          : part
      );
      
      Transforms.delete(editor, { at: path });
      Transforms.insertText(editor, newTexts.join(''), { at: path });
    }
  }
}; 