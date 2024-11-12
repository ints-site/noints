import { useEffect, useRef, useCallback } from 'react';
import { Descendant } from 'slate';
import { useDispatch } from 'react-redux';
import { updateNoteContent } from '../store/notebookSlice';

export function useAutoSave(
  noteId: string | null,
  content: Descendant[],
  delay = 2000,
  onSave?: () => void
) {
  const dispatch = useDispatch();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const contentRef = useRef(content);
  const saveCounter = useRef(0);
  const lastSave = useRef(Date.now());

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const save = useCallback(async () => {
    if (!noteId) return;

    const now = Date.now();
    if (now - lastSave.current < 1000) return;

    try {
      await dispatch(updateNoteContent({
        id: noteId,
        content: contentRef.current
      }));
      lastSave.current = now;
      onSave?.();
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [noteId, dispatch, onSave]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(save, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, delay, save]);
} 