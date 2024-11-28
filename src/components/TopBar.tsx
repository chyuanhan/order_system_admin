import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const TopBar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 如果是登入頁面或未認證，不顯示 TopBar
  if (location.pathname === '/admin/login' || !isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navLinks = [
    { path: '/admin', label: 'Orders' },
    { path: '/admin/menu', label: 'Menu Management' },
    { path: '/admin/categories', label: 'Category Management' },
    { path: '/admin/sales', label: 'Sales Report' },
  ];

  const renderNavLinks = () => (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={`border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
            location.pathname === link.path ? 'border-indigo-500 text-gray-900' : ''
          }`}
        >
          {link.label}
        </Link>
      ))}
    </>
  );

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <img className="h-16 w-auto" src="/logo.jpg" alt="Restaurant Logo" />
            </div>
            {/* Desktop Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {renderNavLinks()}
            </div>
          </div>

          {/* Right Side Action Area */}
          <div className="flex items-center">
            {/* Desktop Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden md:block ml-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Logout
            </button>
            {/* Mobile Menu Button */}
            <button
              className="md:hidden ml-4 p-2"
              onClick={toggleSidebar}
            >
              <Menu className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-lg transform ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 ease-in-out md:hidden`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button onClick={toggleSidebar}>
            <X className="text-gray-600" />
          </button>
        </div>
        <nav className="mt-4 flex flex-col space-y-2 p-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                location.pathname === link.path
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setIsSidebarOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="mt-4 w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Logout
          </button>
        </nav>
      </div>
    </div>
  );
};

export default TopBar;
