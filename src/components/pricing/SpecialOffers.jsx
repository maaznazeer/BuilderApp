import React from 'react';
import { motion } from 'framer-motion';
import { Home, Heart, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const SpecialOffers = () => {
    const navigate = useNavigate();

    const handleApply = (offer) => {
        // 🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀
        console.log(`Applying for: ${offer}`);
        navigate('/contact', { state: { subject: `Inquiry about: ${offer}` } });
    };

    const offers = [
        {
            icon: Home,
            title: 'Families Building Their Home',
            description: 'Get 20% off any plan when building your primary residence. We support your dream home journey.',
            action: 'Verify for Discount',
            offerName: 'Family Discount'
        },
        {
            icon: Heart,
            title: 'Nonprofit Organizations',
            description: 'We offer a 25% discount for registered nonprofit organizations building for the community.',
            action: 'Apply for Nonprofit Rate',
            offerName: 'Nonprofit Discount'
        },
        {
            icon: TestTube,
            title: 'Pilot Program',
            description: 'Are you a builder with unique needs? Apply for our pilot program and get free Premium access in exchange for feedback.',
            action: 'Join the Pilot Program',
            offerName: 'Pilot Program'
        }
    ];

    return (
        <div className="py-16 sm:py-24 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Special Offers & Programs</h2>
                    <p className="mt-4 text-lg text-gray-600">We're committed to supporting the building community in every way we can.</p>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {offers.map((offer, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white p-8 rounded-2xl shadow-lg flex flex-col items-center text-center"
                        >
                            <div className="bg-primary/10 p-4 rounded-full mb-4">
                                <offer.icon className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{offer.title}</h3>
                            <p className="text-gray-600 flex-grow mb-6">{offer.description}</p>
                            <Button onClick={() => handleApply(offer.offerName)} variant="outline">
                                {offer.action}
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SpecialOffers;