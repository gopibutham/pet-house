import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { motion } from 'motion/react';
import { PawPrint } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        // Only redirect if we're not already on the login page
        if (location.pathname !== '/login') {
          navigate('/login', { state: { from: location.pathname } });
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-6">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2,
            ease: "easeInOut"
          }}
          className="bg-orange-500 p-6 rounded-[2rem] shadow-2xl shadow-orange-200"
        >
          <PawPrint className="w-12 h-12 text-white" />
        </motion.div>
        <div className="flex flex-col items-center space-y-2">
          <div className="text-2xl font-black text-gray-900 tracking-tight">PetConnect</div>
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
              className="w-2 h-2 bg-orange-500 rounded-full"
            />
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
              className="w-2 h-2 bg-orange-500 rounded-full"
            />
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
              className="w-2 h-2 bg-orange-500 rounded-full"
            />
          </div>
        </div>
      </div>
    );
  }

  // If we're on the login page, we don't need to guard it (it handles its own logic)
  if (location.pathname === '/login') {
    // Return children but without the navbar/footer wrapper if we're on the login page
    // Actually, the wrapper is in App.tsx, so we can't easily hide it from here.
    // Let's just return children and handle the navbar/footer visibility in those components or in App.tsx.
    return <>{children}</>;
  }

  return isAuthenticated ? <>{children}</> : null;
}
