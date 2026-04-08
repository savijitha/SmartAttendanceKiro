import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;

    socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join-room', user._id);
    });

    socketRef.current.on('notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
      toast(notif.title, {
        icon: notif.type === 'absent_alert' ? '❌' : notif.type === 'attendance_confirmed' ? '✅' : '🔔',
        duration: 5000,
      });
    });

    return () => socketRef.current?.disconnect();
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, notifications, setNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
