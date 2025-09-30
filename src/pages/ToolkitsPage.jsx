import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BarChart3, Wrench, GanttChartSquare, Camera, CheckSquare, Wallet, DollarSign, PackageSearch, Truck, Building, Users, BookCopy, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const toolkits = [
  {
    title: "Project Overview",
    description: "Get a 360-degree view of your project's health. Track progress, monitor key metrics, and make informed decisions instantly.",
    icon: BarChart3,
    image: "https://horizons-cdn.hostinger.com/4836def6-848d-4fc6-838d-fe4a3fbfac02/6313430d8bc0e23eedf7a1eba344535c.jpg"
  },
  {
    title: "Construction Process",
    description: "Standardize your build process from start to finish. Ensure quality and consistency across all your projects with predefined workflows.",
    icon: Wrench,
    image: "https://horizons-cdn.hostinger.com/4836def6-848d-4fc6-838d-fe4a3fbfac02/8210605b27eb0f0e490aea99cc9c54b6.jpg"
  },
  {
    title: "Milestone Timeline",
    description: "Visualize your project timeline with interactive Gantt charts. Keep track of deadlines, dependencies, and critical paths effortlessly.",
    icon: GanttChartSquare,
    image: "https://horizons-cdn.hostinger.com/4836def6-848d-4fc6-838d-fe4a3fbfac02/19b8b722f1fdeae21c124ecb333a15ac.jpg"
  },
  {
    title: "Media Logs",
    description: "A picture is worth a thousand words. Document every step with photos and videos, creating a complete visual record of your build.",
    icon: Camera,
    image: "https://horizons-cdn.hostinger.com/4836def6-848d-4fc6-838d-fe4a3fbfac02/ca4b8d366ccc551d165019204b77184c.jpg"
  },
  {
    title: "Materials",
    description: "Manage your project's material needs from a central hub. Track procurement, delivery, and on-site availability with ease.",
    icon: PackageSearch,
    image: "https://horizons-cdn.hostinger.com/4836def6-848d-4fc6-838d-fe4a3fbfac02/2a14646cea29da34ecf544cef1ed1581.jpg"
  },
  {
    title: "Suppliers",
    description: "Keep your supplier directory organized and accessible. Manage contacts, contracts, and performance all in one place.",
    icon: Building,
    image: "https://horizons-cdn.hostinger.com/4836def6-848d-4fc6-838d-fe4a3fbfac02/b93f24021426bd5248bd53c64fd1a413.jpg"
  },
  {
    title: "Remote Approvals",
    description: "Keep your project moving. Review and approve change orders, invoices, and documents from anywhere, on any device.",
    icon: CheckSquare,
    image: "https://horizons-cdn.hostinger.com/4836def6-848d-4fc6-838d-fe4a3fbfac02/d14f2e4f8be26803e3f07161a1da05bc.jpg"
  },
  {
    title: "Budget Tracker",
    description: "Stay on budget, every time. Monitor expenses in real-time, forecast costs, and avoid costly overruns with our smart budget tools.",
    icon: Wallet,
    image: "https://horizons-cdn.hostinger.com/4836def6-848d-4fc6-838d-fe4a3fbfac02/84e2f572d089c9db3a4bf464f862a355.jpg"
  },
  {
    title: "Expense Tracker",
    description: "Log every expense as it happens. Capture receipts, categorize costs, and generate expense reports in just a few clicks.",
    icon: DollarSign,
    image: "https://horizons-cdn.hostinger.com/4836def6-848d-4fc6-838d-fe4a3fbfac02/58ba0f5ad9e502420f33e9ce328287bb.jpg"
  },
  {
    title: "Material Inventory",
    description: "Know what you have and where you have it. Our inventory system helps you track stock levels and prevent costly shortages.",
    icon: PackageSearch,
    image: "https://horizons-cdn.hostinger.com/4836def6-848d-4fc6-838d-fe4a3fbfac02/d4d68a5f362b705e2a0ce0eb9bccf71e.jpg"
  },
  {
    title: "Sourcing & Logistics",
    description: "Streamline your supply chain. Manage purchase orders, track deliveries, and coordinate logistics to keep your site stocked.",
    icon: Truck,
    image: "https://horizons-cdn.hostinger.com/4836def6-848d-4fc6-838d-fe4a3fbfac02/da819ed788c828e333db7bda3471d0c4.jpg"
  },
  {
    title: "Reports & Exports",
    description: "Data-driven decisions made simple. Generate insightful reports on project performance, financials, and more, ready for export.",
    icon: FileText,
    image: "https://horizons-cdn.hostinger.com/4836def6-848d-4fc6-838d-fe4a3fbfac02/25c33d2f1e251388f85b90043114952c.jpg"
  },
  {
    title: "Goods Issue Notes (GIN)",
    description: "Track every material used on site. Issue notes ensure accurate stock deduction and precise cost allocation to project phases.",
    icon: BookCopy,
    image: "https://horizons-cdn.hostinger.com/4836def6-848d-4fc6-838d-fe4a3fbfac02/a6e54ade2dab03286191194dceb24558.jpg"
  },
  {
    title: "Project Team",
    description: "Collaborate seamlessly with your entire team. Manage roles, permissions, and communication to keep everyone aligned.",
    icon: Users,
    image: "https://horizons-cdn.hostinger.com/4836def6-848d-4fc6-838d-fe4a3fbfac02/90d93a8d767ef978c030de3baef24cc0.jpg"
  },
];

const ToolCard = ({ tool, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden flex flex-col group"
  >
    <div className="relative">
      <img  alt={tool.image} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" src={tool.image} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <div className="absolute bottom-4 left-4 flex items-center gap-3">
        <div className="bg-blue-600/80 backdrop-blur-sm p-3 rounded-full">
           <tool.icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">{tool.title}</h3>
      </div>
    </div>
    <div className="p-6 flex-grow flex flex-col">
      <p className="text-gray-600 flex-grow">{tool.description}</p>
      <div className="mt-6">
        <Link to="/signup">
            <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">Get Started</Button>
        </Link>
      </div>
    </div>
  </motion.div>
);

const ToolkitsPage = () => {
  const { t, i18n } = useTranslation();

  return (
    <>
      <Helmet>
        <html lang={i18n.language} />
        <title>All-in-One Construction Toolkit - DomusBuilder</title>
        <meta name="description" content="Explore our comprehensive suite of tools designed to streamline every phase of your construction project, from planning to completion." />
      </Helmet>
      
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-16"
            >
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">The Ultimate Construction Toolkit</h1>
                <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
                    Everything you need to manage your projects, teams, and financials in one powerful, integrated platform.
                </p>
                <div className="mt-8">
                    <Link to="/request-demo">
                        <Button size="lg" className="bg-orange-500 text-white hover:bg-orange-600 text-lg px-8 py-6 rounded-full">Request a Live Demo</Button>
                    </Link>
                </div>
            </motion.div>
          
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {toolkits.map((tool, index) => (
                    <ToolCard key={tool.title} tool={tool} index={index} />
                ))}
            </div>
        </div>
      </div>
    </>
  );
};

export default ToolkitsPage;