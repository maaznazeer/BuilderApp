import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SuccessPage = () => {
  return (
    <>
      <Helmet>
        <title>Payment Successful - DomusBuilder Hub</title>
        <meta name="description" content="Your payment was successful. Thank you for your order!" />
      </Helmet>
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center bg-gray-900 text-white p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center glass-card p-8 md:p-12 rounded-2xl shadow-2xl max-w-2xl w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
          >
            <CheckCircle className="mx-auto h-20 w-20 text-green-400 mb-6" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-lg text-gray-300 mb-8">
            Thank you for your order. We've received your payment and are processing your items. You'll receive an email confirmation shortly.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/store">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 text-lg">
                Continue Shopping
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 hover:text-white font-semibold py-3 text-lg">
                Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default SuccessPage;