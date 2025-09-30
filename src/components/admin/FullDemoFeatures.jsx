import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2 } from 'lucide-react';

const featureData = [
  {
    title: "Budget & Finance",
    features: ["budget_tracker", "budget_reports", "financial_ledger", "reconciliation"],
  },
  {
    title: "Inventory & Supply",
    features: ["inventory_pro", "material_purchases", "goods_received_notes", "goods_issue_notes", "stock_movements", "project_materials", "suppliers (full)"],
  },
  {
    title: "Planning & Ops",
    features: ["milestone_planner", "project_gantt", "workflow_templates", "automations", "construction_process", "project_settings"],
  },
  {
    title: "Workforce",
    features: ["workers", "workforce_payroll"],
  },
  {
    title: "Monitoring & Docs",
    features: ["remote_monitoring", "site_photos", "document_exports", "advanced_exports", "reports_pro"],
  },
  {
    title: "Intelligence",
    features: ["ai_assistant (Ask-Builder Brain)"],
  },
];

const FeatureItem = ({ name }) => (
    <li className="flex items-center text-sm text-gray-700">
        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
        <span>{name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
    </li>
);

const FullDemoFeatures = () => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger className="text-lg font-semibold hover:no-underline">
          What does a full demo unlock?
        </AccordionTrigger>
        <AccordionContent>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
              {featureData.map((category) => (
                <div key={category.title}>
                  <h3 className="text-md font-bold text-gray-800 mb-3 border-b pb-2">{category.title}</h3>
                  <ul className="space-y-2">
                    {category.features.map((feature) => (
                        <FeatureItem key={feature} name={feature} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default FullDemoFeatures;