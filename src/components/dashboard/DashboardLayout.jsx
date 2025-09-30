import React, { useState, useEffect } from 'react';
    import { Outlet } from 'react-router-dom';
    import { Toaster } from '@/components/ui/toaster';
    import Sidebar from '@/components/dashboard/Sidebar';
    import DashboardHeader from '@/components/dashboard/DashboardHeader';
    import FaqDrawer from '@/components/dashboard/FaqDrawer';
    import { useMediaQuery } from '@/hooks/useMediaQuery';
    
    const DashboardLayout = ({ children }) => {
      const isMobile = useMediaQuery("(max-width: 768px)");
      const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(isMobile);
      const [isFaqDrawerOpen, setIsFaqDrawerOpen] = useState(false);
      
      useEffect(() => {
        setIsSidebarCollapsed(isMobile);
      }, [isMobile]);
    
      const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
      };
    
      const handleFaqOpen = () => {
        setIsFaqDrawerOpen(true);
      };
      
      return (
        <div className="grid min-h-screen w-full grid-cols-[auto_1fr]">
          <div className="h-screen">
            <Sidebar 
              isCollapsed={isSidebarCollapsed} 
              toggleSidebar={toggleSidebar} 
              onFaqOpen={handleFaqOpen}
            />
          </div>
          <div className="flex flex-col overflow-hidden">
            <DashboardHeader 
              isSidebarCollapsed={isSidebarCollapsed} 
              toggleSidebar={toggleSidebar} 
              onFaqOpen={handleFaqOpen}
            />
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40 overflow-auto">
              {children}
            </main>
          </div>
          <FaqDrawer open={isFaqDrawerOpen} onOpenChange={setIsFaqDrawerOpen} />
          <Toaster />
        </div>
      );
    };
    
    export default DashboardLayout;