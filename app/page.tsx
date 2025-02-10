'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const HomePage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      router.push(`/u/${username}`);
    }
  };

  // Fetch users from the API with an optional search query.
  const fetchUsers = useCallback(async () => {
    try {
      const query = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : '';
      const res = await fetch(`/api/all-users${query}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6">
      <h1 className="text-5xl font-bold mb-4 text-center">
        Welcome to AnonyMessages
      </h1>

      <p className="text-lg mb-8 text-center max-w-2xl">
        AnonyMessages is a platform that lets you send and receive anonymous messages.
        Express yourself freely without revealing your identity and enjoy the surprise
        of messages from friends, family, or even strangers. Whether you want to share
        compliments, secrets, or just say hello, this is the place to do it!
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-4 w-full max-w-sm"
      >
        <input
          type="text"
          placeholder="Enter username you want to send messages to"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input input-bordered w-full p-2"
        />
        <Button type="submit" className="px-6 py-3 text-xl w-full">
          Send an Anonymous Message
        </Button>
      </form>

      {/* Scrollable Users Section */}
      <div className="mt-8 w-full max-w-3xl">
        <h2 className="text-2xl font-semibold mb-4">All Users</h2>
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="input input-bordered w-full p-2 mb-4"
        />
        <div className="max-h-64 overflow-y-auto border rounded p-4 bg-white shadow-sm">
          {users.length > 0 ? (
            <ul>
              {users.map((user) => (
                <li key={user._id} className="py-2 border-b last:border-b-0">
                  <span className="font-medium">{user.username}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
