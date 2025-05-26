import React, { useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { User } from '../../types';
import Avatar from '../shared/Avatar';
import { formatTime } from '../../utils/formatters';
import { Image, File, Link, Mic, CheckCheck, Check } from 'lucide-react';

const MessageList: React.FC = () => {
  const { activeConversation, isTyping } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!activeConversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 p-8 text-center">
        <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-4">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-xl font-medium mb-2">Select a conversation</h2>
        <p className="max-w-md">Choose a conversation from the list or start a new one to begin chatting</p>
      </div>
    );
  }

  const getOtherParticipant = (participants: User[]): User => {
    // In a real app, filter out the current user
    return participants.find(p => p.id !== '1') || participants[0];
  };

  const isCurrentUser = (userId: string): boolean => {
    return userId === '1'; // Current user ID
  };

  const renderAttachment = (attachment: any) => {
    switch (attachment.type) {
      case 'image':
        return (
          <div className="mt-2 rounded-lg overflow-hidden max-w-xs">
            <img 
              src={attachment.url} 
              alt={attachment.name} 
              className="max-w-full h-auto object-cover"
            />
          </div>
        );
      case 'file':
        return (
          <div className="mt-2 flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg max-w-xs">
            <File size={20} className="text-indigo-500 dark:text-indigo-400 mr-2" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{attachment.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {attachment.size ? `${Math.round(attachment.size / 1024)} KB` : ''}
              </p>
            </div>
          </div>
        );
      case 'voice':
        return (
          <div className="mt-2 flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Mic size={20} className="text-indigo-500 dark:text-indigo-400 mr-2" />
            <div className="flex-1">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 dark:bg-indigo-400 w-1/3"></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">0:42</p>
            </div>
            <button className="ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        );
      case 'link':
        return (
          <div className="mt-2 flex items-start p-3 bg-gray-50 dark:bg-gray-800 rounded-lg max-w-sm">
            <Link size={20} className="text-indigo-500 dark:text-indigo-400 mr-2 mt-1 flex-shrink-0" />
            <div>
              <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                {attachment.name || attachment.url}
              </a>
              {attachment.preview && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {attachment.preview}
                </p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderMessageStatus = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check size={16} className="text-gray-400" />;
      case 'delivered':
        return <CheckCheck size={16} className="text-gray-400" />;
      case 'read':
        return <CheckCheck size={16} className="text-indigo-500 dark:text-indigo-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeConversation.messages.map((message) => {
          const isSender = isCurrentUser(message.sender.id);
          
          return (
            <div 
              key={message.id} 
              className={`flex ${isSender ? 'justify-end' : 'justify-start'} group`}
            >
              <div className={`flex ${isSender ? 'flex-row-reverse' : 'flex-row'} max-w-[75%]`}>
                {!isSender && (
                  <div className="flex-shrink-0 mr-2">
                    <Avatar src={message.sender.avatar} alt={message.sender.name} size="sm" />
                  </div>
                )}
                
                <div className={`flex flex-col ${isSender ? 'items-end' : 'items-start'}`}>
                  {!isSender && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">{message.sender.name}</span>
                  )}
                  
                  <div 
                    className={`rounded-lg px-4 py-2 ${
                      isSender 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none'
                    } ${message.reactions && message.reactions.length > 0 ? 'mb-1' : ''}`}
                  >
                    <p>{message.content}</p>
                    
                    {message.attachments && message.attachments.map((attachment, index) => (
                      <div key={index}>
                        {renderAttachment(attachment)}
                      </div>
                    ))}
                    
                    <div className={`text-xs mt-1 flex items-center ${
                      isSender ? 'text-indigo-200 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      <span>{formatTime(new Date(message.timestamp))}</span>
                      {isSender && (
                        <span className="ml-1">{renderMessageStatus(message.status)}</span>
                      )}
                    </div>
                  </div>
                  
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex space-x-1 mt-1">
                      {message.reactions.map((reaction, index) => (
                        <div 
                          key={index}
                          className="bg-white dark:bg-gray-700 rounded-full px-2 py-0.5 shadow-sm flex items-center"
                        >
                          <span className="mr-1">{reaction.emoji}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{reaction.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {isTyping[activeConversation.id] && (
          <div className="flex">
            <div className="flex max-w-[75%]">
              <div className="flex-shrink-0 mr-2">
                <Avatar 
                  src={getOtherParticipant(activeConversation.participants).avatar} 
                  alt={getOtherParticipant(activeConversation.participants).name} 
                  size="sm" 
                />
              </div>
              
              <div className="rounded-lg px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none">
                <div className="flex space-x-1">
                  <div className="typing-dot"></div>
                  <div className="typing-dot animation-delay-200"></div>
                  <div className="typing-dot animation-delay-400"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;