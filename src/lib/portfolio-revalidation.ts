import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Portfolio ISR Revalidation Utilities
 * 
 * These functions provide on-demand revalidation for portfolio data
 * to ensure the ISR cache is updated when portfolio items are modified
 */

/**
 * Revalidate portfolio data on the about page
 * Call this after any portfolio CRUD operations in admin dashboard
 */
export function revalidatePortfolioPages() {
  try {
    // Revalidate all locale variations of about page
    revalidatePath('/[locale]/about', 'page');
    revalidatePath('/en/about');
    revalidatePath('/id/about');
    
    // Also revalidate home page if portfolio is shown there
    revalidatePath('/[locale]', 'page');
    revalidatePath('/en');
    revalidatePath('/id');
    
    console.log('Portfolio pages revalidated successfully');
    return { success: true };
  } catch (error) {
    console.error('Error revalidating portfolio pages:', error);
    return { success: false, error };
  }
}

/**
 * Revalidate portfolio data using tags
 * More granular control for specific portfolio items
 */
export function revalidatePortfolioTag() {
  try {
    revalidateTag('portfolio-data');
    console.log('Portfolio data tag revalidated successfully');
    return { success: true };
  } catch (error) {
    console.error('Error revalidating portfolio tag:', error);
    return { success: false, error };
  }
}

/**
 * Combined revalidation for portfolio updates
 * Use this in portfolio admin CRUD operations
 */
export function revalidatePortfolio() {
  const pathResult = revalidatePortfolioPages();
  const tagResult = revalidatePortfolioTag();
  
  return {
    success: pathResult.success && tagResult.success,
    pathResult,
    tagResult
  };
}