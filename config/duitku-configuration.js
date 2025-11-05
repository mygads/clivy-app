/**
 * Duitku NPM Package Configuration File
 * File ini diperlukan oleh package Duitku NPM untuk berfungsi
 */

// Environment variables validation
const requiredEnvVars = {
  DUITKU_BASE_URL: process.env.DUITKU_BASE_URL,
  DUITKU_API_KEY: process.env.DUITKU_API_KEY,
  DUITKU_MERCHANT_CODE: process.env.DUITKU_MERCHANT_CODE
};

// Validate required environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.warn(`Missing Duitku environment variables: ${missingVars.join(', ')}`);
}

// Configuration untuk Duitku NPM package
const duitkuConfiguration = {
  merchantCode: process.env.DUITKU_MERCHANT_CODE || '',
  apiKey: process.env.DUITKU_API_KEY || '',
  passport: process.env.DUITKU_BASE_URL ? !process.env.DUITKU_BASE_URL.includes('sandbox') : false,
  callbackUrl: process.env.NEXT_PUBLIC_APP_URL + '/api/public/duitku/callback',
  returnUrl: process.env.NEXT_PUBLIC_APP_URL + '/payment/result',
  expiryPeriod: 1440, // 24 hours in minutes
  
  // URLs
  baseUrl: process.env.DUITKU_BASE_URL || 'https://sandbox.duitku.com/webapi/api/merchant'
};

module.exports = duitkuConfiguration;