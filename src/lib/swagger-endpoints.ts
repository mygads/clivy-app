/**
 * Swagger API Documentation Endpoints
 * 
 * This file contains JSDoc comments for all API endpoints.
 * These will be automatically parsed by swagger-jsdoc.
 * 
 * ⚠️ IMPORTANT: This documentation is generated based on actual API route files
 * Each endpoint is verified to match the real implementation
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *     ApiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: api-key
 */

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email/phone and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email or phone number
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 description: User password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: User registration
 *     description: Register a new user account with phone (WhatsApp), email, and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name
 *                 example: "John Doe"
 *               phone:
 *                 type: string
 *                 description: WhatsApp number (international format) - REQUIRED
 *                 example: "+6281234567890"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address (optional)
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Password (optional, auto-generated if not provided)
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: User created successfully, OTP sent via WhatsApp
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 token:
 *                   type: string
 *                 nextStep:
 *                   type: string
 *                 phoneVerificationRequired:
 *                   type: boolean
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: User already exists
 */

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send or resend OTP
 *     description: Send OTP code via WhatsApp or Email for various purposes (signup, email-verification, password-reset)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email or phone number
 *                 example: "+6281234567890"
 *               purpose:
 *                 type: string
 *                 enum: [signup, email-verification, password-reset]
 *                 description: Purpose of OTP
 *                 example: "signup"
 *     responses:
 *       200:
 *         description: OTP sent successfully (4-digit code, valid for 60 minutes)
 *       404:
 *         description: User not found
 *       429:
 *         description: Rate limit exceeded (10 minute cooldown for password-reset)
 */

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP code
 *     description: Verify the OTP code sent to user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - otp
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email or phone number
 *               otp:
 *                 type: string
 *                 description: 4-digit OTP code
 *                 example: "1234"
 *               purpose:
 *                 type: string
 *                 enum: [signup, email-verification]
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */

/**
 * @swagger
 * /api/auth/send-password-reset-otp:
 *   post:
 *     summary: Send password reset OTP
 *     description: Send OTP for password reset via email or WhatsApp
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email or phone number
 *     responses:
 *       200:
 *         description: Reset OTP sent
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/auth/verify-password-reset-otp:
 *   post:
 *     summary: Verify password reset OTP and reset password
 *     description: Verify OTP and set new password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - otp
 *               - newPassword
 *             properties:
 *               identifier:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successful
 */

// ============================================================================
// ACCOUNT MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/account/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve authenticated user's profile information
 *     tags: [Account]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *   put:
 *     summary: Update user profile
 *     description: Update authenticated user's profile
 *     tags: [Account]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */

/**
 * @swagger
 * /api/account/logout:
 *   post:
 *     summary: User logout
 *     description: Logout user and invalidate session token
 *     tags: [Account]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /api/account/change-password:
 *   post:
 *     summary: Change password
 *     description: Change user's password (requires current password, minimum 6 characters)
 *     tags: [Account]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       403:
 *         description: Current password is incorrect
 */

/**
 * @swagger
 * /api/account/session:
 *   get:
 *     summary: Get user sessions
 *     description: List all active sessions for the authenticated user
 *     tags: [Account]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Sessions retrieved
 */

/**
 * @swagger
 * /api/account/profile/image:
 *   post:
 *     summary: Upload profile image
 *     description: Upload or update user profile picture
 *     tags: [Account]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 */

// ============================================================================
// CUSTOMER - CHECKOUT ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/customer/checkout:
 *   post:
 *     summary: Create checkout transaction
 *     description: Create a new checkout transaction for WhatsApp service
 *     tags: [Customer - Checkout]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - whatsapp
 *             properties:
 *               whatsapp:
 *                 type: object
 *                 required:
 *                   - packageId
 *                   - duration
 *                 properties:
 *                   packageId:
 *                     type: string
 *                     description: WhatsApp package ID
 *                   duration:
 *                     type: string
 *                     enum: [month, year]
 *                     description: Subscription duration
 *               voucherCode:
 *                 type: string
 *                 description: Optional voucher code
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *     responses:
 *       200:
 *         description: Checkout created successfully
 *       401:
 *         description: Unauthorized
 */

