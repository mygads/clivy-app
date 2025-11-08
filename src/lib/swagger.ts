import swaggerJsdoc from 'swagger-jsdoc';

export const getApiDocs = () => {
  const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'Clivy API Documentation',
      version: '1.0.0',
      description: `Comprehensive API documentation for Clivy WhatsApp service application. This documentation covers all available endpoints, request/response schemas, authentication methods, and error handling.
      All endpoints support CORS and can be accessed from external applications like Postman or other web services.`,
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8090',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
      },
      {
        name: 'Account',
        description: 'User account management endpoints',
      },
      {
        name: 'Customer - Checkout',
        description: 'Customer checkout and payment processing',
      },
      {
        name: 'Customer - Payment',
        description: 'Customer payment management and history',
      },
      {
        name: 'Customer - Transaction',
        description: 'Customer transaction history and details',
      },
      {
        name: 'Customer - WhatsApp',
        description: 'Customer WhatsApp service management',
      },
      {
        name: 'Admin - Payment',
        description: 'Admin payment monitoring and management',
      },
      {
        name: 'Admin - Transaction',
        description: 'Admin transaction monitoring and management',
      },
      {
        name: 'Admin - WhatsApp Service',
        description: 'Admin WhatsApp service package CRUD operations',
      },
      {
        name: 'Admin - Voucher',
        description: 'Admin voucher CRUD operations',
      },
      {
        name: 'Admin - Dashboard',
        description: 'Admin dashboard statistics and analytics',
      },
      {
        name: 'Public',
        description: 'Public endpoints accessible without authentication',
      },
      {
        name: 'Health',
        description: 'System health check endpoints',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /api/auth/signin endpoint',
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'api-key',
          description: 'API Key for service-to-service authentication',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              description: 'Error message',
            },
            message: {
              type: 'string',
              description: 'Detailed error message',
            },
            code: {
              type: 'string',
              description: 'Error code for programmatic handling',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID (CUID)',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            name: {
              type: 'string',
              description: 'User full name',
            },
            role: {
              type: 'string',
              enum: ['user', 'admin', 'super_admin'],
              description: 'User role',
            },
            phone: {
              type: 'string',
              description: 'User phone number (normalized format)',
            },
            phoneVerified: {
              type: 'boolean',
              description: 'Phone verification status',
            },
            emailVerified: {
              type: 'boolean',
              description: 'Email verification status',
            },
            image: {
              type: 'string',
              nullable: true,
              description: 'User profile image URL',
            },
            isActive: {
              type: 'boolean',
              description: 'Account active status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Payment ID (CUID)',
            },
            amount: {
              type: 'number',
              description: 'Payment amount',
            },
            currency: {
              type: 'string',
              enum: ['idr', 'usd'],
              description: 'Payment currency',
            },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'success', 'failed', 'expired'],
              description: 'Payment status',
            },
            paymentMethod: {
              type: 'string',
              description: 'Payment method code',
            },
            gatewayReference: {
              type: 'string',
              nullable: true,
              description: 'Payment gateway reference ID',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Transaction ID (CUID)',
            },
            userId: {
              type: 'string',
              description: 'User ID who created the transaction',
            },
            type: {
              type: 'string',
              enum: ['whatsapp_service', 'topup'],
              description: 'Transaction type',
            },
            amount: {
              type: 'number',
              description: 'Transaction amount',
            },
            currency: {
              type: 'string',
              enum: ['idr', 'usd'],
            },
            status: {
              type: 'string',
              enum: ['created', 'pending', 'processing', 'completed', 'failed', 'expired'],
              description: 'Transaction status',
            },
            discountAmount: {
              type: 'number',
              nullable: true,
            },
            originalAmount: {
              type: 'number',
              nullable: true,
            },
            totalAfterDiscount: {
              type: 'number',
              nullable: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
          },
        },
        WhatsAppService: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Service ID (CUID)',
            },
            userId: {
              type: 'string',
              description: 'Owner user ID',
            },
            instanceId: {
              type: 'string',
              description: 'WhatsApp instance ID from WA-GO service',
            },
            phoneNumber: {
              type: 'string',
              nullable: true,
              description: 'Connected WhatsApp number',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'suspended', 'expired'],
              description: 'Service status',
            },
            packageId: {
              type: 'string',
              description: 'WhatsApp package ID',
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'Service expiration date',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        WhatsAppPackage: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
            description: {
              type: 'string',
              nullable: true,
            },
            priceMonth: {
              type: 'number',
              description: 'Monthly price',
            },
            priceYear: {
              type: 'number',
              description: 'Yearly price',
            },
            maxSession: {
              type: 'integer',
              description: 'Maximum concurrent WhatsApp sessions',
            },
            features: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            isActive: {
              type: 'boolean',
            },
          },
        },
        Voucher: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
            },
            code: {
              type: 'string',
              description: 'Unique voucher code',
            },
            name: {
              type: 'string',
            },
            type: {
              type: 'string',
              enum: ['percentage', 'fixed_amount'],
              description: 'Discount calculation type',
            },
            discountType: {
              type: 'string',
              description: 'Display discount type',
            },
            value: {
              type: 'number',
              description: 'Discount value (percentage or fixed amount)',
            },
            maxUses: {
              type: 'integer',
              nullable: true,
              description: 'Maximum number of uses',
            },
            usedCount: {
              type: 'integer',
              description: 'Current usage count',
            },
            minAmount: {
              type: 'number',
              nullable: true,
              description: 'Minimum order amount',
            },
            maxDiscount: {
              type: 'number',
              nullable: true,
              description: 'Maximum discount amount (for percentage type)',
            },
            startDate: {
              type: 'string',
              format: 'date-time',
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            isActive: {
              type: 'boolean',
            },
          },
        },
      },
    },
    security: [],
  };

  const options = {
    swaggerDefinition,
    // Scan multiple locations for JSDoc comments
    apis: [
      './src/app/api/**/route.ts',           // All API route files
      './src/lib/swagger-endpoints.ts',      // Centralized documentation
    ],
  };

  const spec = swaggerJsdoc(options);
  return spec;
};
