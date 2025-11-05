"use client";

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface RevenueChartData {
  revenue: Array<{
    date: string;
    period: string;
    transactions: number;
    revenue: number;
  }>;
  daily: Array<{
    date: string;
    transactions: number;
    revenue: number;
  }>;
  type: 'hourly' | 'daily' | 'weekly' | 'monthly';
  hourly: Array<{
    hour: number;
    count: number;
    percentage: number;
  }>;
}

interface PaymentMethodData {
  method: string;
  count: number;
  revenue: number;
  percentage: number;
}

interface CategoryData {
  type: string;
  _count: { id: number };
  _sum: { finalAmount: number };
}

interface RevenueChartProps {
  data: RevenueChartData;
  currency: string;
  period: string;
}

interface PaymentMethodChartProps {
  data: PaymentMethodData[];
  currency: string;
}

interface CategoryChartProps {
  data: CategoryData[];
  currency: string;
}

interface HourlyDistributionChartProps {
  data: Array<{
    hour: number;
    count: number;
    percentage: number;
  }>;
}

// Helper function to format currency
function formatCurrency(amount: number | null | undefined, currency: string): string {
  // Handle null, undefined, or NaN values
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return currency === 'idr' ? 'Rp 0' : '$0.00';
  }
  
  const numericAmount = Number(amount);
  
  if (currency === 'idr') {
    return `Rp ${numericAmount.toLocaleString('id-ID')}`;
  } else {
    return `$${numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }
}

// Helper function to format payment method names
function formatPaymentMethod(method: string): string {
  const methods: { [key: string]: string } = {
    'manual_bank_transfer': 'Bank Transfer',
    'credit_card': 'Credit Card',
    'debit_card': 'Debit Card',
    'e_wallet': 'E-Wallet',
    'virtual_account': 'Virtual Account',
    'qris': 'QRIS',
    'gopay': 'GoPay',
    'ovo': 'OVO',
    'dana': 'DANA',
    'shopeepay': 'ShopeePay',
    'linkaja': 'LinkAja'
  };
  return methods[method] || method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Revenue Trend Chart (Line Chart) - Enhanced for all period types
export function RevenueTrendChart({ data, currency, period }: RevenueChartProps) {
  // Determine chart title and data based on period
  const getChartTitle = () => {
    switch (period) {
      case 'Today': return 'Revenue per Hour (Today)';
      case 'Last 7 Days': return 'Revenue per Day (Last 7 Days)';
      case 'Last 30 Days': return 'Revenue per Day (This Month)';
      case 'All Time': return 'Revenue per Week (All Time)';
      default: return 'Revenue Trends';
    }
  };

  // Use revenue data which contains the properly formatted data for each period
  const chartData = data.revenue || data.daily || [];
  const hasData = chartData && chartData.length > 0;

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(156, 163, 175)', // text-gray-400
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: getChartTitle(),
        color: 'rgb(156, 163, 175)',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        callbacks: {
          title: function(context) {
            const point = context[0];
            const dataPoint = chartData[point.dataIndex];
            
            // Custom title based on period type
            if (period === 'Today') {
              return `Hour: ${dataPoint.date}`;
            } else if (period === 'Last 7 Days') {
              return `Day: ${dataPoint.date}`;
            } else if (period === 'Last 30 Days') {
              const dayNum = dataPoint.date;
              const today = new Date();
              const targetDate = new Date(today.getFullYear(), today.getMonth(), parseInt(dayNum));
              return `${targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
            } else if (period === 'All Time') {
              return `Week: ${dataPoint.date}`;
            }
            return dataPoint.date;
          },
          label: function(context) {
            if (context.datasetIndex === 0) {
              return `Revenue: ${formatCurrency(context.parsed.y, currency)}`;
            } else {
              return `Transactions: ${context.parsed.y}`;
            }
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          maxTicksLimit: period === 'Last 30 Days' ? 15 : period === 'Today' ? 12 : 10,
          callback: function(value, index) {
            const dataPoint = chartData[index];
            if (!dataPoint) return '';
            
            // Custom label formatting based on period
            if (period === 'Today') {
              // Show every 2nd hour for readability
              const hour = parseInt(dataPoint.date.split(':')[0]);
              return index % 2 === 0 ? dataPoint.date : '';
            } else if (period === 'Last 7 Days') {
              return dataPoint.date;
            } else if (period === 'Last 30 Days') {
              // Show every 3rd day for readability  
              return index % 3 === 0 ? dataPoint.date : '';
            } else if (period === 'All Time') {
              return dataPoint.date;
            }
            return dataPoint.date;
          }
        },
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          callback: function(value) {
            return formatCurrency(Number(value), currency);
          }
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
      },
    },
  };

  if (!hasData) {
    return (
      <div className="h-80 w-full flex items-center justify-center bg-gradient-to-r from-brand-blue/5 to-brand-red/5 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <h4 className="text-lg font-semibold text-muted-foreground mb-2">No Data Available</h4>
          <p className="text-sm text-muted-foreground">
            {period === 'Today' ? 'No hourly revenue data for today' :
             period === 'Last 7 Days' ? 'No daily revenue data for the last 7 days' :
             period === 'Last 30 Days' ? 'No daily revenue data for this month' :
             'No weekly revenue data available'}
          </p>
        </div>
      </div>
    );
  }

  const processedChartData = {
    labels: chartData.map(item => item.date),
    datasets: [
      {
        label: 'Revenue',
        data: chartData.map(item => item.revenue || 0),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
      },
      {
        label: 'Transactions',
        data: chartData.map(item => item.transactions || 0),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        yAxisID: 'y1',
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: 'white',
        pointBorderWidth: 1,
      },
    ],
  };

  return (
    <div className="h-80 w-full">
      <Line data={processedChartData} options={chartOptions} />
    </div>
  );
}

