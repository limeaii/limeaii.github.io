
export interface User {
  username: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
