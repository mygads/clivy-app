import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency with proper locale and currency symbol
export function formatCurrency(amount: number, currency: string = 'IDR'): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return '0';
  }

  const currencyUpper = currency.toUpperCase();
  
  try {
    if (currencyUpper === 'IDR') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(numericAmount);
    } else if (currencyUpper === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericAmount);
    } else {
      // Fallback for other currencies
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyUpper,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericAmount);
    }
  } catch (error) {
    // Fallback if currency is not supported
    return `${currencyUpper} ${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: currencyUpper === 'IDR' ? 0 : 2,
      maximumFractionDigits: currencyUpper === 'IDR' ? 0 : 2,
    }).format(numericAmount)}`;
  }
}

// Format date to readable format
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };

    return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj);
  } catch (error) {
    return 'Invalid Date';
  }
}

// Format date to just date (no time)
export function formatDateOnly(date: string | Date): string {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Format relative time (e.g., "2 days ago")
export function formatRelativeTime(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  } catch (error) {
    return 'Unknown';
  }
}
