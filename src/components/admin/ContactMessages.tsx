import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Clock, CheckCircle, Reply, Trash2, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
}

const ContactMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      toast.error('Failed to fetch messages');
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      
      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, status: status as any } : msg
      ));
      
      toast.success(`Message marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update message status');
    }
  };

  const deleteMessage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setMessages(prev => prev.filter(msg => msg.id !== id));
      setSelectedMessage(null);
      toast.success('Message deleted successfully');
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'read':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'replied':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread':
        return 'bg-yellow-100 text-yellow-800';
      case 'read':
        return 'bg-blue-100 text-blue-800';
      case 'replied':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-playfair font-bold text-gray-800">
          Contact Messages
        </h2>
        <div className="flex gap-4 text-sm font-inter">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-500" />
            Unread: {messages.filter(m => m.status === 'unread').length}
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Replied: {messages.filter(m => m.status === 'replied').length}
          </span>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-2">
            No Messages Yet
          </h3>
          <p className="text-gray-600 font-inter">
            Contact messages will appear here when customers reach out.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Messages List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  selectedMessage?.id === message.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                } ${message.status === 'unread' ? 'ring-2 ring-yellow-200' : ''}`}
                onClick={() => {
                  setSelectedMessage(message);
                  if (message.status === 'unread') {
                    updateMessageStatus(message.id, 'read');
                  }
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-inter font-semibold text-gray-800">
                      {message.name}
                    </h3>
                    {getStatusIcon(message.status)}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-inter ${getStatusColor(message.status)}`}>
                    {message.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 font-inter mb-2">
                  {message.email}
                </p>
                <p className="text-sm font-inter font-medium text-gray-800 mb-2">
                  {message.subject}
                </p>
                <p className="text-sm text-gray-600 font-inter line-clamp-2">
                  {message.message}
                </p>
                <p className="text-xs text-gray-500 font-inter mt-2">
                  {new Date(message.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Message Detail */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {selectedMessage ? (
              <div>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-playfair font-bold text-gray-800 mb-2">
                      {selectedMessage.subject}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 font-inter">
                      <span>From: {selectedMessage.name}</span>
                      <span>•</span>
                      <span>{selectedMessage.email}</span>
                    </div>
                    <p className="text-sm text-gray-500 font-inter mt-1">
                      {new Date(selectedMessage.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-inter ${getStatusColor(selectedMessage.status)}`}>
                    {selectedMessage.status}
                  </span>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-inter font-semibold text-gray-700 mb-2">
                    Message:
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800 font-inter leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => updateMessageStatus(selectedMessage.id, 'replied')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-inter font-medium hover:bg-green-700 transition-colors duration-200"
                  >
                    <Reply size={16} />
                    Mark as Replied
                  </button>
                  <button
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-inter font-medium hover:bg-red-700 transition-colors duration-200"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-inter font-medium hover:bg-primary-700 transition-colors duration-200"
                  >
                    <Mail size={16} />
                    Reply via Email
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-2">
                  Select a Message
                </h3>
                <p className="text-gray-600 font-inter">
                  Click on a message from the list to view details.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessages;