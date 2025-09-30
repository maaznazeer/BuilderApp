import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const Breadcrumb = ({ className }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const formatBreadcrumb = (str) => {
    return str
      .replace(/-/g, ' ')
      .replace(/oe/g, 'ö')
      .replace(/ae/g, 'ä')
      .replace(/ue/g, 'ü')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center space-x-1.5 text-sm text-muted-foreground flex-wrap", className)}>
      <Link to="/" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
        <Home className="h-4 w-4" />
        <span>Home</span>
      </Link>

      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;

        return (
          <React.Fragment key={to}>
            <ChevronRight className="h-4 w-4" />
            {last ? (
              <span className="font-medium text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                {formatBreadcrumb(value)}
              </span>
            ) : (
              <Link to={to} className="transition-colors hover:text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                {formatBreadcrumb(value)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;