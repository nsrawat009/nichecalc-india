import { useState } from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import AdSlot from './AdSlot';
import { CALCULATORS } from '../data/calculators';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Top Nav */}
      <nav className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <Link to="/" className="font-serif font-bold text-lg text-accent tracking-tight">
            NicheCalc India
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {CALCULATORS.map(c => (
              <NavLink
                key={c.id}
                to={`/${c.slug}`}
                className={({ isActive }) =>
                  `text-xs px-3 py-1.5 rounded-md transition-colors ${
                    isActive ? 'bg-accentL text-accent font-semibold' : 'text-muted hover:text-text hover:bg-bg'
                  }`
                }
              >
                {c.emoji} {c.id === 'ev-petrol' ? 'EV vs Petrol' : c.title.split(' ').slice(0, 2).join(' ')}
              </NavLink>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 text-muted hover:text-text"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-border bg-surface px-4 py-3 flex flex-col gap-1">
            {CALCULATORS.map(c => (
              <NavLink
                key={c.id}
                to={`/${c.slug}`}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `text-sm px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-accentL text-accent font-semibold' : 'text-text hover:bg-bg'
                  }`
                }
              >
                {c.emoji} {c.title}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Top AdSense banner */}
      <div className="w-full bg-surface border-b border-border py-2 flex justify-center">
        <AdSlot size="leaderboard" />
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border mt-8">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div>
              <p className="font-serif font-bold text-accent text-lg mb-1">NicheCalc India</p>
              <p className="text-xs text-muted max-w-sm">
                Free, accurate finance calculators for Indian taxpayers.
                Updated for FY 2025-26.
              </p>
              <p className="text-xs text-warn mt-2 font-medium">
                ⚠️ Not financial advice. Consult a CA for your specific situation.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-text mb-2 uppercase tracking-wide">Calculators</p>
              <div className="flex flex-col gap-1">
                {CALCULATORS.map(c => (
                  <Link key={c.id} to={`/${c.slug}`} className="text-xs text-muted hover:text-accent transition-colors">
                    {c.emoji} {c.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-border text-xs text-hint text-center">
            © 2025 NicheCalc India · Updated for FY 2025-26 · Not financial advice
          </div>
        </div>
      </footer>
    </div>
  );
}