// Payment Methods Chart (Doughnut Chart)
export function PaymentMethodChart({ data, currency }: PaymentMethodChartProps) {
  const colors = [
    'rgba(59, 130, 246, 0.8)',   // blue-500
    'rgba(239, 68, 68, 0.8)',    // red-500
    'rgba(34, 197, 94, 0.8)',    // green-500
    'rgba(245, 158, 11, 0.8)',   // amber-500
    'rgba(168, 85, 247, 0.8)',   // purple-500
    'rgba(236, 72, 153, 0.8)',   // pink-500
    'rgba(14, 165, 233, 0.8)',   // sky-500
    'rgba(34, 197, 94, 0.8)',    // emerald-500
  ];

  const borderColors = [
    'rgb(59, 130, 246)',   // blue-500
    'rgb(239, 68, 68)',    // red-500
    'rgb(34, 197, 94)',    // green-500
    'rgb(245, 158, 11)',   // amber-500
    'rgb(168, 85, 247)',   // purple-500
    'rgb(236, 72, 153)',   // pink-500
    'rgb(14, 165, 233)',   // sky-500
    'rgb(34, 197, 94)',    // emerald-500
  ];

  const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgb(156, 163, 175)',
          font: {
            size: 12,
          },
          padding: 20,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: 'Payment Methods Distribution',
        color: 'rgb(156, 163, 175)',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const method = data[context.dataIndex];
            return [
              `${formatPaymentMethod(method.method)}`,
              `Revenue: ${formatCurrency(method.revenue, currency)}`,
              `Count: ${method.count} transactions`,
              `Percentage: ${method.percentage.toFixed(1)}%`
            ];
          }
        }
      }
    },
  };

  const chartData = {
    labels: data.map(item => formatPaymentMethod(item.method)),
    datasets: [
      {
        data: data.map(item => item.revenue),
        backgroundColor: colors.slice(0, data.length),
        borderColor: borderColors.slice(0, data.length),
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  };

  return (
    <div className="h-80 w-full">
      <Doughnut data={chartData} options={chartOptions} />
    </div>
  );
}

// Hourly Distribution Chart (Bar Chart)
export function HourlyDistributionChart({ data }: HourlyDistributionChartProps) {
  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Hourly Transaction Distribution',
        color: 'rgb(156, 163, 175)',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const item = data[context.dataIndex];
            return [
              `Hour: ${item.hour}:00`,
              `Transactions: ${item.count}`,
              `Percentage: ${item.percentage.toFixed(1)}%`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          callback: function(value) {
            return `${value}:00`;
          }
        },
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
      },
    },
  };

  // Create gradient
  const createGradient = (ctx: CanvasRenderingContext2D) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0.8)');
    return gradient;
  };

  const chartData = {
    labels: data.map(item => item.hour),
    datasets: [
      {
        label: 'Transactions',
        data: data.map(item => item.count),
        backgroundColor: function(context: any) {
          const chart = context.chart;
          const {ctx} = chart;
          return createGradient(ctx);
        },
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  return (
    <div className="h-80 w-full">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}

// Category Performance Chart (Bar Chart)
export function CategoryChart({ data, currency }: CategoryChartProps) {
  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Category Performance',
        color: 'rgb(156, 163, 175)',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const item = data[context.dataIndex];
            return [
              `Category: ${item.type}`,
              `Revenue: ${formatCurrency(Number(item._sum.finalAmount || 0), currency)}`,
              `Transactions: ${item._count.id}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          callback: function(value) {
            return formatCurrency(Number(value), currency);
          }
        },
      },
    },
  };

  const colors = [
    'rgba(34, 197, 94, 0.8)',    // green-500
    'rgba(59, 130, 246, 0.8)',   // blue-500
    'rgba(168, 85, 247, 0.8)',   // purple-500
    'rgba(245, 158, 11, 0.8)',   // amber-500
  ];

  const chartData = {
    labels: data.map(item => item.type.charAt(0).toUpperCase() + item.type.slice(1)),
    datasets: [
      {
        label: 'Revenue',
        data: data.map(item => Number(item._sum.finalAmount || 0)),
        backgroundColor: colors.slice(0, data.length),
        borderColor: colors.slice(0, data.length).map(color => color.replace('0.8', '1')),
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  return (
    <div className="h-80 w-full">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}
