import { create } from 'zustand';
import { ChatRoom, ChatMessage } from '@workspace/api-client-react';

interface ChatState {
  rooms: ChatRoom[];
  activeRoomId: number | null;
  messages: Record<number, ChatMessage[]>;
  typingUsers: Record<number, string[]>;
  setRooms: (rooms: ChatRoom[]) => void;
  setActiveRoom: (id: number | null) => void;
  addMessage: (roomId: number, msg: ChatMessage) => void;
  setTyping: (roomId: number, users: string[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  rooms: [],
  activeRoomId: null,
  messages: {},
  typingUsers: {},
  setRooms: (rooms) => set({ rooms }),
  setActiveRoom: (id) => set({ activeRoomId: id }),
  addMessage: (roomId, msg) => set((state) => ({
    messages: {
      ...state.messages,
      [roomId]: [...(state.messages[roomId] || []), msg]
    }
  })),
  setTyping: (roomId, users) => set((state) => ({
    typingUsers: {
      ...state.typingUsers,
      [roomId]: users
    }
  }))
}));
