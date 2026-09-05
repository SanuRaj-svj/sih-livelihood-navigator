import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Map, User, LayoutDashboard, LogOut, Compass } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    { label: 'Recommendations', path: '/recommendations', icon: Sparkles, roles: ['BENEFICIARY', 'OFFICER', 'ADMIN'] },
    { label: 'My Journey', path: '/roadmap', icon: Map, roles: ['BENEFICIARY', 'OFFICER', 'ADMIN'] },
    { label: 'My Profile', path: '/profile', icon: User, roles: ['BENEFICIARY', 'OFFICER', 'ADMIN'] },
    { label: 'Officer Dashboard', path: '/officer-dashboard', icon: LayoutDashboard, roles: ['OFFICER', 'ADMIN'] },
  ];

  const filteredNav = navItems.filter((item) => !user || item.roles.includes(user.role));

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/20"
          >
            <Compass className="w-6 h-6 stroke-[2.5]" />
          </motion.div>
          <div>
            <span className="text-lg font-extrabold bg-gradient-to-r from-teal-400 via-emerald-300 to-white bg-clip-text text-transparent">
              Livelihood Navigator
            </span>
            <span className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              AI Skill & Career Platform
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        {user && (
          <nav className="hidden md:flex items-center space-x-1">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors relative ${
                      isActive
                        ? 'text-teal-300 bg-teal-500/10 border border-teal-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        )}

        {/* User Info & Actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-200">{user.name}</p>
                <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30 uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                title="Logout"
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition-all"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  Log In
                </motion.button>
              </Link>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold shadow-lg shadow-teal-500/20 transition-all"
                >
                  Get Started
                </motion.button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
