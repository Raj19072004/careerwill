import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Bell, Shield, Database, Mail, Globe, Palette, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'Auresta',
    siteDescription: 'Nurture Your Natural Beauty',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    emailNotifications: true,
    orderNotifications: true,
    reviewNotifications: true,
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    maxOrderAmount: 50000,
    minOrderAmount: 100,
    shippingFee: 50,
    freeShippingThreshold: 999,
    specialOfferEnabled: true,
    specialOfferThreshold: 3,
    specialOfferPrice: 999,
  });

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const settingSections = [
    {
      title: 'General Settings',
      icon: Settings,
      fields: [
        { key: 'siteName', label: 'Site Name', type: 'text' },
        { key: 'siteDescription', label: 'Site Description', type: 'text' },
        { key: 'currency', label: 'Currency', type: 'select', options: [
          { value: 'INR', label: 'Indian Rupee (₹)' },
          { value: 'USD', label: 'US Dollar ($)' },
          { value: 'EUR', label: 'Euro (€)' }
        ]},
        { key: 'timezone', label: 'Timezone', type: 'select', options: [
          { value: 'Asia/Kolkata', label: 'Asia/Kolkata' },
          { value: 'UTC', label: 'UTC' },
          { value: 'America/New_York', label: 'America/New_York' }
        ]},
      ]
    },
    {
      title: 'Notification Settings',
      icon: Bell,
      fields: [
        { key: 'emailNotifications', label: 'Email Notifications', type: 'checkbox' },
        { key: 'orderNotifications', label: 'Order Notifications', type: 'checkbox' },
        { key: 'reviewNotifications', label: 'Review Notifications', type: 'checkbox' },
      ]
    },
    {
      title: 'Security Settings',
      icon: Shield,
      fields: [
        { key: 'maintenanceMode', label: 'Maintenance Mode', type: 'checkbox' },
        { key: 'allowRegistration', label: 'Allow User Registration', type: 'checkbox' },
        { key: 'requireEmailVerification', label: 'Require Email Verification', type: 'checkbox' },
      ]
    },
    {
      title: 'E-commerce Settings',
      icon: IndianRupee,
      fields: [
        { key: 'maxOrderAmount', label: 'Maximum Order Amount (₹)', type: 'number' },
        { key: 'minOrderAmount', label: 'Minimum Order Amount (₹)', type: 'number' },
        { key: 'shippingFee', label: 'Shipping Fee (₹)', type: 'number' },
        { key: 'freeShippingThreshold', label: 'Free Shipping Threshold (₹)', type: 'number' },
      ]
    },
    {
      title: 'Special Offers',
      icon: Palette,
      fields: [
        { key: 'specialOfferEnabled', label: 'Enable Special Offer', type: 'checkbox' },
        { key: 'specialOfferThreshold', label: 'Minimum Items for Offer', type: 'number' },
        { key: 'specialOfferPrice', label: 'Special Offer Price (₹)', type: 'number' },
      ]
    }
  ];

  const handleInputChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-playfair font-bold text-gray-800">
          Admin Settings
        </h2>
        <motion.button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-inter font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={18} />
          )}
          Save Settings
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {settingSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            className="bg-white rounded-2xl p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-100 rounded-lg">
                <section.icon className="w-5 h-5 text-primary-600" />
              </div>
              <h3 className="text-lg font-playfair font-semibold text-gray-800">
                {section.title}
              </h3>
            </div>

            <div className="space-y-4">
              {section.fields.map((field, fieldIndex) => (
                <div key={field.key}>
                  <label className="block text-sm font-inter font-medium text-gray-700 mb-2">
                    {field.label}
                  </label>
                  
                  {field.type === 'text' && (
                    <input
                      type="text"
                      value={settings[field.key as keyof typeof settings] as string}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
                    />
                  )}

                  {field.type === 'number' && (
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="number"
                        value={settings[field.key as keyof typeof settings] as number}
                        onChange={(e) => handleInputChange(field.key, Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
                      />
                    </div>
                  )}

                  {field.type === 'select' && (
                    <select
                      value={settings[field.key as keyof typeof settings] as string}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
                    >
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {field.type === 'checkbox' && (
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings[field.key as keyof typeof settings] as boolean}
                        onChange={(e) => handleInputChange(field.key, e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-600 font-inter">
                        {field.label}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Special Offer Preview */}
      <motion.div
        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-6 h-6" />
          <h3 className="text-lg font-playfair font-semibold">
            Special Offer Preview
          </h3>
        </div>
        
        {settings.specialOfferEnabled ? (
          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
            <p className="font-inter text-lg font-semibold mb-2">
              🎉 Buy Any {settings.specialOfferThreshold}+ Products for ₹{settings.specialOfferPrice}
            </p>
            <p className="font-inter text-sm opacity-90">
              This offer will be displayed to customers when they have {settings.specialOfferThreshold} or more items in their cart.
            </p>
          </div>
        ) : (
          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
            <p className="font-inter text-lg">
              Special offer is currently disabled
            </p>
          </div>
        )}
      </motion.div>

      {/* System Information */}
      <motion.div
        className="bg-white rounded-2xl p-6 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Database className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-playfair font-semibold text-gray-800">
            System Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600 font-inter">Version</p>
            <p className="text-lg font-playfair font-bold text-gray-800">1.0.0</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600 font-inter">Database</p>
            <p className="text-lg font-playfair font-bold text-gray-800">PostgreSQL</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600 font-inter">Storage</p>
            <p className="text-lg font-playfair font-bold text-gray-800">Supabase</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600 font-inter">Status</p>
            <p className="text-lg font-playfair font-bold text-green-600">Online</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSettings;