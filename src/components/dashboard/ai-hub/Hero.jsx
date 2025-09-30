import React from 'react';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Eye, Microscope, TrendingUp, Sparkles, ShieldCheck, MessageSquare, BellDot } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ActionButton = ({ to, icon: Icon, children, delay }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
        >
            <Button
                asChild
                variant="outline"
                className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 group"
            >
                <Link to={to}>
                    <Icon className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
                    <span className="font-semibold text-sm">{children}</span>
                </Link>
            </Button>
        </motion.div>
    );
};


const Hero = () => {
    const actions = [
        { to: "/ask-brain/monitoring", icon: Eye, label: "Open Monitoring", delay: 0.1 },
        { to: "/ask-brain/materials", icon: Microscope, label: "Materials QA", delay: 0.2 },
        { to: "/ask-brain/costs", icon: TrendingUp, label: "Costs & Forecasts", delay: 0.3 },
        { to: "/ask-brain/design", icon: Sparkles, label: "Design & Inspiration", delay: 0.4 },
        { to: "/ask-brain/compliance", icon: ShieldCheck, label: "Compliance & Safety", delay: 0.5 },
        { to: "/ask-brain/comms", icon: MessageSquare, label: "Comms & Trust", delay: 0.6 },
        { to: "/ask-brain/alerts", icon: BellDot, label: "Smart Alerts", delay: 0.7 },
    ];
    
    return (
        <div className="relative min-h-[calc(100vh-60px)] md:min-h-0 md:h-auto p-4 sm:p-8 md:p-12 rounded-b-2xl md:rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white shadow-2xl flex flex-col justify-center">
             <div className="absolute inset-0 bg-grid-white/[0.07] [mask-image:linear-gradient(to_bottom,white_20%,transparent_90%)]"></div>
             <div className="relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center gap-4 mb-6 md:mb-4"
                >
                    <BrainCircuit className="h-10 w-10 text-orange-300" />
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Ask-Builder Brain</h1>
                        <p className="text-lg md:text-xl font-light text-indigo-200 mt-1">Vision • Cost • Compliance • Comms</p>
                    </div>
                </motion.div>

                <div className="mt-8">
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                      {actions.map(action => (
                          <ActionButton key={action.to} {...action}>
                              {action.label}
                          </ActionButton>
                      ))}
                  </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;