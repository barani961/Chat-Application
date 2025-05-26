import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../shared/Avatar';
import ThemeToggle from '../shared/ThemeToggle';
import ChatList from '../chat/ChatList';
import { 
  MessageSquare, 
  Bell, 
  Settings, 
  Search, 
  UserCircle, 
  LogOut,
  X,
  CheckCircle,
  Plus
} from 'lucide-react';
import { mockNotifications } from '../../utils/mockData';
import { db } from '../../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot, updateDoc, doc } from 'firebase/firestore';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'chats' | 'notifications' | 'settings'>('chats');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [friendReqStatus, setFriendReqStatus] = useState<'idle' | 'sending' | 'success' | 'error' | 'notfound' | 'already' >('idle');
  const [friendReqMessage, setFriendReqMessage] = useState('');
  const [friendRequests, setFriendRequests] = useState<any[]>([]);

  // Listen for incoming friend requests
  React.useEffect(() => {
    if (!user?.id) return;
    console.log('Listening for friend requests for UID:', user?.id);
    const q = query(collection(db, 'friendRequests'), where('to', '==', user.id), where('status', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Friend requests snapshot:', snapshot.docs.map(doc => doc.data()));
      setFriendRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user?.id]);

  const handleAcceptRequest = async (reqId: string) => {
    await updateDoc(doc(db, 'friendRequests', reqId), { status: 'accepted' });

    // Fetch the friend request document to get both users' UIDs and emails
    const reqRef = doc(db, 'friendRequests', reqId);
    const reqSnap = await reqRef.get();
    const reqData = reqSnap.data();
    if (!reqData) return;

    const user1 = reqData.from; // sender UID
    const user2 = reqData.to;   // receiver UID (current user)
    const user1Email = reqData.fromEmail;
    const user2Email = reqData.toEmail;

    // Check if a direct conversation already exists
    const convQuery = query(
      collection(db, 'conversations'),
      where('type', '==', 'direct'),
      where('participants', 'array-contains', user1)
    );
    const convSnap = await getDocs(convQuery);
    let found = false;
    convSnap.forEach(docSnap => {
      const data = docSnap.data();
      if (data.participants.includes(user2)) found = true;
    });
    if (!found) {
      // Create a new direct conversation
      await addDoc(collection(db, 'conversations'), {
        type: 'direct',
        participants: [user1, user2],
        participantEmails: [user1Email, user2Email],
        createdAt: serverTimestamp(),
        lastMessage: null,
        pinned: false
      });
    }
  };

  const handleDeclineRequest = async (reqId: string) => {
    await updateDoc(doc(db, 'friendRequests', reqId), { status: 'declined' });
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  return (
    <div className="flex flex-col h-full border-r dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
            <MessageSquare size={24} />
          </div>
          <h1 className="text-xl font-bold ml-2 text-gray-900 dark:text-white">ChatApp</h1>
        </div>
        
        <div className="flex items-center">
          <ThemeToggle />
          <button
            className="ml-2 p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-800 focus:outline-none"
            title="Add Friend"
            onClick={() => setShowFriendModal(true)}
          >
            <Plus size={20} />
          </button>
          <div className="relative ml-2">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="focus:outline-none"
            >
              {user && (
                <Avatar 
                  src={user.avatar} 
                  alt={user.name} 
                  size="sm" 
                  status={user.status}
                />
              )}
            </button>
            
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
                <div className="px-4 py-2 border-b dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
                
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <UserCircle size={16} className="mr-2" />
                  Profile
                </button>
                
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setActiveTab('settings');
                    setShowProfileMenu(false);
                  }}
                >
                  <Settings size={16} className="mr-2" />
                  Settings
                </button>
                
                <button
                  onClick={logout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Friend Request Modal */}
      {showFriendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-xs relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" onClick={() => { setShowFriendModal(false); setFriendEmail(''); setFriendReqStatus('idle'); setFriendReqMessage(''); }}>
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Add Friend</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setFriendReqStatus('sending');
              setFriendReqMessage('');
              try {
                if (!friendEmail) return;
                // Search for user by email
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('email', '==', friendEmail));
                const querySnapshot = await getDocs(q);
                console.log('User email query result:', querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
                if (querySnapshot.empty) {
                  setFriendReqStatus('notfound');
                  setFriendReqMessage('No user found with that email.');
                  return;
                }
                const receiverDoc = querySnapshot.docs[0];
                console.log('receiverDoc.id:', receiverDoc.id, 'receiverDoc.data():', receiverDoc.data());
                console.log('Current user:', user);
                if (!user?.id || !receiverDoc?.id) {
                  setFriendReqStatus('error');
                  setFriendReqMessage('User ID error: sender or receiver UID is missing.');
                  return;
                }
                // Check if already sent
                const friendReqRef = collection(db, 'friendRequests');
                const alreadySentQ = query(friendReqRef, where('from', '==', user.id), where('to', '==', receiverDoc.id));
                const alreadySentSnap = await getDocs(alreadySentQ);
                if (!alreadySentSnap.empty) {
                  setFriendReqStatus('already');
                  setFriendReqMessage('Friend request already sent.');
                  return;
                }
                // Send request
                await addDoc(friendReqRef, {
                  from: user?.id, // sender UID
                  fromEmail: user?.email,
                  to: receiverDoc.id, // recipient UID (MUST be Firebase UID)
                  toEmail: receiverDoc.data().email,
                  status: 'pending',
                  createdAt: serverTimestamp(),
                });
                setFriendReqStatus('success');
                setFriendReqMessage('Friend request sent!');
                setFriendEmail('');
              } catch (err: any) {
                setFriendReqStatus('error');
                setFriendReqMessage(err.message || 'Error sending request.');
              }
            }}>
              <input
                type="email"
                placeholder="Enter friend's email"
                className="w-full p-2 mb-3 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                value={friendEmail}
                onChange={e => setFriendEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded p-2 font-semibold disabled:opacity-60"
                disabled={friendReqStatus === 'sending'}
              >
                {friendReqStatus === 'sending' ? 'Sending...' : 'Send Request'}
              </button>
              {friendReqStatus !== 'idle' && friendReqMessage && (
                <div className={`mt-2 text-sm ${friendReqStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>{friendReqMessage}</div>
              )}
            </form>
          </div>
        </div>
      )}
      <div className="flex bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-800">
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 p-3 text-sm font-medium flex justify-center items-center ${
            activeTab === 'chats' 
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <MessageSquare size={18} className="mr-1" />
          Chats
        </button>
        
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex-1 p-3 text-sm font-medium flex justify-center items-center relative ${
            activeTab === 'notifications' 
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Bell size={18} className="mr-1" />
          Notifications
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-2 right-[calc(50%-40px)] bg-indigo-600 text-white text-xs font-medium rounded-full h-5 min-w-5 flex items-center justify-center px-1">
              {unreadNotificationsCount}
            </span>
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 p-3 text-sm font-medium flex justify-center items-center ${
            activeTab === 'settings' 
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Settings size={18} className="mr-1" />
          Settings
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'chats' && <ChatList />}
        
        {activeTab === 'notifications' && (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
              
              {unreadNotificationsCount > 0 && (
                <button 
                  onClick={markAllNotificationsAsRead}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>
                       {/* Incoming Friend Requests */}
            {friendRequests.length > 0 && (
              <div className="space-y-3 mb-6">
                {friendRequests.map((req) => (
                  <div key={req.id} className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{req.fromEmail}</span> sent you a friend request
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {req.createdAt && req.createdAt.toDate ? req.createdAt.toDate().toLocaleString() : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAcceptRequest(req.id)} className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs">Accept</button>
                      <button onClick={() => handleDeclineRequest(req.id)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs">Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Other notifications */}
            {notifications.length === 0 && friendRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500 dark:text-gray-400">
                <Bell size={40} className="mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-3 rounded-lg ${
                      notification.read 
                        ? 'bg-white dark:bg-gray-800' 
                        : 'bg-indigo-50 dark:bg-indigo-900/20'
                    } border border-gray-200 dark:border-gray-700 relative`}
                  >
                    <div className="flex">
                      <Avatar 
                        src={notification.message?.sender.avatar || ''} 
                        alt={notification.message?.sender.name || ''}
                        size="sm"
                      />
                      
                      <div className="ml-3 flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">
                          <span className="font-medium">{notification.message?.sender.name}</span>
                          {notification.type === 'message' && ' sent you a message'}
                          {notification.type === 'mention' && ' mentioned you in a message'}
                          {notification.type === 'reaction' && ' reacted to your message'}
                        </p>
                        
                        {notification.message && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                            {notification.message.content}
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    
                    {!notification.read && (
                      <button 
                        onClick={() => markNotificationAsRead(notification.id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                        aria-label="Mark as read"
                      >
                        <X size={16} />
                      </button>
                    )}
                    
                    {notification.read && (
                      <div className="absolute top-2 right-2 text-green-500 dark:text-green-400">
                        <CheckCircle size={16} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Settings</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Account</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                      <UserCircle size={20} className="text-gray-500 dark:text-gray-400" />
                      <span className="ml-3 text-sm text-gray-900 dark:text-white">Profile</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Edit your profile information
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                      <Bell size={20} className="text-gray-500 dark:text-gray-400" />
                      <span className="ml-3 text-sm text-gray-900 dark:text-white">Notifications</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Manage notification preferences
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                      <Settings size={20} className="text-gray-500 dark:text-gray-400" />
                      <span className="ml-3 text-sm text-gray-900 dark:text-white">Preferences</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Customize your experience
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Privacy & Security</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="ml-3 text-sm text-gray-900 dark:text-white">Privacy</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Manage privacy settings
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      <span className="ml-3 text-sm text-gray-900 dark:text-white">Security</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Change password and security options
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Appearance</h3>
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      <span className="ml-3 text-sm text-gray-900 dark:text-white">Theme</span>
                    </div>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;