import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-4 no-print">
      <Link
        to="/dashboard"
        className="flex items-center gap-1 hover:text-indigo-600 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            {isLast || !item.to ? (
              <span className="font-semibold text-slate-800">{item.label}</span>
            ) : (
              <Link
                to={item.to}
                className="hover:text-indigo-600 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
