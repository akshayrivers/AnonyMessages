'use client';
import React from 'react';
import { useSession, signOut } from 'next-auth/react';

import { Button } from '@react-email/components';

const Navbar = () => {
  const { data: session } = useSession();


  // Helper function to perform a full redirect.
  const redirectTo = (url: string) => {
    window.location.href = url;
  };

  return (
    <nav className="p-4 md:p-6 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
  
        <a className="text-xl font-bold mb-4 md:mb-0" href="/">
          Home
        </a>

        <div>
          {session?(<>
            <Button
            className="w-full md:w-auto font-bold"
            onClick={() => redirectTo('/dashboard')}
          >
            Dashboard
          </Button>
          </>):(<>
          <div className="w-full md:w-auto font-bold">Please login to access dashboard</div>
          </>)}
          
        </div>
        <div>
          <Button
          className="w-full md:w-auto font-bold"
          onClick={() => redirectTo('/u/orange')}>
            Send Anonymous Message to author
          </Button>
        </div>
        {session ? (
          <>
            <Button className="w-full md:w-auto font-bold" onClick={() => signOut()}>
              Logout
            </Button>
          </>
        ) : (
          // Login button also uses onClick to redirect
          <Button
            className="w-full md:w-auto font-bold"
            onClick={() => redirectTo('/sign-in')}
          >
            Login
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
