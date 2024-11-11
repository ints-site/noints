import { Node, Text, Descendant } from 'slate';
import { CustomElement, NoteStats } from '../components/Editor/types';

export function calculateNoteStats(nodes: Descendant[]): NoteStats {
  let wordCount = 0;
  let characterCount = 0;
  let codeBlockCount = 0;
  let tableCount = 0;

  const traverseNode = (node: Descendant) => {
    if (Text.isText(node)) {
      const text = node.text;
      characterCount += text.length;
      wordCount += text.trim().split(/\s+/).filter(Boolean).length;
    } else if ('type' in node) {
      if (node.type === 'table') tableCount++;
      
      if ('children' in node) {
        node.children.forEach(traverseNode);
      }
    }
  };

  nodes.forEach(traverseNode);

  const readingTime = Math.ceil(wordCount / 200);

  return {
    wordCount,
    characterCount,
    readingTime,
    codeBlockCount: 0,
    tableCount,
    lastModified: new Date()
  };
} 