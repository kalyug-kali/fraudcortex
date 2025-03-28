
import { ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

const PageContainer = ({ 
  children, 
  className,
  animate = true
}: PageContainerProps) => {
  const location = useLocation();
  
  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <main 
      className={cn(
        'page-container pt-28 pb-16 min-h-screen', // Increased top padding from pt-24 to pt-28
        animate && 'animate-fade-in',
        className
      )}
    >
      {children}
    </main>
  );
};

export default PageContainer;
