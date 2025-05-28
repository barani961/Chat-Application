import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { User } from '../../types';
import Avatar from '../shared/Avatar';
import { Search, Plus, Filter, Pin, CheckCheck, MessageSquare, Users } from 'lucide-react';
import { formatDistanceToNow } from '../../utils/formatters';

const ChatList: React.FC = () => {
  const { conversations, activeConversation, setActiveConversation, pinConversation } = useChat();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conversation => {
    const participantNames = conversation.participants
      .map(p => p.name.toLowerCase())
      .join(' ');
    
    const conversationName = conversation.name?.toLowerCase() || '';
    
    const lastMessageContent = conversation.lastMessage?.content.toLowerCase() || '';
    
    return (
      participantNames.includes(searchQuery.toLowerCase()) ||
      conversationName.includes(searchQuery.toLowerCase()) ||
      lastMessageContent.includes(searchQuery.toLowerCase())
    );
  });

  // Sort: pinned first, then by last message timestamp
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    
    const timeA = a.lastMessage?.timestamp || '';
    const timeB = b.lastMessage?.timestamp || '';
    return timeB.localeCompare(timeA); // Most recent first
  });
  
  const getOtherParticipants = (participants: User[]): User[] => {
    // In a real app, filter out the current user
    return participants.filter(p => p.id !== '1');
  };

  const getConversationName = (conversation: typeof conversations[0]): string => {
    if (conversation.name) return conversation.name;
    
    const otherParticipants = getOtherParticipants(conversation.participants);
    return otherParticipants.map(p => p.name).join(', ');
  };

  const handlePin = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    pinConversation(conversationId);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search conversation"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>
      
      <div className="px-4 py-2 flex justify-between">
        <div className="flex space-x-2">
          <button 
            className="flex items-center justify-center p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="New conversation"
          >
            <Plus size={18} />
          </button>
          <button 
            className="flex items-center justify-center p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Filter conversations"
          >
            <Filter size={18} />
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button 
            className={`flex items-center justify-center p-1.5 rounded-md ${
              true ? 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30' : 'text-gray-500 bg-gray-100 dark:text-gray-400 dark:bg-gray-800'
            }`}
            aria-label="Direct messages"
          >
            <MessageSquare size={18} />
          </button>
          <button 
            className={`flex items-center justify-center p-1.5 rounded-md ${
              false ? 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30' : 'text-gray-500 bg-gray-100 dark:text-gray-400 dark:bg-gray-800'
            }`}
            aria-label="Group chats"
          >
            <Users size={18} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2">
        {sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-4 text-center">
            <MessageSquare size={40} className="mb-2 opacity-50" />
            <p>No conversations found</p>
            <p className="text-sm mt-1">Start a new conversation or adjust your search</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {sortedConversations.map((conversation) => {
              const isActive = activeConversation?.id === conversation.id;
              const hasUnread = conversation.unreadCount > 0;
              
              return (
                <li 
                  key={conversation.id} 
                  onClick={() => setActiveConversation(conversation)}
                  className={`px-4 py-3 flex items-start cursor-pointer transition-colors duration-150 ${
                    isActive 
                      ? 'bg-indigo-50 dark:bg-indigo-900/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  {conversation.type === 'direct' ? (
                    <Avatar 
                      src={getOtherParticipants(conversation.participants)[0].avatar} 
                      alt={getOtherParticipants(conversation.participants)[0].name}
                      status={getOtherParticipants(conversation.participants)[0].status}
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
                      <Users size={20} />
                    </div>
                  )}
                  
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className={`text-sm font-medium truncate ${
                        hasUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {getConversationName(conversation)}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                        {conversation.lastMessage?.timestamp && 
                          formatDistanceToNow(new Date(conversation.lastMessage.timestamp))}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-1">
                      <p className={`text-xs truncate ${
                        hasUnread 
                          ? 'text-gray-900 dark:text-white font-medium' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {conversation.lastMessage?.content || 'No messages yet'}
                      </p>
                      
                      <div className="flex items-center ml-2">
                        {conversation.lastMessage?.status === 'read' && conversation.lastMessage.sender.id === '1' && (
                          <CheckCheck size={14} className="text-indigo-500 dark:text-indigo-400" />
                        )}
                        
                        {hasUnread && (
                          <span className="bg-indigo-600 text-white text-xs font-medium rounded-full h-5 min-w-5 flex items-center justify-center px-1 ml-1">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => handlePin(e, conversation.id)}
                    className={`p-1 rounded-full ${
                      conversation.pinned 
                        ? 'text-indigo-600 dark:text-indigo-400' 
                        : 'text-gray-400 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400'
                    }`}
                    aria-label={conversation.pinned ? 'Unpin conversation' : 'Pin conversation'}
                  >
                    <Pin size={16} className={conversation.pinned ? 'fill-current' : ''} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChatList;
