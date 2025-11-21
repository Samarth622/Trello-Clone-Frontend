import axios from '../lib/axios';

export interface Board {
  id: string;
  title: string;
  description?: string;
  isPrivate: boolean;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  members?: Array<{ id: string; name: string; email: string }>;
  createdAt: string;
}

export interface List {
  id: string;
  title: string;
  position: number;
  boardId: string;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  labels?: string[];
  assignees?: Array<{ id: string; name: string; email: string }>;
  dueDate?: string;
  position: number;
  listId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metaData?: Record<string, any>;
}

export interface Recommendation {
  dueDateSuggestions?: Array<{ cardId: string; suggestedDue: string; reason: string; cardTitle: string }>;
  moveSuggestions?: Array<{ cardId: string; suggestedListId: string; reason: string; cardTitle: string }>;
  relatedGroups?: Array<{ cards: Array<{ id: string, title: string }>; reason: string }>;
}

// Boards API
export const boardsAPI = {
  create: (data: { title: string; description?: string; isPrivate?: boolean }) =>
    axios.post<Board>('/board/boards', data),
  
  getAll: () => axios.get<Board[]>('/board/boards'),
  
  getById: (id: string) => axios.get<Board>(`/board/boards/${id}`),
  
  update: (id: string, data: Partial<Board>) =>
    axios.put<Board>(`/board/boards/${id}`, data),
  
  delete: (id: string) => axios.delete(`/board/boards/${id}`),
  
  inviteMember: (id: string, email: string) =>
    axios.post(`/board/boards/${id}/members`, { email }),
};

// Lists API
export const listsAPI = {
  create: (boardId: string, data: { title: string }) =>
    axios.post<List>(`/list/boards/${boardId}/lists`, data),
  
  getAll: (boardId: string) => axios.get<List[]>(`/list/boards/${boardId}/lists`),
  
  update: (boardId: string, listId: string, data: { title?: string; position?: number }) =>
    axios.put<List>(`/list/${boardId}/lists/${listId}`, data),
  
  delete: (boardId: string, listId: string) =>
    axios.delete(`/list/${boardId}/lists/${listId}`),
};

// Cards API
export const cardsAPI = {
  create: (boardId: string, listId: string, data: Partial<Card>) =>
    axios.post<Card>(`/card/${boardId}/${listId}/cards`, data),
  
  getAll: (boardId: string) => axios.get<Card[]>(`/card/${boardId}/cards`),
  
  update: (boardId: string, cardId: string, data: Partial<Card>) =>
    axios.put<Card>(`/card/${boardId}/cards/${cardId}`, data),
  
  move: (boardId: string, cardId: string, data: { targetListId: string; newPosition: number }) =>
    axios.post(`/card/${boardId}/cards/${cardId}/move`, data),
  
  delete: (boardId: string, cardId: string) =>
    axios.delete(`/card/${boardId}/cards/${cardId}`),
};

// Recommendations API
export const recommendationsAPI = {
  get: (boardId: string) => axios.get<Recommendation>(`/recommendations/boards/${boardId}/recommendations`),
};
