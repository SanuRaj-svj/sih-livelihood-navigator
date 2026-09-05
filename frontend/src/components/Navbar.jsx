import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, Map, User, LayoutDashboard, LogOut, Compass, Sun, Moon, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

/*
  BACKGROUND & TEXT COLOR CONTRACT DECLARATION:
  - Surface Background: var(--color-surface) [#FFFFFF light / #1E1E2E dark]
  - Primary Text: var(--color-text-primary) [#1A1A2E light / #FAFAFA dark]
  - Secondary Text: var(--color-text-secondary) [#4A4A5E light / #C4C4D4 dark]
  - Muted Text: var(--color-text-muted) [#8B8B9E both]
  - Border Color: var(--color-border) [#E8E2D9 light / #2E2E42 dark]
  - Primary Accent: var(--color-accent-primary) [#E85D2E light / #FF8B5E dark]
  - Secondary Accent: var(--color-accent-secondary) [#0F766E light / #2DD4BF dark]
*/

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t, LANGUAGES } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    { labelKey: 'navRecs', path: '/recommendations', icon: Sparkles, roles: ['BENEFICIARY', 'OFFICER', 'ADMIN'] },
    { labelKey: 'navJourney', path: '/roadmap', icon: Map, roles: ['BENEFICIARY', 'OFFICER', 'ADMIN'] },
    { labelKey: 'navProfile', path: '/profile', icon: User, roles: ['BENEFICIARY', 'OFFICER', 'ADMIN'] },
    { labelKey: 'navOfficer', path: '/officer-dashboard', icon: LayoutDashboard, roles: ['OFFICER', 'ADMIN'] },
  ];

  const filteredNav = navItems.filter((item) => !user || item.roles.includes(user.role));

  return (
    <header className="sticky top-0 z-50 transition-colors duration-200 bg-[var(--color-surface)] border-b border-[var(--color-border)] backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="w-10 h-10 rounded-xl bg-[var(--color-accent-primary)] flex items-center justify-center text-white font-bold shadow-md"
          >
            <Compass className="w-6 h-6 stroke-[2.5]" />
          </motion.div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-[var(--color-text-primary)]">
              {t('appName')}
            </span>
            <span className="block text-[10px] font-bold tracking-wider uppercase text-[var(--color-text-secondary)]">
              {t('appSubtitle')}
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
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors relative ${
                      isActive
                        ? 'text-[var(--color-accent-primary)] bg-[var(--color-bg)] border border-[var(--color-accent-primary)]'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg)]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${
                      isActive ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-muted)]'
                    }`} />
                    <span>{t(item.labelKey)}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[var(--color-accent-primary)]"
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Multi-Language Selector, Theme Toggle & User Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Indian Language Switcher Dropdown */}
          <div className="relative flex items-center bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-2.5 py-1.5 shadow-xs">
            <Globe className="w-4 h-4 text-[var(--color-accent-primary)] shrink-0 mr-1.5" />
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                const selectedLang = LANGUAGES.find(l => l.code === e.target.value);
                toast.success(`Language set to ${selectedLang?.native || selectedLang?.name}`);
              }}
              className="bg-transparent text-xs font-bold text-[var(--color-text-primary)] outline-none cursor-pointer pr-1"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-[var(--color-surface)] text-[var(--color-text-primary)]">
                  {lang.native} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {/* Light / Dark Theme Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            className="p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-accent-primary)] hover:opacity-90 btn-bouncy"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.button>

          {user ? (
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[var(--color-text-primary)]">{user.name}</p>
                <span className="inline-block text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider bg-[var(--color-bg)] text-[var(--color-accent-secondary)] border-[var(--color-accent-secondary)]">
                  {user.role}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                title={t('logout')}
                className="p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] transition-all btn-bouncy"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] transition-colors"
                >
                  {t('logIn')}
                </motion.button>
              </Link>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold btn-accent shadow-md transition-all btn-bouncy"
                >
                  {t('getStarted')}
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
