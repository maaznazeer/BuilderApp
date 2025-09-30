import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SmartSuggestions = () => {
  const suggestions = [
    {
      id: 1,
      type: "forecast",
      text: "Based on recent rainfall, the Roofing phase may be delayed by 2-3 days.",
      icon: AlertTriangle,
      color: "text-yellow-500"
    },
    {
      id: 2,
      type: "tip",
      text: "Consider pre-ordering finishing materials now to avoid price hikes.",
      icon: Lightbulb,
      color: "text-blue-500"
    },
    {
      id: 3,
      type: "trend",
      text: "Your project is trending 5% under budget. Allocate surplus to quality upgrades?",
      icon: TrendingUp,
      color: "text-green-500"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Suggestions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0`}>
                <suggestion.icon className={`w-4 h-4 ${suggestion.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{suggestion.text}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartSuggestions;