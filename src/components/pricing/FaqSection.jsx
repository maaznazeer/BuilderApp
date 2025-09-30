import React from 'react';
    import { motion } from 'framer-motion';
    import {
      Accordion,
      AccordionContent,
      AccordionItem,
      AccordionTrigger,
    } from '@/components/ui/accordion';

    const FaqSection = () => {
      const faqs = [
        {
          question: "How does DomusBuilder handle irregular funding or cash flow?",
          answer: "We offer flexible options like Milestone Billing, where you pay at specific construction stages, and a Wallet/Credits system, allowing you to top up when funds are available. This helps you manage your project budget without being tied to a strict monthly schedule."
        },
        {
          question: "Do my purchased credits or wallet funds expire?",
          answer: "No, your wallet credits never expire. You can use them for any project service or subscription renewal at any time. They are as good as cash within the DomusBuilder platform."
        },
        {
          question: "Can I mix different payment models?",
          answer: "Absolutely! You can use a standard subscription for core platform access and use Milestone Billing for specific project phases. Or, top up your wallet and use credits to pay for Day Passes or other services as needed. Our goal is to provide maximum flexibility."
        },
        {
          question: "How does billing work for Family/Co-op plans?",
          answer: "The Family/Co-op plan allows multiple members to contribute to a single project pool. A designated manager oversees the funds, and all contributions are transparently logged. It's a great way for diaspora families to collectively fund a build back home."
        },
        {
          question: "Can I pause my subscription if my project is on hold?",
          answer: "Yes, you can pause your subscription at any time. Billing will be suspended, and you can resume your plan whenever your project restarts, ensuring you don't pay for services you're not actively using."
        },
        {
          question: "What is a Project License?",
          answer: "A Project License provides full premium access for a single, specific project for its entire duration. It's a one-time fee, perfect for users who manage one-off builds and prefer a single payment over a recurring subscription."
        },
        {
          question: "Are there any discounts for non-profits or long-term commitments?",
          answer: "Yes! We offer significant discounts for annual and quarterly subscriptions. We also have special pricing for registered non-profits and community-led housing co-operatives. Please contact our sales team to learn more."
        },
        {
          question: "What currencies do you accept?",
          answer: "We accept all major international currencies through our secure payment processor, Stripe. Your payment will be processed in your local currency, and our platform can handle project budgeting in multiple currencies."
        },
        {
          question: "How secure is my payment information?",
          answer: "Your security is our top priority. All payments are processed through Stripe, which is PCI-DSS Level 1 compliant. We do not store any of your credit card information on our servers."
        },
        {
          question: "What is your refund policy?",
          answer: "We offer a 30-day money-back guarantee on all new subscription plans. If you are not satisfied for any reason, you can request a full refund within the first 30 days of your purchase."
        },
        {
          question: "Which option should I choose?",
          answer: "Quarterly → predictable. Stages → milestone based. Credits → prepaid. Family → co-op builds."
        },
        {
          question: "Can I switch between alternatives later?",
          answer: "Yes. You can move between Credits, Family/Co-op, and Quarterly anytime."
        },
        {
          question: "Are credits refundable if unused?",
          answer: "Credits don’t expire. They are non-refundable but transferable to family/co-op."
        },
        {
          question: "Do milestone payments cover the whole project?",
          answer: "Each milestone covers access for that stage only. Reactivate for the next stage."
        },
        {
          question: "How is Family / Co-op billing handled?",
          answer: "One admin pays flat price. Members join by invite, with roles included."
        },
        {
          question: "Can I combine options?",
          answer: "Yes. Credits can be added on top of any plan."
        },
        {
          question: "What if construction pauses?",
          answer: "Pause your plan anytime. No charges until you resume."
        }
      ];

      return (
        <section className="bg-gray-50 py-16 sm:py-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Pricing FAQs
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-left font-semibold text-base">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 text-base leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>
      );
    };

    export default FaqSection;