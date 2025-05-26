import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import PasswordRecoveryForm from '../components/auth/PasswordRecoveryForm';
import ThemeToggle from '../components/shared/ThemeToggle';
import { MessageSquare } from 'lucide-react';

const Auth: React.FC = () => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'recovery'>('login');
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="mb-8 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 mb-4">
          <MessageSquare size={32} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ChatApp</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Connect and chat with friends</p>
      </div>
      
      {authMode === 'login' && (
        <LoginForm 
          onToggleForm={() => setAuthMode('register')} 
          onForgotPassword={() => setAuthMode('recovery')} 
        />
      )}
      
      {authMode === 'register' && (
        <RegisterForm onToggleForm={() => setAuthMode('login')} />
      )}
      
      {authMode === 'recovery' && (
        <PasswordRecoveryForm onBack={() => setAuthMode('login')} />
      )}
    </div>
  );
};

export default Auth;