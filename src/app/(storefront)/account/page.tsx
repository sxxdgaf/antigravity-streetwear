'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Camera, Save } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock user data - will be replaced with actual auth
const mockUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+92 300 1234567',
  avatar: null,
  joinedDate: 'January 2024',
};

export default function AccountPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: mockUser.email,
    phone: mockUser.phone,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement save profile
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-brand-black mb-2">
          My Profile
        </h1>
        <p className="text-brand-grey-500">
          Manage your personal information and preferences
        </p>
      </div>

      {/* Avatar Section */}
      <div className="bg-brand-grey-50 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-brand-grey-200 rounded-full overflow-hidden">
              {mockUser.avatar ? (
                <Image
                  src={mockUser.avatar}
                  alt={mockUser.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-brand-grey-400">
                  {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                </div>
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-brand-black text-white rounded-full flex items-center justify-center hover:bg-brand-grey-800 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h3 className="font-semibold text-brand-black">
              {formData.firstName} {formData.lastName}
            </h3>
            <p className="text-sm text-brand-grey-500">
              Member since {mockUser.joinedDate}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            disabled={!isEditing}
          />
          <Input
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>

        <Input
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          disabled={!isEditing}
        />

        <Input
          label="Phone Number"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          disabled={!isEditing}
        />

        <div className="flex items-center gap-4 pt-4">
          {isEditing ? (
            <>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button type="button" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </form>

      {/* Account Stats */}
      <div className="mt-12 pt-8 border-t border-brand-grey-200">
        <h3 className="font-semibold text-brand-black mb-6">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: '12' },
            { label: 'Wishlist Items', value: '5' },
            { label: 'Reviews Given', value: '3' },
            { label: 'Reward Points', value: '250' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-brand-grey-50 rounded-lg p-4 text-center"
            >
              <div className="text-2xl font-bold text-brand-black">
                {stat.value}
              </div>
              <div className="text-sm text-brand-grey-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