// ============================================================================
// CUSTOMER - PAYMENT ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/customer/payment/create:
 *   post:
 *     summary: Create payment
 *     description: Create a payment for a transaction with selected payment method (includes service fee calculation)
 *     tags: [Customer - Payment]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactionId
 *               - paymentMethod
 *             properties:
 *               transactionId:
 *                 type: string
 *                 description: Transaction ID from checkout (CUID format)
 *               paymentMethod:
 *                 type: string
 *                 description: Payment method code
 *     responses:
 *       200:
 *         description: Payment created successfully (returns payment URL and details)
 */

/**
 * @swagger
 * /api/customer/payment/{paymentId}:
 *   get:
 *     summary: Get payment details
 *     description: Retrieve payment information by ID
 *     tags: [Customer - Payment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment details retrieved
 */

/**
 * @swagger
 * /api/customer/payment/{paymentId}/status:
 *   get:
 *     summary: Check payment status
 *     description: Get current payment status
 *     tags: [Customer - Payment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment status retrieved
 */

/**
 * @swagger
 * /api/customer/payment/{paymentId}/cancel:
 *   post:
 *     summary: Cancel payment
 *     description: Cancel a pending payment
 *     tags: [Customer - Payment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment cancelled
 */

/**
 * @swagger
 * /api/customer/payment/{paymentId}/receipt:
 *   get:
 *     summary: Download payment receipt
 *     description: Get payment receipt/invoice
 *     tags: [Customer - Payment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Receipt retrieved
 */

/**
 * @swagger
 * /api/customer/payment/methods:
 *   get:
 *     summary: Get available payment methods
 *     description: List all available payment methods
 *     tags: [Customer - Payment]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Payment methods retrieved
 */

// ============================================================================
// CUSTOMER - TRANSACTION ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/customer/transactions:
 *   get:
 *     summary: List user transactions
 *     description: Get all transactions for authenticated user with pagination and filtering
 *     tags: [Customer - Transaction]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [created, pending, processing, completed, failed, expired, all]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Transaction list retrieved (includes currency detection, whatsappTransaction, payment, voucher relations)
 */

/**
 * @swagger
 * /api/customer/transactions/{transactionId}:
 *   get:
 *     summary: Get transaction details
 *     description: Retrieve transaction information by ID
 *     tags: [Customer - Transaction]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction details retrieved
 */

/**
 * @swagger
 * /api/customer/transactions/{transactionId}/cancel:
 *   post:
 *     summary: Cancel transaction
 *     description: Cancel a pending transaction
 *     tags: [Customer - Transaction]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction cancelled
 */

/**
 * @swagger
 * /api/customer/transactions/active:
 *   get:
 *     summary: Get active transactions
 *     description: Get list of active (non-completed) transactions
 *     tags: [Customer - Transaction]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Active transactions retrieved
 */

/**
 * @swagger
 * /api/customer/dashboard:
 *   get:
 *     summary: Get customer dashboard data
 *     description: Retrieve dashboard statistics and overview for customer
 *     tags: [Customer - Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved
 */

// ============================================================================
// CUSTOMER - WHATSAPP MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/customer/whatsapp/sessions:
 *   get:
 *     summary: List WhatsApp sessions
 *     description: Get all WhatsApp sessions for authenticated user (checks subscription status)
 *     tags: [Customer - WhatsApp]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: WhatsApp sessions retrieved
 *   post:
 *     summary: Create WhatsApp session
 *     description: Create a new WhatsApp session/instance
 *     tags: [Customer - WhatsApp]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               webhook:
 *                 type: string
 *     responses:
 *       201:
 *         description: Session created
 */

