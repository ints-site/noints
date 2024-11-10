import { useEffect, useRef } from 'react';
import { Descendant } from 'slate';
import { useDispatch } from 'react-redux';
import { updateNoteContent } from '../store/notebookSlice';

export const useAutoSave = (
  noteId: string | null,
  content: Descendant[],
  delay: number = 2000,
  onSave?: () => void
) => {
  const dispatch = useDispatch();
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!noteId) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      dispatch(updateNoteContent({ id: noteId, content }));
      onSave?.();
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, noteId, delay, dispatch, onSave]);
}; 