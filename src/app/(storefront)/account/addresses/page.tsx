'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  Home, 
  Building, 
  CheckCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Address {
  id: string;
  label: string;
  type: 'home' | 'office' | 'other';
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

const mockAddresses: Address[] = [
  {
    id: '1',
    label: 'Home',
    type: 'home',
    name: 'John Doe',
    phone: '+92 300 1234567',
    address: '123 Street Name, Block A',
    city: 'Karachi',
    state: 'Sindh',
    postalCode: '75500',
    country: 'Pakistan',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Office',
    type: 'office',
    name: 'John Doe',
    phone: '+92 321 7654321',
    address: 'Floor 5, Tower B, Business Bay',
    city: 'Karachi',
    state: 'Sindh',
    postalCode: '75600',
    country: 'Pakistan',
    isDefault: false,
  },
];

const addressTypes = [
  { value: 'home', label: 'Home', icon: Home },
  { value: 'office', label: 'Office', icon: Building },
  { value: 'other', label: 'Other', icon: MapPin },
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    type: 'home' as 'home' | 'office' | 'other',
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Pakistan',
    isDefault: false,
  });

  const handleOpenModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        label: address.label,
        type: address.type,
        name: address.name,
        phone: address.phone,
        address: address.address,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        isDefault: address.isDefault,
      });
    } else {
      setEditingAddress(null);
      setFormData({
        label: '',
        type: 'home',
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Pakistan',
        isDefault: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAddress) {
      // Update existing address
      setAddresses((prev) =>
        prev.map((addr) =>
          addr.id === editingAddress.id
            ? { ...addr, ...formData }
            : formData.isDefault
            ? { ...addr, isDefault: false }
            : addr
        )
      );
    } else {
      // Add new address
      const newAddress: Address = {
        id: Date.now().toString(),
        ...formData,
      };
      setAddresses((prev) =>
        formData.isDefault
          ? [newAddress, ...prev.map((a) => ({ ...a, isDefault: false }))]
          : [...prev, newAddress]
      );
    }

    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
    }
  };

  const handleSetDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-brand-black mb-2">
            Saved Addresses
          </h1>
          <p className="text-brand-grey-500">
            Manage your delivery addresses
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Address
        </Button>
      </div>

      {/* Addresses Grid */}
      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 mx-auto text-brand-grey-300 mb-6" />
          <h2 className="text-xl font-semibold text-brand-black mb-2">
            No addresses saved
          </h2>
          <p className="text-brand-grey-500 mb-6">
            Add an address to make checkout faster.
          </p>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {addresses.map((address) => {
              const TypeIcon = addressTypes.find((t) => t.value === address.type)?.icon || MapPin;

              return (
                <motion.div
                  key={address.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    'relative border rounded-xl p-5 transition-colors',
                    address.isDefault
                      ? 'border-brand-black bg-brand-grey-50'
                      : 'border-brand-grey-200 hover:border-brand-grey-300'
                  )}
                >
                  {/* Default Badge */}
                  {address.isDefault && (
                    <span className="absolute top-3 right-3 flex items-center gap-1 text-xs font-medium text-green-600">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Default
                    </span>
                  )}

                  {/* Address Type */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-brand-grey-100 flex items-center justify-center">
                      <TypeIcon className="w-4 h-4 text-brand-grey-600" />
                    </div>
                    <span className="font-semibold text-brand-black">
                      {address.label}
                    </span>
                  </div>

                  {/* Address Details */}
                  <div className="text-sm text-brand-grey-600 space-y-1">
                    <p className="font-medium text-brand-black">{address.name}</p>
                    <p>{address.address}</p>
                    <p>
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p>{address.country}</p>
                    <p className="pt-1">{address.phone}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-brand-grey-200">
                    <button
                      onClick={() => handleOpenModal(address)}
                      className="flex items-center gap-1 text-sm text-brand-grey-600 hover:text-brand-black transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="flex items-center gap-1 text-sm text-brand-grey-600 hover:text-brand-black transition-colors ml-auto"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={handleCloseModal}
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-brand-grey-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-brand-black">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-brand-grey-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Address Type */}
                <div>
                  <label className="block text-sm font-medium text-brand-black mb-2">
                    Address Type
                  </label>
                  <div className="flex gap-3">
                    {addressTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            type: type.value as 'home' | 'office' | 'other',
                            label: type.label,
                          }))
                        }
                        className={cn(
                          'flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors',
                          formData.type === type.value
                            ? 'border-brand-black bg-brand-grey-50'
                            : 'border-brand-grey-200 hover:border-brand-grey-300'
                        )}
                      >
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Street Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="State / Province"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Postal Code"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Default Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-brand-grey-300 text-brand-black focus:ring-brand-black"
                  />
                  <span className="text-sm text-brand-grey-600">
                    Set as default address
                  </span>
                </label>

                {/* Submit */}
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingAddress ? 'Save Changes' : 'Add Address'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
