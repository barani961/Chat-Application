import React, { createContext, useContext, useState, useEffect } from 'react';
import { Conversation, Message, User } from '../types';
import { mockConversations, mockUsers } from '../utils/mockData';

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  setActiveConversation: (conversation: Conversation) => void;
  sendMessage: (content: string, attachments?: any[]) => void;
  isTyping: Record<string, boolean>;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  markAsRead: (conversationId: string) => void;
  pinConversation: (conversationId: string) => void;
  searchMessages: (query: string) => Message[];
  loading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [activeConversation, setActiveConversationState] = useState<Conversation | null>(null);
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set first conversation as active by default
    if (conversations.length > 0 && !activeConversation) {
      setActiveConversationState(conversations[0]);
    }
  }, [conversations, activeConversation]);

  const setActiveConversation = (conversation: Conversation) => {
    setActiveConversationState(conversation);
    markAsRead(conversation.id);
  };

  const sendMessage = (content: string, attachments: any[] = []) => {
    if (!activeConversation || !content.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: mockUsers[0], // Current user
      timestamp: new Date().toISOString(),
      status: 'sent',
      attachments: attachments.map((attachment, index) => ({
        id: `${Date.now()}-${index}`,
        type: attachment.type,
        url: attachment.url || '#',
        name: attachment.name,
        size: attachment.size,
        preview: attachment.preview,
      })),
    };

    // Update conversation with new message
    const updatedConversations = conversations.map(conv => {
      if (conv.id === activeConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: newMessage,
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    
    // Update active conversation
    if (activeConversation) {
      setActiveConversationState({
        ...activeConversation,
        messages: [...activeConversation.messages, newMessage],
        lastMessage: newMessage,
      });
    }

    // Simulate response after delay (for demo purposes)
    setTimeout(() => {
      // Update message status to 'delivered'
      updateMessageStatus(newMessage.id, 'delivered');
      
      // Add a mock response for demo purposes
      const otherUser = activeConversation.participants.find(p => p.id !== '1');
      if (otherUser) {
        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `This is an automated response from ${otherUser.name}`,
          sender: otherUser,
          timestamp: new Date().toISOString(),
          status: 'sent',
        };
        
        addResponseMessage(responseMessage);
      }
    }, 1000);
  };

  const updateMessageStatus = (messageId: string, status: 'sent' | 'delivered' | 'read') => {
    const updatedConversations = conversations.map(conv => {
      const updatedMessages = conv.messages.map(msg => {
        if (msg.id === messageId) {
          return { ...msg, status };
        }
        return msg;
      });
      
      return {
        ...conv,
        messages: updatedMessages,
        lastMessage: conv.lastMessage?.id === messageId 
          ? { ...conv.lastMessage, status } 
          : conv.lastMessage,
      };
    });
    
    setConversations(updatedConversations);
    
    // Update active conversation if needed
    if (activeConversation) {
      const updatedMessages = activeConversation.messages.map(msg => {
        if (msg.id === messageId) {
          return { ...msg, status };
        }
        return msg;
      });
      
      setActiveConversationState({
        ...activeConversation,
        messages: updatedMessages,
        lastMessage: activeConversation.lastMessage?.id === messageId 
          ? { ...activeConversation.lastMessage, status } 
          : activeConversation.lastMessage,
      });
    }
  };

  const addResponseMessage = (message: Message) => {
    if (!activeConversation) return;
    
    const updatedConversations = conversations.map(conv => {
      if (conv.id === activeConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, message],
          lastMessage: message,
          unreadCount: conv.unreadCount + 1,
        };
      }
      return conv;
    });
    
    setConversations(updatedConversations);
    
    // Update active conversation
    setActiveConversationState({
      ...activeConversation,
      messages: [...activeConversation.messages, message],
      lastMessage: message,
      unreadCount: activeConversation.unreadCount + 1,
    });
    
    // After a delay, mark this message as 'read' since we're viewing the conversation
    setTimeout(() => {
      updateMessageStatus(message.id, 'read');
      markAsRead(activeConversation.id);
    }, 2000);
  };

  const startTyping = (conversationId: string) => {
    setIsTyping(prev => ({ ...prev, [conversationId]: true }));
    
    // Automatically stop typing after 3 seconds (simulating real typing behavior)
    setTimeout(() => {
      stopTyping(conversationId);
    }, 3000);
  };

  const stopTyping = (conversationId: string) => {
    setIsTyping(prev => ({ ...prev, [conversationId]: false }));
  };

  const markAsRead = (conversationId: string) => {
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        // Mark all messages as read
        const updatedMessages = conv.messages.map(msg => {
          if (msg.status !== 'read') {
            return { ...msg, status: 'read' as const };
          }
          return msg;
        });
        
        return {
          ...conv,
          messages: updatedMessages,
          unreadCount: 0,
          lastMessage: conv.lastMessage 
            ? { ...conv.lastMessage, status: 'read' as const } 
            : undefined,
        };
      }
      return conv;
    });
    
    setConversations(updatedConversations);
    
    // Update active conversation if needed
    if (activeConversation && activeConversation.id === conversationId) {
      const updatedMessages = activeConversation.messages.map(msg => {
        if (msg.status !== 'read') {
          return { ...msg, status: 'read' as const };
        }
        return msg;
      });
      
      setActiveConversationState({
        ...activeConversation,
        messages: updatedMessages,
        unreadCount: 0,
        lastMessage: activeConversation.lastMessage 
          ? { ...activeConversation.lastMessage, status: 'read' as const } 
          : undefined,
      });
    }
  };

  const pinConversation = (conversationId: string) => {
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          pinned: !conv.pinned,
        };
      }
      return conv;
    });
    
    // Sort conversations: pinned first, then by last message time
    const sortedConversations = [...updatedConversations].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      
      const timeA = a.lastMessage?.timestamp || '';
      const timeB = b.lastMessage?.timestamp || '';
      return timeB.localeCompare(timeA); // Most recent first
    });
    
    setConversations(sortedConversations);
    
    // Update active conversation if needed
    if (activeConversation && activeConversation.id === conversationId) {
      setActiveConversationState({
        ...activeConversation,
        pinned: !activeConversation.pinned,
      });
    }
  };

  const searchMessages = (query: string): Message[] => {
    if (!query.trim()) return [];
    
    const results: Message[] = [];
    
    conversations.forEach(conv => {
      const matches = conv.messages.filter(msg => 
        msg.content.toLowerCase().includes(query.toLowerCase())
      );
      results.push(...matches);
    });
    
    return results;
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        setActiveConversation,
        sendMessage,
        isTyping,
        startTyping,
        stopTyping,
        markAsRead,
        pinConversation,
        searchMessages,
        loading,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};