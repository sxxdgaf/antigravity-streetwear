'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Bell, 
  Lock, 
  Globe, 
  Trash2, 
  Shield, 
  Mail, 
  Smartphone,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    newsletter: false,
    sms: false,
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement password change
    console.log('Change password');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-2xl font-display font-bold text-brand-black mb-2">
          Settings
        </h1>
        <p className="text-brand-grey-500">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Notifications Section */}
      <section className="border border-brand-grey-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-brand-grey-50 border-b border-brand-grey-200">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-brand-grey-600" />
            <h2 className="font-semibold text-brand-black">Notifications</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {[
            {
              key: 'orderUpdates',
              icon: Mail,
              label: 'Order Updates',
              description: 'Receive email notifications about your orders',
            },
            {
              key: 'promotions',
              icon: Mail,
              label: 'Promotions & Offers',
              description: 'Get notified about sales and special offers',
            },
            {
              key: 'newsletter',
              icon: Mail,
              label: 'Newsletter',
              description: 'Weekly updates on new arrivals and trends',
            },
            {
              key: 'sms',
              icon: Smartphone,
              label: 'SMS Notifications',
              description: 'Receive order updates via SMS',
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-3"
            >
              <div className="flex items-start gap-3">
                <item.icon className="w-5 h-5 text-brand-grey-400 mt-0.5" />
                <div>
                  <div className="font-medium text-brand-black">{item.label}</div>
                  <div className="text-sm text-brand-grey-500">
                    {item.description}
                  </div>
                </div>
              </div>
              <button
                onClick={() =>
                  handleNotificationChange(item.key as keyof typeof notifications)
                }
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors',
                  notifications[item.key as keyof typeof notifications]
                    ? 'bg-brand-black'
                    : 'bg-brand-grey-300'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                    notifications[item.key as keyof typeof notifications]
                      ? 'left-7'
                      : 'left-1'
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Password Section */}
      <section className="border border-brand-grey-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-brand-grey-50 border-b border-brand-grey-200">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-brand-grey-600" />
            <h2 className="font-semibold text-brand-black">Change Password</h2>
          </div>
        </div>
        <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
          <div className="relative">
            <Input
              label="Current Password"
              name="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-9 text-brand-grey-400 hover:text-brand-grey-600"
            >
              {showCurrentPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="relative">
            <Input
              label="New Password"
              name="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-9 text-brand-grey-400 hover:text-brand-grey-600"
            >
              {showNewPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
          />

          <Button type="submit">Update Password</Button>
        </form>
      </section>

      {/* Language & Region */}
      <section className="border border-brand-grey-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-brand-grey-50 border-b border-brand-grey-200">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-brand-grey-600" />
            <h2 className="font-semibold text-brand-black">Language & Region</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-black mb-2">
              Language
            </label>
            <select className="w-full px-4 py-3 border border-brand-grey-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-black">
              <option value="en">English</option>
              <option value="ur">Urdu</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-black mb-2">
              Currency
            </label>
            <select className="w-full px-4 py-3 border border-brand-grey-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-black">
              <option value="PKR">PKR - Pakistani Rupee</option>
              <option value="USD">USD - US Dollar</option>
            </select>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="border border-brand-grey-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-brand-grey-50 border-b border-brand-grey-200">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-brand-grey-600" />
            <h2 className="font-semibold text-brand-black">Security</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-medium text-brand-black">
                Two-Factor Authentication
              </div>
              <div className="text-sm text-brand-grey-500">
                Add an extra layer of security to your account
              </div>
            </div>
            <Button variant="secondary" size="sm">
              Enable
            </Button>
          </div>
        </div>
      </section>

      {/* Delete Account */}
      <section className="border border-red-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5 text-red-600" />
            <h2 className="font-semibold text-red-600">Danger Zone</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-brand-black">Delete Account</div>
              <div className="text-sm text-brand-grey-500">
                Permanently delete your account and all data
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </Button>
          </div>

          {showDeleteConfirm && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-red-600 mb-1">
                    Are you absolutely sure?
                  </div>
                  <div className="text-sm text-red-600/80 mb-4">
                    This action cannot be undone. This will permanently delete your
                    account and remove your data from our servers.
                  </div>
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Yes, Delete My Account
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
