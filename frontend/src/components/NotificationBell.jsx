import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Clock } from 'lucide-react';
import { getNotifications, getUnreadCount, markAllRead, markOneRead, getStoredUser } from '../api/client';
import { anonymizeNotification } from '../utils/anonymize';
import { motion, AnimatePresence } from 'motion/react';

const formatTimeAgo = (dateString) => {
  const diffInSeconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (diffInSeconds < 60)    return 'Just now';
  if (diffInSeconds < 3600)  return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const user = getStoredUser();
  const zohoContactId = user?.zohoContactId;

  // Poll unread count every 60 seconds
  useEffect(() => {
    if (!zohoContactId) return;
    const fetchCount = async () => {
      try {
        const count = await getUnreadCount(zohoContactId);
        setUnreadCount(count);
      } catch (e) {
        console.error('Failed to fetch unread count:', e);
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, [zohoContactId]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBellClick = async () => {
    const opening = !isOpen;
    setIsOpen(opening);
    if (!opening || !zohoContactId) return;

    try {
      const result = await getNotifications(zohoContactId);
      setNotifications((result.data ?? []).map(n => anonymizeNotification(n)));
      await markAllRead(zohoContactId);
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
  };

  const handleMarkOne = async (id) => {
    try {
      await markOneRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error('Failed to mark notification read:', e);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleBellClick}
        className="p-2 text-gray-400 hover:text-sage transition-colors relative group"
      >
        <Bell size={20} className="group-hover:rotate-12 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-gold text-forest text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-forest">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-forest border border-sage/20 rounded-2xl shadow-2xl z-[100] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-sage/10 flex items-center justify-between bg-white/5">
              <h3 className="font-bold text-white">Notifications</h3>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto scrollbar-hide divide-y divide-sage/5">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 bg-sage/5 rounded-full flex items-center justify-center text-sage/30 mx-auto mb-4">
                    <Bell size={24} />
                  </div>
                  <p className="text-sm text-gray-400 font-medium">No notifications yet</p>
                  <p className="text-xs text-gray-500 mt-1">We'll notify you when something happens.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 hover:bg-white/5 transition-colors relative group ${!n.isRead ? 'bg-sage/10' : 'bg-transparent'}`}
                  >
                    {!n.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-sage rounded-l-2xl" />
                    )}
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${!n.isRead ? 'bg-sage/20 text-sage' : 'bg-gray-800 text-gray-500'}`}>
                        <Clock size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className={`text-sm font-bold truncate ${!n.isRead ? 'text-white' : 'text-gray-400'}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-gray-500 whitespace-nowrap">
                            {formatTimeAgo(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                          {n.message}
                        </p>
                        {!n.isRead && (
                          <button
                            onClick={() => handleMarkOne(n.id)}
                            className="mt-2 text-[10px] text-sage font-bold uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
