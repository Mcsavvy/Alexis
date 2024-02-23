import * as React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout, {Action} from './Layout';

const actions: Action[] = [
  {
    title: 'Support',
    href: '#',
  },
  {
    title: 'Login',
    href: '/login',
  },
];

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle the signup logic here, e.g., call an API to create a new user account
  };

  return (
    <Layout joinButton={false} actions={[]}>
      <div className=" bg-gray-100 mt-4">
        <div className="container mx-auto mt-auto p-3 bg-white">
          <h1 className="text-3xl font-bold text-center">Create Account</h1>
          <p className="text-center text-light-primary mb-4">
            YOU ARE NOT EXPECTED TO ENTER YOU INTRANET DETAILS
          </p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center mt-8 mb-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-light-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign Up
              </button>
            </div>
          </form>
          <div className="text-center">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-light-primary hover:text-blue-700"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignUp;
