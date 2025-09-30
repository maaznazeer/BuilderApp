import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const OrderSummary = ({ plan, billingCycle }) => {
  const { user, updatePlan } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isLifetime = plan.name.toLowerCase() === 'lifetime';
  const price = isLifetime
    ? plan.price.monthly
    : billingCycle === 'yearly'
    ? plan.price.yearly
    : plan.price.monthly;

  const handleCheckout = (e) => {
    e.preventDefault();
    // This is a mock checkout process
    updatePlan(plan.name);
    toast({
      title: 'Purchase Successful!',
      description: `You are now subscribed to the ${plan.name} plan.`,
    });
    navigate('/dashboard');
  };
  
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const coupon = e.target.coupon.value;
    if (coupon) {
      toast({
        title: 'Coupon Applied!',
        description: `Coupon "${coupon}" has been applied. (Demo)`,
      });
    } else {
       toast({
        title: 'Invalid Coupon',
        description: 'Please enter a valid coupon code.',
        variant: 'destructive'
      });
    }
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-md sticky top-24">
      <h3 className="text-2xl font-bold text-[#002B5B] border-b pb-4 mb-4">Order Summary</h3>
      <div className="space-y-4 text-gray-700">
        <div className="flex justify-between">
          <p>{plan.name} Plan ({isLifetime ? 'One-Time' : billingCycle})</p>
          <p className="font-semibold">${price.toFixed(2)}</p>
        </div>
        <div className="flex justify-between">
          <p>Discount</p>
          <p className="font-semibold text-green-600">-$0.00</p>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-4 text-[#002B5B]">
          <p>Total</p>
          <p>${price.toFixed(2)}</p>
        </div>
      </div>
      
      <form onSubmit={handleApplyCoupon} className="mt-6">
        <Label htmlFor="coupon">Coupon Code</Label>
        <div className="flex gap-2 mt-1">
          <Input id="coupon" name="coupon" placeholder="Enter code" />
          <Button type="submit" variant="outline" className="border-[#002B5B] text-[#002B5B]">Apply</Button>
        </div>
      </form>
      
      <Button 
        onClick={handleCheckout} 
        size="lg" 
        className="w-full mt-8 bg-[#FF6F00] text-white hover:bg-[#FF8F00] text-lg font-bold rounded-lg py-3 h-auto"
      >
        Complete Purchase
      </Button>

      <p className="text-xs text-gray-500 mt-4 text-center">
        By completing your purchase, you agree to our Terms of Service.
      </p>
    </div>
  );
};

export default OrderSummary;