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
    title: 'Signup',
    href: '/signup',
  },
];

const Login = () => {
  const [login, setLogin] = useState(''); // Can be either email or username
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle the login logic here, e.g., call an API to authenticate the user
  };

  return (
    <Layout joinButton={false} actions={[]}>
      <div className="bg-gray-100 mt-12">
          <div className="container mx-auto mt-auto p-4 bg-white">
            <h1 className="text-3xl font-bold text-center">Welcome Back</h1>
            <p className="text-center text-light-primary mb-4">
              LOGIN TO YOU ALEXIS ACCOUNT
              <br/>
              NOT YOUR INTRANET ACCOUNT
            </p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
            <label
              htmlFor="login"
              className="block text-sm font-medium text-gray-700"
            >
              Email/Username
            </label>
            <input
              type="text"
              id="login"
              name="login"
              value={login}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              onChange={(e) => setLogin(e.target.value)}
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
                className="w-full flex justify-center mb-4 mt-8 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-light-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Login
              </button>
            </div>
          </form>
          <div className="text-center pt-2">
            Don't have an account?{' '}
            <Link to="/signup" className="text-light-primary hover:text-blue-700">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
