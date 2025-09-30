import React, { useState, useEffect } from 'react';
    import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
    import { Menu, User, LogOut, Building, Wrench, DraftingCompass, Briefcase, LayoutDashboard, UserCog, BrainCircuit } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { useAuth } from '@/contexts/SupabaseAuthContext.jsx';
    import LanguageSwitcher from '@/components/LanguageSwitcher';
    import { useTranslation } from 'react-i18next';
    import {
      NavigationMenu,
      NavigationMenuContent,
      NavigationMenuItem,
      NavigationMenuLink,
      NavigationMenuList,
      NavigationMenuTrigger,
      navigationMenuTriggerStyle,
    } from "@/components/ui/navigation-menu";
    import {
      Sheet,
      SheetContent,
      SheetHeader,
      SheetTitle,
      SheetFooter,
      SheetClose,
      SheetTrigger,
    } from "@/components/ui/sheet";
    import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
    } from "@/components/ui/dropdown-menu";
    import {
      Accordion,
      AccordionContent,
      AccordionItem,
      AccordionTrigger,
    } from "@/components/ui/accordion";
    import { cn } from '@/lib/utils';
    import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

    const solutions = [
      { title: "Home Builder", href: "/features/home-builders", description: "Manage full-scale home construction from foundation to finish.", icon: Building },
      { title: "General Contractor", href: "/features/specialty-contractors", description: "Oversee complex projects, subcontractors, and timelines with ease.", icon: Briefcase },
      { title: "Architect & Designer", href: "/features/renovation-experts", description: "Collaborate on blueprints, material selections, and client approvals.", icon: DraftingCompass },
      { title: "Remodeler", href: "/features/renovation-experts", description: "Streamline kitchen, bath, and whole-home renovation projects.", icon: Wrench },
    ];

    const features = [
      { title: "Field Management", href: "/features", description: "Coordinate teams and tasks on-site." },
      { title: "Project Management", href: "/features", description: "Plan, track, and complete projects." },
      { title: "Architecture Planner", href: "/features", description: "Visualize and design spaces." },
      { title: "Reporting", href: "/features", description: "Gain insights with powerful analytics." },
      { title: "Forms & Checklists", href: "/features", description: "Standardize processes and inspections." },
      { title: "RFIs", href: "/features", description: "Manage requests for information." },
      { title: "Submittals", href: "/features", description: "Track and approve project documents." },
      { title: "Communication Management", href: "/features", description: "Centralize team and client conversations." },
      { title: "Remote Monitoring", href: "/features", description: "Keep an eye on progress from anywhere." },
      { title: "Budget Tracker", href: "/features", description: "Control costs and manage finances." },
      { title: "Material Inventory", href: "/features", description: "Track stock and order materials." },
      { title: "Milestone Timeline", href: "/features", description: "Visualize key project dates." },
      { title: "Microloan Tracker", href: "/features", description: "Manage small project loans." },
    ];

    const ListItem = React.forwardRef(({ className, title, children, href, ...props }, ref) => {
      const navigate = useNavigate();
      const handleClick = (e) => {
        e.preventDefault();
        navigate(href);
      };
      return (
        <li>
          <NavigationMenuLink asChild>
            <a
              href={href}
              onClick={handleClick}
              ref={ref}
              className={cn(
                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                className
              )}
              {...props}
            >
              <div className="text-sm font-medium leading-none">{title}</div>
              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                {children}
              </p>
            </a>
          </NavigationMenuLink>
        </li>
      );
    });
    ListItem.displayName = "ListItem";

    const GlobalNavbar = () => {
      const [scrolled, setScrolled] = useState(false);
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
      const location = useLocation();
      const navigate = useNavigate();
      const { user, profile, signOut, loading, hasPermission } = useAuth();
      const { t } = useTranslation();

      const isHomePage = location.pathname === '/';

      const handleScroll = () => {
        setScrolled(window.scrollY > 20);
      };

      useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
      }, []);

      const closeMobileMenu = () => setMobileMenuOpen(false);

      useEffect(() => {
        closeMobileMenu();
      }, [location.pathname]);

      const handleLogout = async () => {
        await signOut();
        navigate('/');
      };

      const getInitials = (name) => {
        if (!name) return 'U';
        const names = name.split(' ');
        return names.length > 1
          ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
          : name.substring(0, 2).toUpperCase();
      };
      
      const isTransparent = isHomePage && !scrolled;

      const navClasses = cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b",
        {
          "bg-primary/80 backdrop-blur-sm border-transparent": isTransparent,
          "bg-white/95 dark:bg-gray-950/95 border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-lg": !isTransparent,
        }
      );

      const linkTextColor = isTransparent ? "text-white" : "text-gray-800 dark:text-gray-200";
      const linkHoverColor = isTransparent ? "hover:text-gray-200" : "hover:text-primary dark:hover:text-primary";
      
      const activeLinkUnderline = "after:bg-primary";
      const hoverLinkUnderline = "group-hover:after:bg-primary";
      
      const navLinkClasses = ({ isActive }) => cn(
        "relative group text-sm font-medium transition-colors duration-300",
        linkTextColor,
        linkHoverColor,
        "after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-full after:transition-transform after:duration-300 after:scale-x-0",
        hoverLinkUnderline,
        isActive && `after:scale-x-100 ${activeLinkUnderline}`
      );

      const navMenuTriggerClasses = cn(
        navigationMenuTriggerStyle(),
        "bg-transparent text-sm font-medium",
        linkTextColor,
        linkHoverColor,
        "focus:bg-transparent data-[state=open]:bg-transparent hover:bg-transparent"
      );
      
      const Logo = () => (
        <Link to="/" className="flex items-baseline space-x-1 flex-shrink-0">
          <span className={cn("font-poppins text-xl lg:text-2xl font-bold transition-colors duration-300", isTransparent ? "text-white" : "text-gray-900 dark:text-white")}>DOMUS</span>
          <span className={cn("font-poppins text-xl lg:text-2xl font-light transition-colors duration-300", isTransparent ? "text-orange-300" : "text-primary")}>builder</span>
        </Link>
      );

      const renderUserMenu = () => (
        <div className="flex items-center gap-2 md:gap-4">
          <LanguageSwitcher isTransparentBg={isTransparent} />
          {loading ? (
            <div className="h-10 w-24 rounded-md bg-gray-200/50 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2 md:gap-4">
              <Button variant="ghost" className={cn(linkTextColor, linkHoverColor, "hidden sm:inline-flex")} onClick={() => navigate('/dashboard')}>{t('navbar.dashboard')}</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button>
                    <Avatar>
                      <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                      <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white dark:bg-gray-950 text-gray-950 dark:text-gray-50">
                  <DropdownMenuLabel>{profile?.full_name || user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>{t('navbar.dashboard')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/account/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>{t('navbar.profile')}</span>
                  </DropdownMenuItem>
                  {hasPermission('Admin') && (
                    <DropdownMenuItem onClick={() => navigate('/account/permissions')}>
                        <UserCog className="mr-2 h-4 w-4" />
                        <span>{t('navbar.user_permissions')}</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50 dark:focus:text-white">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('navbar.logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Button asChild variant="ghost" className={cn(linkTextColor, linkHoverColor, "px-2 sm:px-4")}>
                <Link to="/login">{t('navbar.login')}</Link>
              </Button>
              <Button asChild className="bg-orange-500 text-white hover:bg-orange-600 px-2 sm:px-4">
                <Link to="/request-demo">{t('navbar.request_demo')}</Link>
              </Button>
              <Button asChild className="bg-primary text-white hover:bg-primary/90 px-2 sm:px-4">
                <Link to="/signup">{t('navbar.register')}</Link>
              </Button>
            </div>
          )}
        </div>
      );

      const MobileNavLink = ({ to, children }) => (
        <NavLink
            to={to}
            onClick={closeMobileMenu}
            className={({isActive}) => cn("font-medium block py-2 text-gray-700 dark:text-gray-200", isActive && "text-primary dark:text-primary")}
        >
            {children}
        </NavLink>
      );
      
      const renderMobileMenu = () => (
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className={cn("md:hidden", linkTextColor, linkHoverColor)}>
              <Menu />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="w-full max-w-sm sm:max-w-md bg-white dark:bg-gray-950 text-gray-950 dark:text-gray-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left"
          >
            <SheetHeader>
              <SheetTitle>
                 <Link to="/" className="flex items-baseline space-x-1 flex-shrink-0">
                    <span className="font-poppins text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">DOMUS</span>
                    <span className="font-poppins text-xl lg:text-2xl font-light text-primary">builder</span>
                </Link>
              </SheetTitle>
            </SheetHeader>
            <div className="mt-8 flex flex-col gap-2">
              <MobileNavLink to="/">{t('navbar.home')}</MobileNavLink>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="solutions">
                  <AccordionTrigger className="text-gray-700 dark:text-gray-200">Solutions</AccordionTrigger>
                  <AccordionContent className="pl-4 flex flex-col gap-1">
                    {solutions.map(s => <MobileNavLink key={s.title} to={s.href}>{s.title}</MobileNavLink>)}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="features">
                  <AccordionTrigger className="text-gray-700 dark:text-gray-200">{t('navbar.features')}</AccordionTrigger>
                  <AccordionContent className="pl-4 flex flex-col gap-1">
                    {features.map(f => <MobileNavLink key={f.title} to={f.href}>{f.title}</MobileNavLink>)}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              <MobileNavLink to="/toolkits">{t('navbar.toolkits')}</MobileNavLink>
              <MobileNavLink to="/pricing">{t('navbar.pricing')}</MobileNavLink>
              <hr className="my-4 border-gray-200 dark:border-gray-800" />
              {user ? (
                <>
                  <MobileNavLink to="/dashboard">{t('navbar.dashboard')}</MobileNavLink>
                  <MobileNavLink to="/ask-brain">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="h-4 w-4" />
                      <span>Ask-Builder Brain</span>
                    </div>
                  </MobileNavLink>
                  <MobileNavLink to="/account/profile">{t('navbar.profile')}</MobileNavLink>
                  {hasPermission('Admin') && (
                    <DropdownMenuItem onClick={() => navigate('/account/permissions')}>
                        <UserCog className="mr-2 h-4 w-4" />
                        <span>{t('navbar.user_permissions')}</span>
                    </DropdownMenuItem>
                  )}
                  <Button onClick={handleLogout} variant="ghost" className="justify-start text-red-500 p-0 h-auto py-2">{t('navbar.logout')}</Button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-4">
                  <Button asChild variant="outline" onClick={closeMobileMenu}><Link to="/login">{t('navbar.login')}</Link></Button>
                  <Button asChild className="w-full bg-orange-500 text-white hover:bg-orange-600" onClick={closeMobileMenu}>
                    <Link to="/request-demo">{t('navbar.request_demo')}</Link>
                  </Button>
                  <Button asChild onClick={closeMobileMenu}><Link to="/signup">{t('navbar.register')}</Link></Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      );

      return (
        <header className={navClasses} role="navigation" aria-label="Primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex-shrink-0">
                <Logo />
              </div>
              
              <div className="hidden md:flex md:items-center md:justify-center flex-1">
                <NavigationMenu>
                  <NavigationMenuList className="space-x-6">
                    <NavigationMenuItem>
                      <NavLink to="/" className={navLinkClasses}>{t('navbar.home')}</NavLink>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                      <NavigationMenuTrigger className={navMenuTriggerClasses}>Solutions</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-white dark:bg-gray-950 text-gray-950 dark:text-gray-50">
                          {solutions.map((s) => (
                            <ListItem key={s.title} title={s.title} href={s.href}>
                              <div className="flex items-start gap-3">
                                <s.icon className="h-8 w-8 text-primary mt-1" />
                                <p className="text-sm text-muted-foreground">{s.description}</p>
                              </div>
                            </ListItem>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                      <NavigationMenuTrigger className={navMenuTriggerClasses}>{t('navbar.features')}</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-3 lg:w-[600px] bg-white dark:bg-gray-950 text-gray-950 dark:text-gray-50">
                          {features.slice(0, 12).map((f) => (
                            <ListItem key={f.title} title={f.title} href={f.href}>
                              {f.description}
                            </ListItem>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                      <NavLink to="/toolkits" className={navLinkClasses}>{t('navbar.toolkits')}</NavLink>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                      <NavLink to="/pricing" className={navLinkClasses}>{t('navbar.pricing')}</NavLink>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>

              <div className="hidden md:flex items-center justify-end">
                  {renderUserMenu()}
              </div>

              <div className="md:hidden flex items-center gap-2">
                <LanguageSwitcher isTransparentBg={isTransparent} />
                {renderMobileMenu()}
              </div>
            </div>
          </div>
        </header>
      );
    };

    export default GlobalNavbar;