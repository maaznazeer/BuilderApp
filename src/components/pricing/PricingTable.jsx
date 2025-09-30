import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Check, X } from 'lucide-react';

const FeatureRow = ({ name, freemium, basic, premium, lifetime, isHeader = false }) => {
    if (isHeader) {
        return (
            <tr className="bg-gray-100">
                <td colSpan="5" className="p-3 font-bold text-gray-800 text-lg">{name}</td>
            </tr>
        )
    }
    return (
        <tr className="border-b transition-colors hover:bg-gray-50/50">
            <td className="p-4 font-medium text-left">{name}</td>
            <td className="p-4 text-center">{freemium}</td>
            <td className="p-4 text-center">{basic}</td>
            <td className="p-4 text-center">{premium}</td>
            <td className="p-4 text-center">{lifetime}</td>
        </tr>
    );
};

const Checkmark = () => <Check className="w-6 h-6 text-green-500 mx-auto" />;
const Cross = () => <X className="w-6 h-6 text-red-500 mx-auto" />;

const PricingTable = ({ isAnnual }) => {
  const features = [
    { name: 'Core Features', isHeader: true },
    { name: 'Projects', freemium: '1', basic: '3', premium: 'Unlimited', lifetime: 'Unlimited' },
    { name: 'Storage', freemium: '250MB', basic: '2GB', premium: '10GB', lifetime: '20GB' },
    { name: 'Collaborators', freemium: '1', basic: 'Up to 3', premium: 'Up to 10', lifetime: 'Unlimited' },
    { name: 'Media Quality', freemium: 'SD', basic: 'HD', premium: 'HD', lifetime: 'HD/4K' },
    { name: 'Basic Task Tracker', freemium: <Checkmark />, basic: <Checkmark />, premium: <Checkmark />, lifetime: <Checkmark /> },
    { name: 'Budget View', freemium: <Checkmark />, basic: <Checkmark />, premium: <Checkmark />, lifetime: <Checkmark /> },
    { name: 'Management', isHeader: true },
    { name: 'Budget & Expense Tracker', freemium: <Cross />, basic: <Checkmark />, premium: <Checkmark />, lifetime: <Checkmark /> },
    { name: 'Team & Contractor Directory', freemium: <Cross />, basic: <Checkmark />, premium: <Checkmark />, lifetime: <Checkmark /> },
    { name: 'Photo & Video Logs', freemium: <Cross />, basic: <Checkmark />, premium: <Checkmark />, lifetime: <Checkmark /> },
    { name: 'Email Alerts', freemium: <Cross />, basic: <Checkmark />, premium: <Checkmark />, lifetime: <Checkmark /> },
    { name: 'Full Exports (CSV/PDF)', freemium: <Cross />, basic: <Cross />, premium: <Checkmark />, lifetime: <Checkmark /> },
    { name: 'Advanced Features', isHeader: true },
    { name: 'Advanced Financial Reports', freemium: <Cross />, basic: <Cross />, premium: <Checkmark />, lifetime: <Checkmark /> },
    { name: 'Inspection Checklists', freemium: <Cross />, basic: <Cross />, premium: <Checkmark />, lifetime: <Checkmark /> },
    { name: 'Survey Tool for Feedback', freemium: <Cross />, basic: <Cross />, premium: <Checkmark />, lifetime: <Checkmark /> },
    { name: 'Contractor Logistics Hub', freemium: <Cross />, basic: <Cross />, premium: <Checkmark />, lifetime: <Checkmark /> },
    { name: 'Support & Security', isHeader: true },
    { name: 'Two-Factor Authentication (2FA)', freemium: <Cross />, basic: <Checkmark />, premium: <Checkmark />, lifetime: <Checkmark /> },
    { name: 'Premium Support', freemium: <Cross />, basic: <Cross />, premium: <Checkmark />, lifetime: <Checkmark /> },
  ];

  return (
    <div className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-2xl font-bold text-center flex justify-center items-center gap-2 hover:no-underline">
              <span className="transform transition-transform group-data-[state=open]:rotate-180">🔽</span> View Full Feature Comparison
            </AccordionTrigger>
            <AccordionContent>
              <div className="overflow-x-auto mt-8">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-4 text-left font-semibold text-gray-600">Feature</th>
                      <th className="p-4 text-center font-semibold text-gray-600">Freemium</th>
                      <th className="p-4 text-center font-semibold text-gray-600">Basic</th>
                      <th className="p-4 text-center font-semibold text-primary">Premium</th>
                      <th className="p-4 text-center font-semibold text-yellow-600">Lifetime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {features.map((feature, index) => (
                      <FeatureRow key={index} {...feature} />
                    ))}
                  </tbody>
                </table>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default PricingTable;