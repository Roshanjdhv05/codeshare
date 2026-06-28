import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { socketService } from '../lib/socket';
import { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];
type Friendship = Database['public']['Tables']['friendships']['Row'];

interface ChatParticipant extends Profile {
  friend_id: string;
  last_message_content?: string;
  last_message_time?: string;
  unread_count?: number;
  isOnline?: boolean;
}

interface ChatContextType {
  notifications: Notification[];
  chatParticipants: ChatParticipant[];
  friendships: Friendship[];
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  fetchChatHistory: (participantId: string) => Promise<Message[]>;
  fetchChatParticipants: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  respondToFriendRequest: (friendshipId: string, action: 'accept' | 'reject') => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  isConnected: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chatParticipants, setChatParticipants] = useState<ChatParticipant[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      socketService.connect(user.id);
      setIsConnected(true);

      // Listen for new messages using correct Socket.IO API
      socketService.on('message', (message: Message) => {
        console.log('Received new message:', message);
        fetchChatParticipants();
      });

      // Listen for new notifications using correct Socket.IO API
      socketService.on('notification', (notification: Notification) => {
        console.log('Received new notification:', notification);
        setNotifications(prev => [notification, ...prev]);
      });

      return () => {
        socketService.disconnect();
        setIsConnected(false);
      };
    }
  }, [user]);

  // Fetch initial data
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchChatParticipants();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchChatParticipants = async () => {
    if (!user) return;

    try {
      console.log('Fetching chat participants for user:', user.id);

      // Get all friendships with friend details
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select(`
          id,
          status,
          sender_id,
          receiver_id,
          sender:profiles!friendships_sender_id_fkey(id, username, full_name, avatar_url, bio),
          receiver:profiles!friendships_receiver_id_fkey(id, username, full_name, avatar_url, bio)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (friendshipsError) {
        console.error('Error fetching friendships:', friendshipsError);
        setChatParticipants([]);
        setFriendships([]);
        return;
      }

      console.log('Fetched friendships:', friendships);

      if (!friendships || friendships.length === 0) {
        console.log('No friendships found');
        setChatParticipants([]);
        setFriendships([]);
        return;
      }

      // Store all friendships
      setFriendships(friendships);

      // Process friendships to get chat participants
      const participants: ChatParticipant[] = [];

      // Only process accepted friendships for chat participants
      const acceptedFriendships = friendships.filter(f => f.status === 'accepted');
      
      for (const friendship of acceptedFriendships) {
        const friend = friendship.sender_id === user.id 
          ? friendship.receiver 
          : friendship.sender;

        if (friend) {
          // Get last message between users (without .single() to avoid error when no messages)
          const { data: lastMessages } = await supabase
            .from('messages')
            .select('content, created_at')
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friend.id}),and(sender_id.eq.${friend.id},receiver_id.eq.${user.id})`)
            .order('created_at', { ascending: false })
            .limit(1);

          const lastMessage = lastMessages && lastMessages.length > 0 ? lastMessages[0] : null;

          // Get unread count (messages from friend to user)
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', friend.id)
            .eq('receiver_id', user.id);

          participants.push({
            ...friend,
            friend_id: friend.id,
            last_message_content: lastMessage?.content || undefined,
            last_message_time: lastMessage?.created_at || undefined,
            unread_count: unreadCount || 0,
            isOnline: false // Will be updated by socket events
          });
        }
      }

      console.log('Chat participants:', participants);
      setChatParticipants(participants);
    } catch (error) {
      console.error('Error fetching chat participants:', error);
      setChatParticipants([]);
    }
  };

  const sendMessage = async (receiverId: string, content: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content
        })
        .select()
        .single();

      if (error) throw error;

      // Emit through socket using correct Socket.IO API
      socketService.emit('message', data);

      // Create notification for receiver
      await supabase
        .from('notifications')
        .insert({
          user_id: receiverId,
          type: 'message',
          reference_id: data.id
        });

      // Refresh chat participants to update last message
      await fetchChatParticipants();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const fetchChatHistory = async (participantId: string): Promise<Message[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${participantId}),and(sender_id.eq.${participantId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const respondToFriendRequest = async (friendshipId: string, action: 'accept' | 'reject') => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
        .eq('id', friendshipId);

      if (error) throw error;

      // Refresh data
      await Promise.all([
        fetchNotifications(),
        fetchChatParticipants()
      ]);
    } catch (error) {
      console.error('Error responding to friend request:', error);
      throw error;
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${user.id})`);

      if (error) throw error;

      await fetchChatParticipants();
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  };

  const refreshData = async () => {
    await Promise.all([
      fetchNotifications(),
      fetchChatParticipants()
    ]);
  };

  const value: ChatContextType = {
    notifications,
    chatParticipants,
    friendships,
    sendMessage,
    fetchChatHistory,
    fetchChatParticipants,
    markNotificationAsRead,
    respondToFriendRequest,
    removeFriend,
    refreshData,
    isConnected
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};