/**
 * @swagger
 * /api/customer/whatsapp/sessions/{sessionId}:
 *   get:
 *     summary: Get session details
 *     description: Retrieve WhatsApp session information
 *     tags: [Customer - WhatsApp]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session details retrieved
 *   delete:
 *     summary: Delete session
 *     description: Delete a WhatsApp session
 *     tags: [Customer - WhatsApp]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session deleted
 */

/**
 * @swagger
 * /api/customer/whatsapp/sessions/{sessionId}/logout:
 *   post:
 *     summary: Logout WhatsApp session
 *     description: Logout from WhatsApp on this session
 *     tags: [Customer - WhatsApp]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session logged out
 */

/**
 * @swagger
 * /api/customer/whatsapp/subscriptions:
 *   get:
 *     summary: Get WhatsApp subscriptions
 *     description: Get user's WhatsApp service subscriptions
 *     tags: [Customer - WhatsApp]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Subscriptions retrieved
 */

/**
 * @swagger
 * /api/customer/whatsapp/dashboard-stats:
 *   get:
 *     summary: Get WhatsApp dashboard statistics
 *     description: Get overview stats for customer's WhatsApp services
 *     tags: [Customer - WhatsApp]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved
 */

// ============================================================================
// ADMIN - USER MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: List all users (Admin)
 *     description: Get all users in the system with pagination and filtering
 *     tags: [Admin - Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users retrieved
 *       403:
 *         description: Admin access required
 */

/**
 * @swagger
 * /api/admin/users/stats:
 *   get:
 *     summary: Get user statistics (Admin)
 *     description: Get overview statistics of all users
 *     tags: [Admin - Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved
 */

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   get:
 *     summary: Get user details (Admin)
 *     description: Retrieve detailed user information
 *     tags: [Admin - Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details retrieved
 *   put:
 *     summary: Update user (Admin)
 *     description: Update user information
 *     tags: [Admin - Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User updated
 *   delete:
 *     summary: Delete user (Admin)
 *     description: Delete a user from the system
 *     tags: [Admin - Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 */

/**
 * @swagger
 * /api/admin/users/{userId}/toggle-active:
 *   post:
 *     summary: Toggle user active status (Admin)
 *     description: Activate or deactivate a user account
 *     tags: [Admin - Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User status toggled
 */

// ============================================================================
// ADMIN - TRANSACTION MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/admin/transactions:
 *   get:
 *     summary: List all transactions (Admin)
 *     description: Get all transactions in the system
 *     tags: [Admin - Transaction]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transactions retrieved
 */

/**
 * @swagger
 * /api/admin/transactions/create:
 *   post:
 *     summary: Create transaction manually (Admin)
 *     description: Manually create a transaction for a user
 *     tags: [Admin - Transaction]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Transaction created
 */

/**
 * @swagger
 * /api/admin/transactions/{transactionId}:
 *   get:
 *     summary: Get transaction details (Admin)
 *     description: Retrieve detailed transaction information
 *     tags: [Admin - Transaction]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction details retrieved
 */

/**
 * @swagger
 * /api/admin/transactions/{transactionId}/cancel:
 *   post:
 *     summary: Cancel transaction (Admin)
 *     description: Cancel a pending transaction
 *     tags: [Admin - Transaction]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction cancelled
 */

// ============================================================================
// ADMIN - WHATSAPP SERVICE MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/admin/whatsapp/sessions:
 *   get:
 *     summary: List all WhatsApp sessions (Admin)
 *     description: Get all WhatsApp sessions/instances in the system
 *     tags: [Admin - WhatsApp Service]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Sessions retrieved
 */

/**
 * @swagger
 * /api/admin/whatsapp/sessions/{id}:
 *   get:
 *     summary: Get session details (Admin)
 *     description: Retrieve WhatsApp session information
 *     tags: [Admin - WhatsApp Service]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session details retrieved
 *   delete:
 *     summary: Delete session (Admin)
 *     description: Delete a WhatsApp session
 *     tags: [Admin - WhatsApp Service]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session deleted
 */

/**
 * @swagger
 * /api/admin/whatsapp/dashboard:
 *   get:
 *     summary: Get WhatsApp dashboard (Admin)
 *     description: Get WhatsApp service overview and statistics
 *     tags: [Admin - WhatsApp Service]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved
 */

/**
 * @swagger
 * /api/admin/whatsapp/subscriptions:
 *   get:
 *     summary: List all subscriptions (Admin)
 *     description: Get all WhatsApp service subscriptions
 *     tags: [Admin - WhatsApp Service]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Subscriptions retrieved
 */

/**
 * @swagger
 * /api/admin/whatsapp/transactions:
 *   get:
 *     summary: List WhatsApp transactions (Admin)
 *     description: Get all WhatsApp service transactions
 *     tags: [Admin - WhatsApp Service]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Transactions retrieved
 */

// ============================================================================
// ADMIN - VOUCHER CRUD ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/admin/voucher:
 *   get:
 *     summary: List all vouchers (Admin)
 *     description: Get all vouchers in the system
 *     tags: [Admin - Voucher]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Vouchers retrieved
 *   post:
 *     summary: Create voucher (Admin)
 *     description: Create a new voucher
 *     tags: [Admin - Voucher]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - type
 *               - value
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [percentage, fixed_amount]
 *               value:
 *                 type: number
 *               maxUses:
 *                 type: integer
 *               minAmount:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Voucher created
 */

/**
 * @swagger
 * /api/admin/voucher/stats:
 *   get:
 *     summary: Get voucher statistics (Admin)
 *     description: Get overview statistics of vouchers
 *     tags: [Admin - Voucher]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Voucher statistics retrieved
 */

/**
 * @swagger
 * /api/admin/voucher/{id}:
 *   get:
 *     summary: Get voucher details (Admin)
 *     description: Retrieve voucher information
 *     tags: [Admin - Voucher]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Voucher details retrieved
 *   put:
 *     summary: Update voucher (Admin)
 *     description: Update voucher information
 *     tags: [Admin - Voucher]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Voucher updated
 *   delete:
 *     summary: Delete voucher (Admin)
 *     description: Delete a voucher
 *     tags: [Admin - Voucher]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Voucher deleted
 */

/**
 * @swagger
 * /api/admin/voucher/{id}/usage:
 *   get:
 *     summary: Get voucher usage history (Admin)
 *     description: Get list of voucher usage
 *     tags: [Admin - Voucher]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Voucher usage retrieved
 */

// ============================================================================
// PUBLIC ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/public/whatsapp-packages:
 *   get:
 *     summary: Get available WhatsApp packages
 *     description: Retrieve list of available WhatsApp service packages (public)
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Packages retrieved
 */

/**
 * @swagger
 * /api/public/check-voucher:
 *   post:
 *     summary: Validate voucher code
 *     description: Check if voucher code is valid (public)
 *     tags: [Public]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Voucher is valid
 *       400:
 *         description: Invalid voucher
 */

/**
 * @swagger
 * /api/public/contact:
 *   post:
 *     summary: Send contact message
 *     description: Submit a contact form message (public)
 *     tags: [Public]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent
 */

/**
 * @swagger
 * /api/public/appointment:
 *   post:
 *     summary: Create appointment
 *     description: Submit an appointment request (public)
 *     tags: [Public]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Appointment created
 */

/**
 * @swagger
 * /api/public/payment/{paymentId}/status:
 *   get:
 *     summary: Check payment status (Public)
 *     description: Get payment status by payment ID without authentication
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment status retrieved
 */

/**
 * @swagger
 * /api/public/payment/{paymentId}/receipt:
 *   get:
 *     summary: Get payment receipt (Public)
 *     description: Download payment receipt/invoice without authentication
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Receipt retrieved
 */

// ============================================================================
// HEALTH CHECK ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     description: Check if API is running and healthy
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
