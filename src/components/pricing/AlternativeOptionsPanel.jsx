import React from 'react';
    import { motion } from 'framer-motion';
    import { Link } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { CheckCircle } from 'lucide-react';

    const options = [
        {
            plan: "milestones",
            title: "Pay Only at Construction Stages",
            description: "Unlock access only when a stage is active (foundation, walls, roof, finishes).",
            features: ["No monthly commitment", "Transparent, progress-linked billing", "Pause between stages with no charge"],
            ctaPrimary: "Start with Stage Billing",
            ctaPrimaryLink: window.__ALT_OPTIONS_CFG__.urls.milestone,
            ctaSecondary: "Talk to sales",
            ctaSecondaryLink: window.__ALT_OPTIONS_CFG__.urls.contact
        },
        {
            plan: "credits",
            title: "Use Credits (like airtime)",
            description: "Top-up and spend on milestones, AI tools, storage — transfer credits to family/co-op.",
            features: ["Prepaid control, no surprises", "Shareable with family/co-op", "Never expires*"],
            ctaPrimary: "Create Wallet",
            ctaPrimaryLink: window.__ALT_OPTIONS_CFG__.urls.credits,
            ctaSecondary: "Ask about bulk top-ups",
            ctaSecondaryLink: window.__ALT_OPTIONS_CFG__.urls.contact,
            finePrint: "*Non-refundable; transferable within your family/co-op.",
            pill: "Credits Wallet"
        },
        {
            plan: "quarterly",
            title: "Quarterly Subscription",
            description: "Pay once every 3 months. Simpler budgeting for pooled diaspora funds.",
            features: ["Lower friction vs monthly", "Works with credits", "Switchable anytime"],
            ctaPrimary: "Choose Quarterly",
            ctaPrimaryLink: window.__ALT_OPTIONS_CFG__.urls.quarterly,
            ctaSecondary: "Get invoicing",
            ctaSecondaryLink: window.__ALT_OPTIONS_CFG__.urls.contact
        },
        {
            plan: "family",
            title: "Family / Co-op Subscription",
            description: "One plan for the whole group. Individual logins with roles.",
            features: ["Flat price — invite members", "Pooled financing tracker", "Audit trail & transparency"],
            ctaPrimary: "Start Family Plan",
            ctaPrimaryLink: window.__ALT_OPTIONS_CFG__.urls.family,
            ctaSecondary: "Co-op options",
            ctaSecondaryLink: window.__ALT_OPTIONS_CFG__.urls.contact
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const AlternativeOptionsPanel = () => {
        const handleCtaClick = (plan, href) => {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: 'pricing_alt_click',
                plan,
                href
            });
        };

        return (
            <motion.div
                className="my-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
            >
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Alternative Options
                    </h2>
                    <p className="mt-4 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
                        Flexible ways to pay — designed for diaspora builds.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {options.map(option => (
                        <motion.article
                            key={option.plan}
                            className="border border-gray-200 rounded-2xl p-4 bg-white flex flex-col gap-2.5 shadow-sm"
                            data-plan={option.plan}
                            variants={itemVariants}
                        >
                            {option.pill && (
                                <div className="text-xs font-bold self-start inline-block bg-blue-100 text-blue-700 rounded-full px-2 py-1">
                                    {option.pill}
                                </div>
                            )}
                            <h3 className="text-base font-bold">{option.title}</h3>
                            <p className="text-sm text-gray-600 flex-grow">{option.description}</p>
                            <ul className="pl-5 list-disc space-y-1.5 mt-2.5">
                                {option.features.map(feature => (
                                    <li key={feature} className="text-sm text-gray-700">
                                      <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-auto pt-4 flex flex-col gap-2">
                                <Button asChild className="w-full" onClick={() => handleCtaClick(option.plan, option.ctaPrimaryLink)}>
                                    <Link to={option.ctaPrimaryLink}>{option.ctaPrimary}</Link>
                                </Button>
                                <Button asChild variant="ghost" className="w-full" onClick={() => handleCtaClick(option.plan, option.ctaSecondaryLink)}>
                                    <Link to={option.ctaSecondaryLink}>{option.ctaSecondary}</Link>
                                </Button>
                            </div>
                            {option.finePrint && (
                                <p className="mt-2.5 text-xs text-gray-500">{option.finePrint}</p>
                            )}
                        </motion.article>
                    ))}
                </div>
            </motion.div>
        );
    };

    export default AlternativeOptionsPanel;