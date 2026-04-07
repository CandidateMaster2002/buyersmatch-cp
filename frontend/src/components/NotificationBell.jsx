import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Clock, X } from 'lucide-react';
import { getNotifications, markNotificationRead, markAllNotificationsRead, getStoredUser } from '../api/client';
import { motion, AnimatePresence } from 'motion/react';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = getStoredUser();
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead(user.id);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-teal transition-colors relative group"
      >
        <Bell size={20} className="group-hover:rotate-12 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-gold text-navy text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-navy">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-navy border border-teal/20 rounded-2xl shadow-2xl z-[100] overflow-hidden"
          >
            <div className="p-4 border-b border-teal/10 flex items-center justify-between bg-white/5">
              <h3 className="font-bold text-white flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-gold/20 text-gold text-[10px] rounded-full uppercase tracking-widest">
                    {unreadCount} New
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  className="text-[10px] text-teal hover:text-white uppercase tracking-widest font-bold flex items-center gap-1 transition-colors"
                >
                  <CheckCheck size={12} />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto scrollbar-hide divide-y divide-teal/5">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs text-gray-500">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 bg-teal/5 rounded-full flex items-center justify-center text-teal/30 mx-auto mb-4">
                    <Bell size={24} />
                  </div>
                  <p className="text-sm text-gray-400 font-medium">No notifications yet</p>
                  <p className="text-xs text-gray-500 mt-1">We'll notify you when something happens.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-4 hover:bg-white/5 transition-colors relative group ${!n.read ? 'bg-teal/5' : ''}`}
                  >
                    {!n.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal"></div>
                    )}
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${!n.read ? 'bg-teal/20 text-teal' : 'bg-gray-800 text-gray-500'}`}>
                        <Clock size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className={`text-sm font-bold truncate ${!n.read ? 'text-white' : 'text-gray-400'}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-gray-500 whitespace-nowrap">
                            {formatTime(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                          {n.message}
                        </p>
                        {!n.read && (
                          <button 
                            onClick={() => handleMarkRead(n.id)}
                            className="mt-2 text-[10px] text-teal font-bold uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors"
                          >
                            <Check size={10} />
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-white/5 border-t border-teal/10 text-center">
              <button className="text-[10px] text-gray-500 hover:text-white uppercase tracking-widest font-bold transition-colors">
                View All Activity
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
