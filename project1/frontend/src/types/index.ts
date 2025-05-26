export type User = {
  id: string; // Firebase UID
  userId: string; // Chosen username
  name: string;
  email: string;
  avatar: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: string;
};

export type Message = {
  id: string;
  content: string;
  sender: User;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  attachments?: Attachment[];
  reactions?: Reaction[];
  replyTo?: Message;
};

export type Attachment = {
  id: string;
  type: 'image' | 'file' | 'voice' | 'link';
  url: string;
  name: string;
  size?: number;
  preview?: string;
};

export type Reaction = {
  emoji: string;
  count: number;
  users: string[];
};

export type Conversation = {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  participants: User[];
  messages: Message[];
  unreadCount: number;
  lastMessage?: Message;
  pinned: boolean;
};

export type Notification = {
  id: string;
  type: 'message' | 'mention' | 'reaction';
  conversation: Conversation;
  message?: Message;
  read: boolean;
  timestamp: string;
};