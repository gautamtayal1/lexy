import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

interface ChatState {
  question: string;
  selectedModel: string;
  isCreativeMode: boolean;
  attachedFiles: AttachedFile[];
}

const initialState: ChatState = {
  question: '',
  selectedModel: 'openai/gpt-4.1-mini',
  isCreativeMode: false,
  attachedFiles: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setQuestion: (state, action: PayloadAction<string>) => {
      state.question = action.payload;
    },
    setSelectedModel: (state, action: PayloadAction<string>) => {
      state.selectedModel = action.payload;
    },
    setIsCreativeMode: (state, action: PayloadAction<boolean>) => {
      state.isCreativeMode = action.payload;
    },
    addAttachedFile: (state, action: PayloadAction<AttachedFile>) => {
      state.attachedFiles.push(action.payload);
    },
    removeAttachedFile: (state, action: PayloadAction<string>) => {
      state.attachedFiles = state.attachedFiles.filter(file => file.id !== action.payload);
    },
    clearAttachedFiles: (state) => {
      state.attachedFiles = [];
    },
    resetChatState: (state) => {
      state.question = '';
      state.attachedFiles = [];
      // Keep model and creativity settings
    },
  },
});

export const {
  setQuestion,
  setSelectedModel,
  setIsCreativeMode,
  addAttachedFile,
  removeAttachedFile,
  clearAttachedFiles,
  resetChatState,
} = chatSlice.actions;

export default chatSlice.reducer; 