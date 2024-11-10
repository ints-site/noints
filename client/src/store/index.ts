import { configureStore } from '@reduxjs/toolkit';
import notebookReducer from './notebookSlice';

export const store = configureStore({
  reducer: {
    notebooks: notebookReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 