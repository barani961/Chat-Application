import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MessageList from '../chat/MessageList';
import MessageInput from '../chat/MessageInput';
import { Menu } from 'lucide-react';

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar - mobile */}
      <div 
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-gray-600 dark:bg-gray-900 opacity-75" onClick={() => setSidebarOpen(false)}></div>
        
        <div className={`relative flex flex-col w-80 max-w-[80%] h-full transition-transform duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white dark:bg-gray-900 shadow-xl`}>
          <Sidebar />
        </div>
      </div>
      
      {/* Sidebar - desktop */}
      <div className="hidden lg:flex lg:flex-col lg:w-80 lg:flex-shrink-0 border-r dark:border-gray-800 bg-white dark:bg-gray-900">
        <Sidebar />
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="relative">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden absolute left-4 top-5 z-10 p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu size={20} />
          </button>
          <Header showBackButton={false} />
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col bg-gray-50 dark:bg-gray-900">
          <MessageList />
          <MessageInput />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;