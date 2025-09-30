import React, { useState, useEffect, useMemo } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, CreditCard, ChevronDown, LayoutGrid, GanttChartSquare, Camera, CheckSquare, Wallet, Landmark, Package, Truck, Users, UserCheck, BarChartHorizontal, Bell, AlertTriangle, MessageSquare, DollarSign, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const isHomePage = location.pathname === '/';
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 80;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    document.addEventListener('scroll', handleScroll, { passive: true });
    return () => document.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const handleLogout = async () => {
    await signOut();
    setIsOpen(false);
    navigate('/');
  };

  const notifications = useMemo(() => [
    { id: 1, type: 'budget', text: 'Kitchen budget is at 90%', time: new Date(Date.now() - 1000 * 60 * 5), icon: DollarSign, color: 'text-red-500' },
    { id: 2, type: 'timeline', text: 'Roofing phase is 3 days behind schedule', time: new Date(Date.now() - 1000 * 60 * 60 * 2), icon: AlertTriangle, color: 'text-yellow-500' },
    { id: 3, type: 'comment', text: 'New comment on "Foundation Photo"', time: new Date(Date.now() - 1000 * 60 * 60 * 8), icon: MessageSquare, color: 'text-primary' },
  ], []);

  const navLinkClasses = (isActive) => {
    const base = `group relative px-3 py-2 text-sm font-medium tracking-wide transition-colors duration-300`;
    if (scrolled) {
      return `${base} ${isActive ? 'text-primary' : 'text-gray-700 hover:text-primary'}`;
    }
    return `${base} ${isActive ? 'text-white' : 'text-gray-200 hover:text-white'}`;
  };

  const mobileNavLinkClasses = (isActive) => `block px-3 py-2 rounded-md text-base font-medium tracking-wide ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-gray-700 hover:bg-gray-100'}`;
  
  const iconColorClass = scrolled ? 'text-gray-700' : 'text-white';
  const logoDomusColor = scrolled ? 'text-[#2C3E50]' : 'text-white';
  const logoBuilderColor = scrolled ? 'text-primary' : 'text-orange-300';
  
  const NavItem = ({ to, children }) => (
    <NavLink to={to} className={({ isActive }) => navLinkClasses(isActive)}>
      {({ isActive }) => (
        <>
          {children}
          <span className={`absolute bottom-1 left-0 w-full h-0.5 bg-primary transform transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}></span>
        </>
      )}
    </NavLink>
  );

  const MobileNavItem = ({ to, children }) => (
    <NavLink to={to} onClick={() => setIsOpen(false)} className={({ isActive }) => mobileNavLinkClasses(isActive)}>{children}</NavLink>
  );
  
  const navbarBackgroundClass = scrolled ? 'bg-white/95 shadow-md backdrop-blur-sm' : (isHomePage ? 'bg-transparent' : 'bg-gradient-to-br from-primary to-orange-800');

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 50, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${navbarBackgroundClass}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-baseline space-x-1 flex-shrink-0">
            <span className={`font-poppins text-lg sm:text-xl lg:text-2xl font-bold transition-colors duration-300 ${logoDomusColor}`}>DOMUS</span>
            <span className={`font-poppins text-lg sm:text-xl lg:text-2xl font-light transition-colors duration-300 ${logoBuilderColor}`}>builder</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                <NavItem to="/dashboard">{t('navbar.dashboard')}</NavItem>
                <NavItem to="/dashboard/ask-brain">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="h-4 w-4" />
                    <span>Ask-Builder Brain</span>
                  </div>
                </NavItem>
              </>
            ) : (
              <>
                <NavItem to="/">{t('navbar.home')}</NavItem>
                <NavItem to="/features">{t('navbar.features')}</NavItem>
                <NavItem to="/toolkits">Toolkits</NavItem>
                <NavItem to="/pricing">{t('navbar.pricing')}</NavItem>
                <NavItem to="/contact">{t('navbar.contact')}</NavItem>
              </>
            )}
          </div>
          
          <div className="hidden md:flex items-center space-x-2">
            <LanguageSwitcher isTransparentBg={!scrolled} />
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className={`${iconColorClass} hover:bg-black/10 hover:text-current relative`}>
                      <Bell className="w-5 h-5" />
                      {notifications.length > 0 && <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">{notifications.length}</Badge>}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      {notifications.length > 0 ? notifications.map(notif => (
                        <DropdownMenuItem key={notif.id} onSelect={() => toast({title: "Navigating to alert..."})}>
                          <notif.icon className={`w-4 h-4 mr-2 ${notif.color}`} />
                          <p className="flex-1 text-sm">{notif.text}</p>
                          <p className="text-xs text-gray-500">{formatDistanceToNow(notif.time, { addSuffix: true })}</p>
                        </DropdownMenuItem>
                      )) : (
                        <div className="px-2 py-4 text-center text-sm text-gray-500">No new notifications</div>
                      )}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => toast({title: "Viewing all notifications..."})}>
                      <span className="w-full text-center text-sm">View All</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className={`flex items-center space-x-2 ${iconColorClass} hover:bg-black/10 hover:text-current px-2`}>
                      <User className="w-5 h-5" />
                      <span className="font-medium">{user.full_name || user.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => navigate('/dashboard')}><LayoutGrid className="mr-2 h-4 w-4" /><span>{t('navbar.dashboard')}</span></DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => navigate('/account/profile')}><User className="mr-2 h-4 w-4" /><span>{t('navbar.profile')}</span></DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => navigate('/account/billing')}><CreditCard className="mr-2 h-4 w-4" /><span>{t('navbar.billing')}</span></DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => navigate('/people/permissions')}><UserCheck className="mr-2 h-4 w-4" /><span>{t('navbar.user_permissions')}</span></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50"><LogOut className="mr-2 h-4 w-4" /><span>{t('navbar.logout')}</span></DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login"><Button variant="ghost" className={`${iconColorClass} hover:bg-black/10 hover:text-current`}>{t('navbar.login')}</Button></Link>
                <Link to="/signup"><Button variant="ghost" className={`${iconColorClass} hover:bg-black/10 hover:text-current`}>Sign Up</Button></Link>
                <Link to="/request-demo"><Button className="bg-primary text-white hover:bg-primary/90">Request Demo</Button></Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <LanguageSwitcher isTransparentBg={!scrolled} />
            <button onClick={() => setIsOpen(!isOpen)} className={`${iconColorClass} hover:text-primary transition-colors`}>
              {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white overflow-hidden shadow-lg"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {user ? (
                <>
                  <MobileNavItem to="/dashboard">{t('navbar.dashboard')}</MobileNavItem>
                  <MobileNavItem to="/dashboard/ask-brain">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="h-4 w-4" />
                      <span>Ask-Builder Brain</span>
                    </div>
                  </MobileNavItem>
                </>
              ) : (
                <>
                  <MobileNavItem to="/">{t('navbar.home')}</MobileNavItem>
                  <MobileNavItem to="/features">{t('navbar.features')}</MobileNavItem>
                  <MobileNavItem to="/toolkits">Toolkits</MobileNavItem>
                  <MobileNavItem to="/pricing">{t('navbar.pricing')}</MobileNavItem>
                  <MobileNavItem to="/contact">{t('navbar.contact')}</MobileNavItem>
                </>
              )}
              <div className="border-t border-gray-200 my-2"></div>
              {user ? (
                <>
                  <MobileNavItem to="/account/profile">{t('navbar.profile')}</MobileNavItem>
                  <MobileNavItem to="/account/billing">{t('navbar.billing')}</MobileNavItem>
                  <MobileNavItem to="/people/permissions">{t('navbar.user_permissions')}</MobileNavItem>
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">{t('navbar.logout')}</button>
                </>
              ) : (
                <div className="px-2 pt-2">
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full"><Button variant="outline" className="w-full mb-2">{t('navbar.login')}</Button></Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)} className="block w-full"><Button variant="outline" className="w-full mb-2">Sign Up</Button></Link>
                  <Link to="/request-demo" onClick={() => setIsOpen(false)} className="block w-full"><Button className="w-full bg-primary text-white hover:bg-primary/90">Request Demo</Button></Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;