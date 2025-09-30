import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Smartphone, Globe, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const PaymentTab = ({ icon: Icon, label, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'flex-1 flex items-center justify-center gap-2 p-4 text-sm font-semibold border-b-4 transition-all duration-300',
      isSelected ? 'border-[#FF6F00] text-[#002B5B]' : 'border-transparent text-gray-500 hover:bg-gray-100'
    )}
  >
    <Icon className="h-5 w-5" />
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const PaymentMethods = () => {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const { toast } = useToast();

  const handleManualUpload = (e) => {
    e.preventDefault();
    toast({
      title: 'Receipt Submitted!',
      description: 'Your payment proof has been uploaded for verification.',
    });
  }
  
  const handlePayment = (e) => {
    e.preventDefault();
     toast({
      title: '🚧 Payment Processing...',
      description: 'This is a mock payment. No real transaction will occur.',
    });
  };

  const paymentContent = {
    card: (
      <form onSubmit={handlePayment} className="space-y-4">
        <div>
          <Label htmlFor="card-name">Name on card</Label>
          <Input id="card-name" placeholder="John Doe" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="card-number">Card number</Label>
          <Input id="card-number" placeholder="**** **** **** 1234" className="mt-1" />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="expiry">Expiry date</Label>
            <Input id="expiry" placeholder="MM/YY" className="mt-1" />
          </div>
          <div className="flex-1">
            <Label htmlFor="cvv">CVV</Label>
            <Input id="cvv" placeholder="123" className="mt-1" />
          </div>
        </div>
        <div className="flex justify-end items-center gap-2 pt-2">
            <img src="https://js.stripe.com/v3/fingerprinted/img/visa-d6c6e51a6dfb38f836fee02f43c52e63.svg" alt="Visa" className="h-6" />
            <img src="https://js.stripe.com/v3/fingerprinted/img/mastercard-4d8844094130711885b5e41b28c9848f.svg" alt="Mastercard" className="h-6" />
        </div>
      </form>
    ),
    mobile: (
      <form onSubmit={handlePayment} className="space-y-4">
        <div>
          <Label htmlFor="country">Country</Label>
          <Select>
            <SelectTrigger id="country" className="mt-1">
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cm">🇨🇲 Cameroon (MTN/Orange)</SelectItem>
              <SelectItem value="ci">🇨🇮 Côte d’Ivoire (MTN/Orange)</SelectItem>
              <SelectItem value="gh">🇬🇭 Ghana (MTN)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="mobile-number">Mobile Number</Label>
          <Input id="mobile-number" type="tel" placeholder="e.g. 671234567" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="mobile-name">Name</Label>
          <Input id="mobile-name" placeholder="John Doe" className="mt-1" />
        </div>
        <p className="text-xs text-gray-500 pt-2">You will receive a prompt on your phone to confirm the payment by entering your PIN.</p>
      </form>
    ),
    manual: (
      <form onSubmit={handleManualUpload} className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-[#002B5B]">Payment Instructions</h4>
          <p className="text-sm text-gray-700 mt-2">
            Please send your payment through WorldRemit or Sendwave to the details below. Once sent, upload a screenshot or PDF of your receipt.
          </p>
          <div className="mt-3 text-sm space-y-1">
            <p><strong>Recipient:</strong> DomusBuilder Hub Inc.</p>
            <p><strong>Email:</strong> payments@domusbuilder.com</p>
          </div>
        </div>
        <div>
          <Label htmlFor="proof">Upload Proof of Payment</Label>
          <div className="mt-1 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
              <div className="mt-4 flex text-sm leading-6 text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-white font-semibold text-[#002B5B] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#FF6F00] focus-within:ring-offset-2 hover:text-[#FF6F00]"
                >
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs leading-5 text-gray-600">PNG, JPG, PDF up to 10MB</p>
            </div>
          </div>
        </div>
      </form>
    ),
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-[#002B5B] mb-2">2. Payment Method</h2>
      <p className="text-gray-600 mb-6">Choose how you'd like to pay.</p>

      <div className="flex border-b border-gray-200 mb-6">
        <PaymentTab icon={CreditCard} label="Credit/Debit Card" isSelected={selectedMethod === 'card'} onClick={() => setSelectedMethod('card')} />
        <PaymentTab icon={Smartphone} label="Mobile Money" isSelected={selectedMethod === 'mobile'} onClick={() => setSelectedMethod('mobile')} />
        <PaymentTab icon={Globe} label="WorldRemit/Sendwave" isSelected={selectedMethod === 'manual'} onClick={() => setSelectedMethod('manual')} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selectedMethod}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {paymentContent[selectedMethod]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PaymentMethods;