import React from 'react';
import { Check, Minus } from 'lucide-react';
import { pricingFeatures } from '@/lib/pricingData.js';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const plans = [
  { name: 'Freemium', id: 'freemium' },
  { name: 'Essentiel', id: 'essentiel' },
  { name: 'Pro', id: 'pro' },
  { name: 'Premium', id: 'premium' },
];

const FeatureRow = ({ feature }) => (
  <tr className="border-b border-gray-200/80 dark:border-gray-700/80">
    <td className="py-4 px-6 text-sm font-medium text-gray-800 dark:text-gray-200 w-1/5">{feature.name}</td>
    {plans.map((plan) => (
      <td key={plan.id} className="py-4 px-6 text-center w-1/5">
        {typeof feature.tiers[plan.id.toLowerCase()] === 'boolean' ? (
          feature.tiers[plan.id.toLowerCase()] ? (
            <Check className="h-6 w-6 text-green-500 mx-auto" />
          ) : (
            <Minus className="h-6 w-6 text-gray-400 mx-auto" />
          )
        ) : (
          <span className="text-sm text-gray-800 dark:text-gray-300">{feature.tiers[plan.id.toLowerCase()]}</span>
        )}
      </td>
    ))}
  </tr>
);

const PricingComparison = () => {
  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            A Feature-by-Feature Look
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Everything you need to know, all in one place.
          </p>
        </div>

        <Accordion type="multiple" className="w-full space-y-4" defaultValue={['core-features']}>
          {pricingFeatures.map((categoryData) => (
            <AccordionItem 
              value={categoryData.id} 
              key={categoryData.id} 
              className="border dark:border-gray-700 rounded-lg shadow-lg overflow-hidden bg-white dark:bg-gray-800"
            >
              <AccordionTrigger className="p-4 text-xl font-semibold text-gray-900 dark:text-white hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-700/50">
                {categoryData.name}
              </AccordionTrigger>
              <AccordionContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/5">Features</th>
                        {plans.map((plan) => (
                          <th key={plan.name} className="py-3 px-6 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/5">
                            {plan.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {categoryData.features.map((feature) => (
                        <FeatureRow key={feature.name} feature={feature} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default PricingComparison;