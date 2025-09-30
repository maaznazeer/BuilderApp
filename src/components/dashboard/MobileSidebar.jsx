import React from 'react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Sidebar from '@/components/dashboard/Sidebar';
import { Link } from 'react-router-dom';

const MobileSidebar = () => {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 flex flex-col w-64">
                <div className="flex h-16 items-center border-b px-6">
                    <Link to="/dashboard" className="flex items-baseline space-x-1 flex-shrink-0">
                        <span className="font-poppins text-xl font-bold text-gray-900">DOMUS</span>
                        <span className="font-poppins text-xl font-light text-primary">builder</span>
                    </Link>
                </div>
                <Sidebar isMobile={true} />
            </SheetContent>
        </Sheet>
    );
};

export default MobileSidebar;