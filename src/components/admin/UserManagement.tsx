import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, MoreVertical, Mail, Phone, Calendar, Shield, Crown, User as UserIcon, Edit3, Save, X, Trash2, AlertCircle } from 'lucide-react';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const { users, loading, error, fetchUsers, updateUserRole, deleteUser } = useAdminUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState('all');

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const { error } = await updateUserRole(userId, newRole);
    if (error) {
      toast.error(`Failed to update user role: ${error}`);
    } else {
      toast.success(`User role updated to ${newRole}`);
      setEditingUser(null);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    const { error } = await deleteUser(userId);
    if (error) {
      toast.error(`Failed to delete user: ${error}`);
    } else {
      toast.success('User deleted successfully');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const userStats = [
    { 
      name: 'Total Users', 
      value: users.length, 
      icon: Users, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      name: 'Regular Users', 
      value: users.filter(u => u.role === 'user').length, 
      icon: UserIcon, 
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      name: 'Admins', 
      value: users.filter(u => u.role === 'admin').length, 
      icon: Crown, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    { 
      name: 'Verified Users', 
      value: users.filter(u => u.email_confirmed_at).length, 
      icon: Shield, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-2">
          Error Loading Users
        </h3>
        <p className="text-red-600 font-inter mb-4">{error}</p>
        <button
          onClick={fetchUsers}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg font-inter font-medium hover:bg-primary-700 transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-playfair font-bold text-gray-800">
          User Management
        </h2>
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-inter font-medium hover:bg-primary-700 transition-colors duration-200"
        >
          Refresh
        </button>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {userStats.map((stat, index) => (
          <motion.div
            key={stat.name}
            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-inter text-gray-600">{stat.name}</p>
                <p className="text-2xl font-playfair font-bold text-gray-800 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-inter"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-inter font-semibold text-gray-800">User</th>
                <th className="text-left py-3 px-4 font-inter font-semibold text-gray-800">Contact</th>
                <th className="text-left py-3 px-4 font-inter font-semibold text-gray-800">Role</th>
                <th className="text-left py-3 px-4 font-inter font-semibold text-gray-800">Status</th>
                <th className="text-left py-3 px-4 font-inter font-semibold text-gray-800">Joined</th>
                <th className="text-left py-3 px-4 font-inter font-semibold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-sage-400 rounded-full flex items-center justify-center text-white font-inter font-medium">
                        {(user.first_name?.[0] || user.email[0])?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-inter font-medium text-gray-800">
                          {user.first_name || user.last_name 
                            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                            : 'No name set'
                          }
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={14} />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {editingUser === user.id ? (
                      <div className="flex items-center gap-2">
                        <select
                          defaultValue={user.role}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-inter"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() => setEditingUser(null)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-inter font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                        <button
                          onClick={() => setEditingUser(user.id)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <Edit3 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-inter font-medium ${
                      user.email_confirmed_at 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.email_confirmed_at ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-600 font-inter">
                      {new Date(user.created_at).toLocaleDateString('en-IN')}
                    </div>
                    {user.last_sign_in_at && (
                      <div className="text-xs text-gray-500 font-inter">
                        Last login: {new Date(user.last_sign_in_at).toLocaleDateString('en-IN')}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteUser(user.id, user.first_name || user.email)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete user"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                        <MoreVertical size={16} className="text-gray-600" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-playfair font-semibold text-gray-800 mb-2">
              No Users Found
            </h3>
            <p className="text-gray-600 font-inter">
              {searchTerm || filterRole !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No users have registered yet.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;