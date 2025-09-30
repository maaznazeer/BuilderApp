import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { User, CreditCard, Settings, Home, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const AccountLayout = () => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const getInitials = (name) => {
    if (!name) return 'DB';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const navLinks = [
    { to: '/account/profile', text: 'Profile', icon: User },
    { to: '/account/billing', text: 'Billing', icon: CreditCard },
    { to: '/account/settings', text: 'Settings', icon: Settings },
  ];

  const SideNavContent = () => (
    <div className="p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-100 h-full">
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="w-24 h-24 text-3xl">
          <AvatarImage src={user?.avatar_url} alt={user?.full_name} />
          <AvatarFallback>{getInitials(user?.full_name)}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">{user?.full_name}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <p className="text-sm text-gray-500 capitalize mt-1">{user?.app_role}</p>
        </div>
      </div>
      <nav className="mt-8 space-y-1">
        {navLinks.map(({ to, text, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `group rounded-lg px-3 py-3 flex items-center text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon
              className="flex-shrink-0 mr-3 h-5 w-5"
              aria-hidden="true"
            />
            <span className="truncate">{text}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[300px] bg-transparent border-none">
                <SideNavContent />
              </SheetContent>
            </Sheet>
          </div>
          <Link to="/" className="flex items-baseline space-x-1 flex-shrink-0">
            <span className="font-poppins text-xl lg:text-2xl font-bold text-[#2C3E50]">DOMUS</span>
            <span className="font-poppins text-xl lg:text-2xl font-light text-[#E67E22]">builder</span>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Button>
          </Link>
        </div>
      </header>
      <main className="max-w-screen-xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <aside className="hidden lg:block lg:col-span-3">
            <SideNavContent />
          </aside>

          <div className="mt-6 lg:mt-0 lg:col-span-9">
             <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                <Outlet />
              </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountLayout;