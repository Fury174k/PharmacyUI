// ============================================================================
// SKELETON LOADING COMPONENTS
// Create this file at: src/components/common/Skeletons.tsx
// ============================================================================

import React from 'react';

// ============================================================================
// BASE SKELETON COMPONENT
// ============================================================================

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'text',
  width,
  height 
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

// ============================================================================
// TABLE SKELETON COMPONENT
// ============================================================================

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ 
  rows = 5, 
  columns = 4,
  showHeader = true 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          {showHeader && (
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {Array.from({ length: columns }).map((_, index) => (
                  <th key={index} className="px-6 py-3 text-left">
                    <Skeleton width="80%" height={16} />
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <Skeleton 
                      width={colIndex === 0 ? '60%' : colIndex === columns - 1 ? '40%' : '80%'} 
                      height={16} 
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================================
// PRODUCT TABLE SKELETON (Specific for Products View)
// ============================================================================

export const ProductTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">
                <Skeleton width="60px" height={12} />
              </th>
              <th className="px-6 py-3 text-left">
                <Skeleton width="80px" height={12} />
              </th>
              <th className="px-6 py-3 text-left">
                <Skeleton width="70px" height={12} />
              </th>
              <th className="px-6 py-3 text-left">
                <Skeleton width="50px" height={12} />
              </th>
              <th className="px-6 py-3 text-left">
                <Skeleton width="60px" height={12} />
              </th>
              <th className="px-6 py-3 text-right">
                <Skeleton width="60px" height={12} className="ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: rows }).map((_, index) => (
              <tr key={index}>
                <td className="px-6 py-4">
                  <Skeleton width="80px" height={14} />
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <Skeleton width="140px" height={14} />
                    <Skeleton width="180px" height={12} />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Skeleton width="90px" height={14} />
                </td>
                <td className="px-6 py-4">
                  <Skeleton width="40px" height={14} />
                </td>
                <td className="px-6 py-4">
                  <Skeleton width="60px" height={20} variant="rectangular" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <Skeleton width="24px" height="24px" variant="rectangular" />
                    <Skeleton width="24px" height="24px" variant="rectangular" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================================
// SALES TABLE SKELETON (Specific for Sales View)
// ============================================================================

export const SalesTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">
                <Skeleton width="40px" height={12} />
              </th>
              <th className="px-6 py-3 text-left">
                <Skeleton width="90px" height={12} />
              </th>
              <th className="px-6 py-3 text-left">
                <Skeleton width="60px" height={12} />
              </th>
              <th className="px-6 py-3 text-left">
                <Skeleton width="50px" height={12} />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {Array.from({ length: rows }).map((_, index) => (
              <tr key={index}>
                <td className="px-6 py-4">
                  <Skeleton width="30px" height={14} />
                </td>
                <td className="px-6 py-4">
                  <Skeleton width="120px" height={14} />
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <Skeleton width="200px" height={14} />
                    <Skeleton width="180px" height={14} />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Skeleton width="70px" height={14} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================================
// CARD SKELETON (For Dashboard Cards)
// ============================================================================

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton width="100px" height={12} className="mb-3" />
          <Skeleton width="120px" height={32} />
        </div>
        <Skeleton variant="rectangular" width="48px" height="48px" />
      </div>
    </div>
  );
};

// ============================================================================
// CHART SKELETON (For Trends/Charts)
// ============================================================================

export const ChartSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <Skeleton width="200px" height={24} className="mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex items-end gap-2" style={{ height: '40px' }}>
            {Array.from({ length: 12 }).map((_, barIndex) => (
              <Skeleton 
                key={barIndex}
                variant="rectangular"
                width="100%"
                height={`${Math.random() * 80 + 20}%`}
              />
            ))}
          </div>
        ))}
        <div className="flex justify-between mt-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <Skeleton key={index} width="40px" height={12} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// FORM SKELETON (For Modals/Forms)
// ============================================================================

export const FormSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index}>
          <Skeleton width="100px" height={14} className="mb-2" />
          <Skeleton width="100%" height={40} variant="rectangular" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <Skeleton width="100%" height={40} variant="rectangular" />
        <Skeleton width="100%" height={40} variant="rectangular" />
      </div>
    </div>
  );
};

// ============================================================================
// STATS GRID SKELETON (For Dashboard Stats)
// ============================================================================

export const StatsGridSkeleton: React.FC<{ cards?: number }> = ({ cards = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: cards }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
};

// ============================================================================
// LIST SKELETON (For Simple Lists)
// ============================================================================

export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="p-4">
          <div className="flex items-center gap-4">
            <Skeleton variant="circular" width="40px" height="40px" />
            <div className="flex-1 space-y-2">
              <Skeleton width="60%" height={16} />
              <Skeleton width="80%" height={14} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

