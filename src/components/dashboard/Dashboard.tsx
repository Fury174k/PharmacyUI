import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { ProductsView } from '../products/ProductsView';
import { SalesView } from '../sales/SalesView';
import { StockActivityView } from './StockActivityView';
import { SalesTrendsView } from './SalesTrendsView';
import { NotificationBell } from '../alerts/NotificationBell';
import { AlertsView } from '../alerts/AlertView';

export const Dashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState('products');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const renderView = () => {
    switch (currentView) {
      case 'products':
        return <ProductsView />;
      case 'sales':
        return <SalesView />;
      case 'stock-activity':
        return <StockActivityView />;
      case 'trends':                          
        return <SalesTrendsView />;
      case 'alerts':               
      return <AlertsView />;
      default:
        return <ProductsView />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 dark:border-gray-700/50 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end items-center h-16 gap-3">
              <NotificationBell />
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-sm hover:shadow"
              >
                {darkMode ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Light
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    Dark
                  </>
                )}
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="h-full">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
};