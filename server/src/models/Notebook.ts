import mongoose from 'mongoose';

const NotebookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  sections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section'
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Notebook = mongoose.model('Notebook', NotebookSchema); 