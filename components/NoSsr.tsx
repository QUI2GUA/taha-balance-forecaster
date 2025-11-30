// components/NoSsr.tsx
import React, { useState, useEffect, ReactNode } from 'react';

interface NoSsrProps {
  children: ReactNode;
}

const NoSsr: React.FC<NoSsrProps> = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Don't render anything on the server
  }

  return <>{children}</>;
};

export default NoSsr;
