'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCartStore } from '@/store/cart';
import { useIsMounted } from '@/hooks/useStore';
import { formatPrice } from '@/lib/formatting';
import { 
  ChevronLeft, 
  ChevronRight, 
  CreditCard, 
  Truck, 
  Shield, 
  Check,
  MapPin,
  Package,
  Lock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Mock saved addresses - would come from user profile
const savedAddresses = [
  {
    id: '1',
    label: 'Home',
    name: 'John Doe',
    phone: '+92 300 1234567',
    email: 'john.doe@example.com',
    address: '123 Street Name, Block A',
    city: 'Karachi',
    state: 'Sindh',
    postalCode: '75500',
    country: 'Pakistan',
    isDefault: true,
  },
];

const steps = [
  { id: 'shipping', label: 'Shipping', icon: MapPin },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'review', label: 'Review', icon: Package },
];

export default function CheckoutPage() {
  const router = useRouter();
  const isMounted = useIsMounted();
  const items = useCartStore((state) => state.items);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(
    savedAddresses.find((a) => a.isDefault)?.id || ''
  );
  const [isNewAddress, setIsNewAddress] = useState(savedAddresses.length === 0);
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [promoCode, setPromoCode] = useState('');

  const [shippingForm, setShippingForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Pakistan',
  });

  const subtotal = isMounted ? getSubtotal() : 0;
  const shippingCost = shippingMethod === 'express' ? 500 : subtotal >= 10000 ? 0 : 300;
  const total = subtotal + shippingCost;

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const getShippingAddress = () => {
    if (isNewAddress) {
      return {
        name: `${shippingForm.firstName} ${shippingForm.lastName}`,
        email: shippingForm.email,
        phone: shippingForm.phone,
        address: shippingForm.address,
        city: shippingForm.city,
        state: shippingForm.state,
        postalCode: shippingForm.postalCode,
        country: shippingForm.country,
      };
    }
    const addr = savedAddresses.find((a) => a.id === selectedAddress);
    return addr || null;
  };

  const canProceed = () => {
    if (currentStep === 0) {
      if (isNewAddress) {
        return (
          shippingForm.firstName &&
          shippingForm.lastName &&
          shippingForm.email &&
          shippingForm.phone &&
          shippingForm.address &&
          shippingForm.city
        );
      }
      return !!selectedAddress;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    setError('');

    const shippingAddress = getShippingAddress();
    if (!shippingAddress) {
      setError('Please provide a shipping address');
      setIsLoading(false);
      return;
    }

    try {
      if (paymentMethod === 'cod') {
        // COD checkout
        const response = await fetch('/api/checkout/cod', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items,
            shippingAddress,
            shippingMethod,
            promoCode: promoCode || undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to place order');
        }

        // Redirect to success page
        router.push(`/checkout/success?order_id=${data.orderId}`);
      } else {
        // Stripe checkout
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items,
            shippingAddress,
            shippingMethod,
            promoCode: promoCode || undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create checkout session');
        }

        // Redirect to Stripe checkout
        if (data.sessionUrl) {
          window.location.href = data.sessionUrl;
        } else {
          throw new Error('No checkout URL provided');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedAddressData = savedAddresses.find((a) => a.id === selectedAddress);

  // Loading state
  if (!isMounted) {
    return (
      <Container className="py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-brand-grey-200 rounded w-32 mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-12 bg-brand-grey-100 rounded" />
              <div className="h-64 bg-brand-grey-100 rounded-xl" />
            </div>
            <div className="h-80 bg-brand-grey-100 rounded-xl" />
          </div>
        </div>
      </Container>
    );
  }

  // Empty cart redirect
  if (items.length === 0) {
    return (
      <Container className="py-20">
        <div className="text-center max-w-md mx-auto">
          <Package className="w-16 h-16 mx-auto text-brand-grey-300 mb-6" />
          <h1 className="text-2xl font-display font-bold text-brand-black mb-4">
            Your cart is empty
          </h1>
          <p className="text-brand-grey-500 mb-8">
            Add some items to your cart before checking out.
          </p>
          <Link href="/shop">
            <Button size="lg">Start Shopping</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      {/* Back to Cart */}
      <Link
        href="/cart"
        className="inline-flex items-center text-brand-grey-500 hover:text-brand-black mb-6 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back to Cart
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                      index < currentStep
                        ? 'bg-green-500 text-white'
                        : index === currentStep
                        ? 'bg-brand-black text-white'
                        : 'bg-brand-grey-100 text-brand-grey-400'
                    )}
                  >
                    {index < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      'ml-3 font-medium hidden sm:block',
                      index === currentStep
                        ? 'text-brand-black'
                        : 'text-brand-grey-400'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'w-12 sm:w-24 h-0.5 mx-4',
                      index < currentStep ? 'bg-green-500' : 'bg-brand-grey-200'
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-red-700">Error</div>
                <div className="text-sm text-red-600">{error}</div>
              </div>
            </div>
          )}

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-brand-black">
                  Shipping Address
                </h2>

                {/* Saved Addresses */}
                {savedAddresses.length > 0 && !isNewAddress && (
                  <div className="space-y-3">
                    {savedAddresses.map((address) => (
                      <button
                        key={address.id}
                        onClick={() => setSelectedAddress(address.id)}
                        className={cn(
                          'w-full text-left p-4 border rounded-xl transition-colors',
                          selectedAddress === address.id
                            ? 'border-brand-black bg-brand-grey-50'
                            : 'border-brand-grey-200 hover:border-brand-grey-300'
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-brand-black">
                                {address.label}
                              </span>
                              {address.isDefault && (
                                <span className="text-xs text-green-600 font-medium">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-brand-grey-600">
                              <p>{address.name}</p>
                              <p>{address.address}</p>
                              <p>
                                {address.city}, {address.state} {address.postalCode}
                              </p>
                              <p>{address.phone}</p>
                            </div>
                          </div>
                          <div
                            className={cn(
                              'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                              selectedAddress === address.id
                                ? 'border-brand-black'
                                : 'border-brand-grey-300'
                            )}
                          >
                            {selectedAddress === address.id && (
                              <div className="w-2.5 h-2.5 rounded-full bg-brand-black" />
                            )}
                          </div>
                        </div>
                      </button>
                    ))}

                    <button
                      onClick={() => setIsNewAddress(true)}
                      className="w-full p-4 border border-dashed border-brand-grey-300 rounded-xl text-brand-grey-500 hover:text-brand-black hover:border-brand-grey-400 transition-colors"
                    >
                      + Add New Address
                    </button>
                  </div>
                )}

                {/* New Address Form */}
                {isNewAddress && (
                  <div className="space-y-4">
                    {savedAddresses.length > 0 && (
                      <button
                        onClick={() => setIsNewAddress(false)}
                        className="text-sm text-brand-grey-500 hover:text-brand-black"
                      >
                        ← Back to saved addresses
                      </button>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        name="firstName"
                        value={shippingForm.firstName}
                        onChange={handleShippingChange}
                        required
                      />
                      <Input
                        label="Last Name"
                        name="lastName"
                        value={shippingForm.lastName}
                        onChange={handleShippingChange}
                        required
                      />
                    </div>
                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      value={shippingForm.email}
                      onChange={handleShippingChange}
                      required
                    />
                    <Input
                      label="Phone"
                      name="phone"
                      type="tel"
                      value={shippingForm.phone}
                      onChange={handleShippingChange}
                      required
                    />
                    <Input
                      label="Street Address"
                      name="address"
                      value={shippingForm.address}
                      onChange={handleShippingChange}
                      required
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <Input
                        label="City"
                        name="city"
                        value={shippingForm.city}
                        onChange={handleShippingChange}
                        required
                      />
                      <Input
                        label="State"
                        name="state"
                        value={shippingForm.state}
                        onChange={handleShippingChange}
                      />
                      <Input
                        label="Postal Code"
                        name="postalCode"
                        value={shippingForm.postalCode}
                        onChange={handleShippingChange}
                      />
                    </div>
                  </div>
                )}

                {/* Shipping Method */}
                <div className="pt-6 border-t border-brand-grey-200">
                  <h3 className="font-semibold text-brand-black mb-4">
                    Shipping Method
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShippingMethod('standard')}
                      className={cn(
                        'w-full p-4 border rounded-xl flex items-center justify-between transition-colors',
                        shippingMethod === 'standard'
                          ? 'border-brand-black bg-brand-grey-50'
                          : 'border-brand-grey-200 hover:border-brand-grey-300'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-brand-grey-600" />
                        <div className="text-left">
                          <div className="font-medium text-brand-black">
                            Standard Shipping
                          </div>
                          <div className="text-sm text-brand-grey-500">
                            3-5 business days
                          </div>
                        </div>
                      </div>
                      <div className="font-medium text-brand-black">
                        {subtotal >= 10000 ? 'FREE' : formatPrice(300)}
                      </div>
                    </button>

                    <button
                      onClick={() => setShippingMethod('express')}
                      className={cn(
                        'w-full p-4 border rounded-xl flex items-center justify-between transition-colors',
                        shippingMethod === 'express'
                          ? 'border-brand-black bg-brand-grey-50'
                          : 'border-brand-grey-200 hover:border-brand-grey-300'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-brand-grey-600" />
                        <div className="text-left">
                          <div className="font-medium text-brand-black">
                            Express Shipping
                          </div>
                          <div className="text-sm text-brand-grey-500">
                            1-2 business days
                          </div>
                        </div>
                      </div>
                      <div className="font-medium text-brand-black">
                        {formatPrice(500)}
                      </div>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-brand-black">
                  Payment Method
                </h2>

                <div className="space-y-3">
                  {/* COD Option */}
                  <button
                    onClick={() => setPaymentMethod('cod')}
                    className={cn(
                      'w-full p-4 border rounded-xl flex items-center justify-between transition-colors',
                      paymentMethod === 'cod'
                        ? 'border-brand-black bg-brand-grey-50'
                        : 'border-brand-grey-200 hover:border-brand-grey-300'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-grey-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-brand-grey-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-brand-black">
                          Cash on Delivery
                        </div>
                        <div className="text-sm text-brand-grey-500">
                          Pay when you receive your order
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                        paymentMethod === 'cod'
                          ? 'border-brand-black'
                          : 'border-brand-grey-300'
                      )}
                    >
                      {paymentMethod === 'cod' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-black" />
                      )}
                    </div>
                  </button>

                  {/* Card Option */}
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={cn(
                      'w-full p-4 border rounded-xl flex items-center justify-between transition-colors',
                      paymentMethod === 'card'
                        ? 'border-brand-black bg-brand-grey-50'
                        : 'border-brand-grey-200 hover:border-brand-grey-300'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-grey-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-brand-grey-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-brand-black">
                          Credit / Debit Card
                        </div>
                        <div className="text-sm text-brand-grey-500">
                          Secure payment via Stripe
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                        paymentMethod === 'card'
                          ? 'border-brand-black'
                          : 'border-brand-grey-300'
                      )}
                    >
                      {paymentMethod === 'card' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-black" />
                      )}
                    </div>
                  </button>
                </div>

                {paymentMethod === 'card' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <Lock className="w-4 h-4" />
                      You'll be redirected to Stripe's secure checkout
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-brand-black">
                  Review Your Order
                </h2>

                {/* Shipping Address */}
                <div className="p-4 border border-brand-grey-200 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-brand-black">
                      Shipping Address
                    </h3>
                    <button
                      onClick={() => setCurrentStep(0)}
                      className="text-sm text-brand-grey-500 hover:text-brand-black"
                    >
                      Edit
                    </button>
                  </div>
                  {(isNewAddress ? getShippingAddress() : selectedAddressData) && (
                    <div className="text-sm text-brand-grey-600">
                      <p className="font-medium text-brand-black">
                        {isNewAddress
                          ? `${shippingForm.firstName} ${shippingForm.lastName}`
                          : selectedAddressData?.name}
                      </p>
                      <p>
                        {isNewAddress
                          ? shippingForm.address
                          : selectedAddressData?.address}
                      </p>
                      <p>
                        {isNewAddress
                          ? `${shippingForm.city}, ${shippingForm.state} ${shippingForm.postalCode}`
                          : `${selectedAddressData?.city}, ${selectedAddressData?.state} ${selectedAddressData?.postalCode}`}
                      </p>
                      <p>
                        {isNewAddress
                          ? shippingForm.phone
                          : selectedAddressData?.phone}
                      </p>
                    </div>
                  )}
                </div>

                {/* Shipping Method */}
                <div className="p-4 border border-brand-grey-200 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-brand-black">
                      Shipping Method
                    </h3>
                    <button
                      onClick={() => setCurrentStep(0)}
                      className="text-sm text-brand-grey-500 hover:text-brand-black"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="text-sm text-brand-grey-600">
                    {shippingMethod === 'express'
                      ? 'Express Shipping (1-2 business days)'
                      : 'Standard Shipping (3-5 business days)'}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="p-4 border border-brand-grey-200 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-brand-black">
                      Payment Method
                    </h3>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-sm text-brand-grey-500 hover:text-brand-black"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="text-sm text-brand-grey-600">
                    {paymentMethod === 'cod'
                      ? 'Cash on Delivery'
                      : 'Credit / Debit Card (Stripe)'}
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 border border-brand-grey-200 rounded-xl">
                  <h3 className="font-medium text-brand-black mb-4">
                    Order Items ({items.length})
                  </h3>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="relative w-16 h-16 bg-brand-grey-100 rounded-lg overflow-hidden shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-brand-grey-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-brand-black line-clamp-1">
                            {item.name}
                          </div>
                          <div className="text-sm text-brand-grey-500">
                            {item.size && `Size: ${item.size}`}
                            {item.size && item.color && ' • '}
                            {item.color && `Color: ${item.color}`}
                            {' • '}
                            Qty: {item.quantity}
                          </div>
                        </div>
                        <div className="font-medium text-brand-black">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-8 border-t border-brand-grey-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={cn(
                'flex items-center gap-2 text-brand-grey-500 hover:text-brand-black transition-colors',
                currentStep === 0 && 'invisible'
              )}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handlePlaceOrder}
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Place Order
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!canProceed()} size="lg">
                Continue
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-brand-grey-50 rounded-xl p-6">
            <h3 className="font-semibold text-brand-black mb-4">Order Summary</h3>

            {/* Items Preview */}
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 bg-brand-grey-200 rounded-lg overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-brand-grey-400" />
                      </div>
                    )}
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-black text-white text-xs rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-brand-black line-clamp-1">
                      {item.name}
                    </div>
                    <div className="text-xs text-brand-grey-500">
                      {item.size && item.size}
                      {item.size && item.color && ' / '}
                      {item.color && item.color}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-brand-black">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-3 pt-4 border-t border-brand-grey-200">
              <div className="flex justify-between text-sm">
                <span className="text-brand-grey-500">Subtotal</span>
                <span className="text-brand-black">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-brand-grey-500">Shipping</span>
                <span className="text-brand-black">
                  {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-3 border-t border-brand-grey-200">
                <span className="text-brand-black">Total</span>
                <span className="text-brand-black">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t border-brand-grey-200 space-y-3">
              <div className="flex items-center gap-2 text-sm text-brand-grey-500">
                <Shield className="w-4 h-4" />
                Secure checkout
              </div>
              <div className="flex items-center gap-2 text-sm text-brand-grey-500">
                <Truck className="w-4 h-4" />
                Free shipping over PKR 10,000
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
