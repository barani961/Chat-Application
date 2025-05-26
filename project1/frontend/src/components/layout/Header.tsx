import React from 'react';
import { useChat } from '../../context/ChatContext';
import Avatar from '../shared/Avatar';
import { Phone, Video, Search, Info, Pin, ArrowLeft } from 'lucide-react';
import { User } from '../../types';

interface HeaderProps {
  onBackClick?: () => void;
  showBackButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onBackClick, showBackButton = false }) => {
  const { activeConversation, pinConversation } = useChat();

  if (!activeConversation) {
    return (
      <div className="h-16 border-b dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Select a conversation</h2>
      </div>
    );
  }

  const getOtherParticipants = (participants: User[]): User[] => {
    // In a real app, filter out the current user
    return participants.filter(p => p.id !== '1');
  };

  const getConversationName = (): string => {
    if (activeConversation.name) return activeConversation.name;
    
    const otherParticipants = getOtherParticipants(activeConversation.participants);
    return otherParticipants.map(p => p.name).join(', ');
  };

  const otherParticipants = getOtherParticipants(activeConversation.participants);
  const isGroupChat = activeConversation.type === 'group';
  const participantStatus = !isGroupChat ? otherParticipants[0].status : undefined;

  return (
    <div className="h-16 border-b dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-4">
      <div className="flex items-center">
        {showBackButton && (
          <button 
            onClick={onBackClick}
            className="mr-2 p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        
        <div className="flex items-center cursor-pointer">
          {isGroupChat ? (
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          ) : (
            <Avatar
              src={otherParticipants[0].avatar}
              alt={otherParticipants[0].name}
              status={otherParticipants[0].status}
            />
          )}
          
          <div className="ml-3">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {getConversationName()}
            </h2>
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isGroupChat 
                ? `${activeConversation.participants.length} members` 
                : participantStatus === 'online' 
                  ? 'Online' 
                  : participantStatus === 'busy' 
                    ? 'Busy'
                    : participantStatus === 'away'
                      ? 'Away'
                      : otherParticipants[0].lastSeen 
                        ? `Last seen ${new Date(otherParticipants[0].lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
                        : 'Offline'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
          <Search size={20} />
        </button>
        
        <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
          <Phone size={20} />
        </button>
        
        <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
          <Video size={20} />
        </button>
        
        <button
          onClick={() => pinConversation(activeConversation.id)}
          className={`p-2 rounded-full ${
            activeConversation.pinned 
              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Pin size={20} className={activeConversation.pinned ? 'fill-current' : ''} />
        </button>
        
        <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
          <Info size={20} />
        </button>
      </div>
    </div>
  );
};

export default Header;