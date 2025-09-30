import React from 'react';
    import { Link, useLocation } from 'react-router-dom';
    import { motion, AnimatePresence } from 'framer-motion';
    import { cn } from '@/lib/utils';
    import { ScrollArea } from '@/components/ui/scroll-area';
    import { getSidebarNavItems } from './dashboardConfig';
    import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
    import { ChevronDown, ChevronsLeft, ChevronsRight } from 'lucide-react';
    import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
    import { Button } from '@/components/ui/button';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
    
    const SidebarContent = ({ isCollapsed, toggleSidebar, onFaqOpen }) => {
        const location = useLocation();
        const { profile } = useAuth();
        const navItems = getSidebarNavItems(profile, onFaqOpen);
    
        return (
            <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-800 text-primary-foreground">
                <div className={cn("flex h-14 items-center border-b border-slate-700 px-4 lg:h-[60px] shrink-0", isCollapsed ? "justify-center px-2" : "lg:px-6")}>
                    <Link to="/dashboard" className="flex items-baseline space-x-1 flex-shrink-0">
                        <span className="font-poppins text-xl font-bold text-white">D</span>
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="font-poppins text-xl font-bold text-white"
                                >
                                    OMUS
                                </motion.span>
                            )}
                        </AnimatePresence>
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2, delay: 0.1 }}
                                    className="font-poppins text-xl font-light text-blue-300"
                                >
                                    builder
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>
                </div>
                <div className={cn("p-2 border-b border-slate-700 hidden md:flex", isCollapsed ? "justify-center" : "justify-end")}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-slate-700 hover:text-white" onClick={toggleSidebar}>
                        {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
                    </Button>
                </div>
                <ScrollArea className="flex-1">
                    <TooltipProvider delayDuration={0}>
                        <nav className={cn("flex flex-col text-sm font-medium py-4 gap-1", isCollapsed ? "px-2 items-center" : "px-4")}>
                            {navItems.map((section, index) => (
                                <React.Fragment key={index}>
                                    {section.title && !isCollapsed && (
                                        <h2 className="px-3 py-2 text-xs font-semibold uppercase text-slate-400 tracking-wider">
                                            {section.title}
                                        </h2>
                                    )}
                                    <div className={cn("flex flex-col items-center", isCollapsed ? "w-full" : "")}>
                                        {section.items.map((item) => (
                                            <div key={item.title || item.href} className="w-full flex justify-center">
                                                {item.children ? (
                                                    <SidebarCategory 
                                                        section={item} 
                                                        isCollapsed={isCollapsed} 
                                                        location={location}
                                                    />
                                                ) : (
                                                    <SidebarLink 
                                                        item={item}
                                                        isCollapsed={isCollapsed}
                                                        isActive={location.pathname === item.href}
                                                        onClick={item.isCustom ? item.onClick : undefined}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </React.Fragment>
                            ))}
                        </nav>
                    </TooltipProvider>
                </ScrollArea>
            </div>
        );
    };
    
    const Sidebar = ({ isCollapsed, toggleSidebar, onFaqOpen }) => {
        const sidebarVariants = {
            expanded: { width: 280, transition: { duration: 0.3, ease: "easeInOut" } },
            collapsed: { width: 80, transition: { duration: 0.3, ease: "easeInOut" } }
        };
    
        return (
            <motion.div
                layout
                initial={false}
                animate={isCollapsed ? "collapsed" : "expanded"}
                variants={sidebarVariants}
                className={cn("flex flex-col h-full border-r bg-gradient-to-b from-slate-900 to-slate-800 text-primary-foreground z-40 relative")}
            >
                <SidebarContent isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} onFaqOpen={onFaqOpen} />
            </motion.div>
        );
    };
    
    const SidebarCategory = ({ section, isCollapsed, location, onClick }) => {
        const isCategoryActive = section.children.some(item => location.pathname.startsWith(item.href));
        const [isOpen, setIsOpen] = React.useState(isCategoryActive);
    
        React.useEffect(() => {
            if (isCategoryActive && !isOpen) {
                setIsOpen(true);
            }
        }, [isCategoryActive, isOpen]);
    
        if (isCollapsed) {
            return (
                <DropdownMenu>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                 <Button variant={isCategoryActive ? "secondary" : "ghost"} className="h-12 w-12 p-0 text-slate-300 hover:bg-slate-700 hover:text-white data-[state=open]:bg-slate-700">
                                    <section.icon className={cn("h-6 w-6", isCategoryActive ? 'text-primary' : section.color)} />
                                </Button>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={10}>
                            <p>{section.title}</p>
                        </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent side="right" align="start" sideOffset={10} className="bg-background text-foreground">
                        <DropdownMenuLabel>{section.title}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {section.children.map(item => (
                             <DropdownMenuItem key={item.href} asChild>
                                <Link to={item.href} onClick={onClick} className={cn("flex items-center w-full cursor-pointer", location.pathname.startsWith(item.href) && "text-primary bg-primary/10")}>
                                    {item.icon && <item.icon className={cn("mr-2 h-4 w-4", item.color)} />}
                                    {item.title}
                                </Link>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }
    
        return (
            <div className="w-full">
                <Button variant="ghost" className="w-full justify-between pr-2 pl-3 text-slate-300 hover:bg-slate-700 hover:text-white data-[state=open]:bg-slate-700" onClick={() => setIsOpen(!isOpen)}>
                    <div className="flex items-center gap-3">
                        <section.icon className={cn("h-5 w-5", isCategoryActive ? "text-white" : section.color || "text-blue-300")} />
                        <span className="font-semibold">{section.title}</span>
                    </div>
                    <ChevronDown className={cn("h-4 w-4 text-blue-300 transition-transform", isOpen && "rotate-180")} />
                </Button>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pl-4"
                        >
                            <div className="py-2 flex flex-col gap-1">
                                {section.children.map(item => (
                                    <SidebarLink 
                                        key={item.href}
                                        item={item}
                                        isCollapsed={false}
                                        isActive={location.pathname === item.href}
                                        onClick={item.isCustom ? item.onClick : onClick}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };
    
    
    const SidebarLink = ({ item, isCollapsed, isActive, onClick }) => {
        const linkContent = (
            <>
                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-white" : item.color || "text-blue-300", "group-hover:text-white")} />
                <AnimatePresence>
                    {!isCollapsed && (
                         <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="overflow-hidden whitespace-nowrap"
                        >
                            {item.title}
                        </motion.span>
                    )}
                </AnimatePresence>
            </>
        );
    
        const linkClasses = cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 my-1 text-slate-300 transition-all group w-full",
            isActive ? "text-white bg-slate-700 font-semibold" : "hover:text-white hover:bg-slate-700",
            isCollapsed ? "justify-center h-12 w-12 p-0" : "font-medium"
        );
    
        if (item.isCustom) {
            return (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            onClick={onClick}
                            className={cn(
                                "w-full flex items-center gap-3 text-slate-300 hover:bg-slate-700 hover:text-white",
                                isCollapsed ? "justify-center h-12 w-12 p-0" : "justify-start px-3 py-2"
                            )}
                        >
                            {linkContent}
                        </Button>
                    </TooltipTrigger>
                    {isCollapsed && (
                        <TooltipContent side="right" sideOffset={10}>
                            <p>{item.title}</p>
                        </TooltipContent>
                    )}
                </Tooltip>
            );
        }
    
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                        to={item.href}
                        onClick={onClick}
                        className={linkClasses}
                    >
                        {linkContent}
                    </Link>
                </TooltipTrigger>
                {isCollapsed && (
                    <TooltipContent side="right" sideOffset={10}>
                        <p>{item.title}</p>
                    </TooltipContent>
                )}
            </Tooltip>
        );
    };
    
    export default Sidebar;