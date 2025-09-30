import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import CountryPicker from '@/components/dashboard/ai-compliance/CountryPicker';
import RegAssistant from '@/components/dashboard/ai-compliance/RegAssistant';
import SafetyChecklist from '@/components/dashboard/ai-compliance/SafetyChecklist';

const AiCompliancePage = () => {
    const [country, setCountry] = useState('CM');

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    return (
        <>
            <Helmet>
                <title>Compliance & Safety | DomusBuilder</title>
                <meta name="description" content="Navigate local building codes and safety regulations with AI-powered tools." />
            </Helmet>

            <motion.div
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div variants={itemVariants}>
                    <h1 className="text-3xl font-bold tracking-tight">Compliance & Safety</h1>
                    <p className="mt-1 text-lg text-muted-foreground">Stay ahead of regulations and ensure a safe construction site.</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    <motion.div variants={itemVariants} className="lg:col-span-1 flex flex-col gap-6">
                        <CountryPicker selectedCountry={country} onCountryChange={setCountry} />
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="lg:col-span-2 grid grid-cols-1 md:grid-cols-1 gap-6">
                         <RegAssistant countryCode={country} />
                         <SafetyChecklist />
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
};

export default AiCompliancePage;