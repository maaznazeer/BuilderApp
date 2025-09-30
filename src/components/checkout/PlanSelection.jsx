import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const PlanCard = ({ plan, planKey, isSelected, onSelect, billingCycle }) => {
  const price = billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly;
  const isLifetime = planKey === 'lifetime';
  const displayPrice = isLifetime ? `$${plan.price.monthly}` : `$${price}`;
  const displayCycle = isLifetime ? 'one-time fee' : `/${billingCycle === 'yearly' ? 'year' : 'month'}`;

  return (
    <motion.div
      onClick={() => onSelect(planKey)}
      className={cn(
        'relative rounded-2xl border-2 p-6 cursor-pointer transition-all duration-300',
        isSelected ? 'border-[#FF6F00] bg-orange-50/50 shadow-lg' : 'border-gray-300 bg-white hover:border-[#002B5B]'
      )}
      whileTap={{ scale: 0.98 }}
    >
      {isSelected && (
        <CheckCircle className="absolute top-4 right-4 h-6 w-6 text-[#FF6F00]" />
      )}
      <h3 className="text-2xl font-bold text-[#002B5B]">{plan.name}</h3>
      <p className="mt-2 text-3xl font-extrabold text-[#002B5B]">
        {displayPrice}
        <span className="text-base font-medium text-gray-500 ml-1">{displayCycle}</span>
      </p>
      {plan.trial && <p className="mt-1 text-sm text-green-600 font-semibold">{plan.trial} trial</p>}
    </motion.div>
  );
};

const PlanSelection = ({ plans, selectedPlan, setSelectedPlan, billingCycle, setBillingCycle }) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-[#002B5B] mb-2">1. Select Your Plan</h2>
      <p className="text-gray-600 mb-6">Choose the plan that best fits your needs.</p>
      
      <div className="flex items-center justify-center space-x-4 mb-8 bg-gray-100 p-2 rounded-full max-w-sm mx-auto">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={cn(
            'w-full rounded-full py-2.5 text-sm font-semibold transition-colors duration-300',
            billingCycle === 'monthly' ? 'bg-[#002B5B] text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
          )}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          className={cn(
            'w-full rounded-full py-2.5 text-sm font-semibold transition-colors duration-300',
            billingCycle === 'yearly' ? 'bg-[#002B5B] text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
          )}
        >
          Yearly <span className="hidden sm:inline bg-[#FFC107] text-[#002B5B] px-2 py-1 rounded-full text-xs ml-1">SAVE 17%</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.keys(plans).map(planKey => (
          <PlanCard
            key={planKey}
            planKey={planKey}
            plan={plans[planKey]}
            isSelected={selectedPlan === planKey}
            onSelect={setSelectedPlan}
            billingCycle={billingCycle}
          />
        ))}
      </div>
    </div>
  );
};

export default PlanSelection;