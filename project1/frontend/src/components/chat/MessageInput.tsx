import React, { useState, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { Smile, Paperclip, Mic, Send, X, Image, File, Link, Bookmark } from 'lucide-react';

const MessageInput: React.FC = () => {
  const { activeConversation, sendMessage, startTyping, stopTyping } = useChat();
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && attachments.length === 0) return;
    
    if (activeConversation) {
      sendMessage(message, attachments);
      setMessage('');
      setAttachments([]);
      stopTyping(activeConversation.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    if (activeConversation && e.target.value.trim()) {
      startTyping(activeConversation.id);
    } else if (activeConversation) {
      stopTyping(activeConversation.id);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // For demo purposes, we'll just mock the attachment
      const fileType = file.type.startsWith('image/') ? 'image' : 'file';
      
      const newAttachment = {
        type: fileType,
        name: file.name,
        size: file.size,
        // In a real app, you would upload the file and get a URL
        url: fileType === 'image' 
          ? 'https://images.pexels.com/photos/1438761/pexels-photo-1438761.jpeg?auto=compress&cs=tinysrgb&w=300'
          : '#',
      };
      
      setAttachments([...attachments, newAttachment]);
      setShowAttachmentOptions(false);
    }
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAttachmentRemove = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    // In a real app, you would implement voice recording functionality
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    
    // Mock a voice attachment for demo purposes
    const voiceAttachment = {
      type: 'voice',
      name: 'Voice message',
      url: '#',
    };
    
    setAttachments([...attachments, voiceAttachment]);
  };

  // Simplified emoji picker for demo
  const emojis = ['😊', '👍', '❤️', '🎉', '🔥', '😂', '🙏', '😍'];

  if (!activeConversation) {
    return null;
  }

  return (
    <div className="border-t dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {attachments.map((attachment, index) => (
            <div 
              key={index} 
              className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-md p-2 pr-3"
            >
              {attachment.type === 'image' && <Image size={16} className="text-indigo-500 mr-2" />}
              {attachment.type === 'file' && <File size={16} className="text-indigo-500 mr-2" />}
              {attachment.type === 'voice' && <Mic size={16} className="text-indigo-500 mr-2" />}
              {attachment.type === 'link' && <Link size={16} className="text-indigo-500 mr-2" />}
              
              <span className="text-sm text-gray-800 dark:text-gray-200 truncate max-w-[150px]">
                {attachment.name}
              </span>
              
              <button 
                onClick={() => handleAttachmentRemove(index)}
                className="ml-2 text-gray-500 hover:text-red-500"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-end">
        <div className="relative flex-1">
          <textarea
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full resize-none rounded-lg border border-gray-300 dark:border-gray-700 py-3 px-4 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white min-h-[50px] max-h-[150px]"
            rows={1}
            style={{ minHeight: '50px', maxHeight: '150px' }}
          />
          
          <div className="absolute right-2 bottom-2 flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Smile size={20} />
            </button>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
                className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Paperclip size={20} />
              </button>
              
              {showAttachmentOptions && (
                <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 border border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col space-y-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Image size={18} className="text-indigo-500 mr-2" />
                      <span className="text-sm">Image</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <File size={18} className="text-indigo-500 mr-2" />
                      <span className="text-sm">File</span>
                    </button>
                    
                    <button
                      type="button"
                      className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Link size={18} className="text-indigo-500 mr-2" />
                      <span className="text-sm">Link</span>
                    </button>
                    
                    <button
                      type="button"
                      className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <Bookmark size={18} className="text-indigo-500 mr-2" />
                      <span className="text-sm">Saved</span>
                    </button>
                  </div>
                </div>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,application/pdf,application/msword,application/vnd.ms-excel"
              />
            </div>
            
            {!isRecording ? (
              <button
                type="button"
                onClick={startVoiceRecording}
                className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Mic size={20} />
              </button>
            ) : (
              <button
                type="button"
                onClick={stopVoiceRecording}
                className="p-1.5 rounded-full text-red-500 bg-red-100 dark:bg-red-900/30 animate-pulse"
              >
                <Mic size={20} />
              </button>
            )}
          </div>
          
          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-8 gap-2">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleEmojiSelect(emoji)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xl"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={!message.trim() && attachments.length === 0}
          className={`ml-2 p-3 rounded-full ${
            message.trim() || attachments.length > 0
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;