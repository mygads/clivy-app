/**
 * Swagger API Documentation Endpoints
 * 
 * This file contains JSDoc comments for all API endpoints.
 * These will be automatically parsed by swagger-jsdoc.
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
 * /api/auth/signup:
 *   post:
 *     summary: User registration
 *     description: Register a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: User already exists
 */

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP for verification
 *     description: Send OTP code via email or WhatsApp
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
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
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               otp:
 *                 type: string
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
 *     description: Send OTP for password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset OTP sent
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
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
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
 *               phone:
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
 *     description: Logout user and invalidate session
 *     tags: [Account]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */

/**
 * @swagger
 * /api/account/change-password:
 *   post:
 *     summary: Change password
 *     description: Change user's password
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
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid current password
 */

/**
 * @swagger
 * /api/account/session:
 *   get:
 *     summary: Get user sessions
 *     description: List all active sessions for the user
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
 *                 properties:
 *                   packageId:
 *                     type: string
 *                   duration:
 *                     type: string
 *                     enum: [month, year]
 *               voucherCode:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Checkout created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactionId:
 *                       type: string
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                     subtotal:
 *                       type: number
 *                     totalAfterDiscount:
 *                       type: number
 *                     availablePaymentMethods:
 *                       type: array
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
 *     description: Create a payment for a transaction
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
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment created successfully
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
 * /api/customer/payment/list:
 *   get:
 *     summary: List user payments
 *     description: Get all payments for authenticated user
 *     tags: [Customer - Payment]
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
 *         description: Payment list retrieved
 */

// ============================================================================
// CUSTOMER - TRANSACTION ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/customer/transactions:
 *   get:
 *     summary: List user transactions
 *     description: Get all transactions for authenticated user
 *     tags: [Customer - Transaction]
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
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction list retrieved
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
 * /api/customer/dashboard:
 *   get:
 *     summary: Get customer dashboard data
 *     description: Retrieve dashboard statistics and overview for customer
 *     tags: [Customer - Transaction]
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
 * /api/customer/whatsapp/list:
 *   get:
 *     summary: List WhatsApp services
 *     description: Get all WhatsApp services for authenticated user
 *     tags: [Customer - WhatsApp]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: WhatsApp services retrieved
 */

/**
 * @swagger
 * /api/customer/whatsapp/{serviceId}:
 *   get:
 *     summary: Get WhatsApp service details
 *     description: Retrieve WhatsApp service information
 *     tags: [Customer - WhatsApp]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service details retrieved
 */

/**
 * @swagger
 * /api/customer/whatsapp/{serviceId}/qr:
 *   get:
 *     summary: Get WhatsApp QR code
 *     description: Retrieve QR code for WhatsApp authentication
 *     tags: [Customer - WhatsApp]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: QR code retrieved
 */

// ============================================================================
// ADMIN - USER MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: List all users (Admin)
 *     description: Get all users in the system
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

/**
 * @swagger
 * /api/admin/users/stats:
 *   get:
 *     summary: Get user statistics (Admin)
 *     description: Get overview statistics of users
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
 *               role:
 *                 type: string
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
// ADMIN - PAYMENT MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/admin/payments:
 *   get:
 *     summary: List all payments (Admin)
 *     description: Get all payments in the system
 *     tags: [Admin - Payment]
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
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payments retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

/**
 * @swagger
 * /api/admin/payments/{paymentId}:
 *   get:
 *     summary: Get payment details (Admin)
 *     description: Retrieve detailed payment information
 *     tags: [Admin - Payment]
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
 *   patch:
 *     summary: Update payment status (Admin)
 *     description: Manually update payment status
 *     tags: [Admin - Payment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, success, failed, expired]
 *     responses:
 *       200:
 *         description: Payment status updated
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
 *             properties:
 *               userId:
 *                 type: string
 *               type:
 *                 type: string
 *               amount:
 *                 type: number
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
// ADMIN - WHATSAPP SERVICE CRUD ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/admin/whatsapp/packages:
 *   get:
 *     summary: List all WhatsApp packages (Admin)
 *     description: Get all WhatsApp service packages
 *     tags: [Admin - WhatsApp Service]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Packages retrieved
 *   post:
 *     summary: Create WhatsApp package (Admin)
 *     description: Create a new WhatsApp service package
 *     tags: [Admin - WhatsApp Service]
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
 *               description:
 *                 type: string
 *               priceMonth:
 *                 type: number
 *               priceYear:
 *                 type: number
 *               maxSession:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Package created
 */

/**
 * @swagger
 * /api/admin/whatsapp/sessions:
 *   get:
 *     summary: List all WhatsApp sessions (Admin)
 *     description: Get all WhatsApp sessions/instances
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
 *               discountType:
 *                 type: string
 *               value:
 *                 type: number
 *               maxUses:
 *                 type: integer
 *               minAmount:
 *                 type: number
 *               maxDiscount:
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
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
// ADMIN - DASHBOARD ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics (Admin)
 *     description: Retrieve overview statistics for admin dashboard
 *     tags: [Admin - Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                 totalRevenue:
 *                   type: number
 *                 activeServices:
 *                   type: integer
 *                 pendingPayments:
 *                   type: integer
 */

// ============================================================================
// PUBLIC ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/public/whatsapp-packages:
 *   get:
 *     summary: Get available WhatsApp packages
 *     description: Retrieve list of available WhatsApp service packages
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
 *     description: Check if voucher code is valid
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
 *     description: Submit a contact form message
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
 *     description: Submit an appointment request
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
 *               date:
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
 *     summary: Check payment status
 *     description: Get payment status by payment ID (public)
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
 *     summary: Get payment receipt
 *     description: Download payment receipt/invoice
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
 *     description: Check if API is running
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


/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: User registration
 *     description: Register a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input data
 *       409:
 *         description: User already exists
 */

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP for verification
 *     description: Send OTP code via email or WhatsApp
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
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
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               otp:
 *                 type: string
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
 *     description: Send OTP for password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset OTP sent
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
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
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
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
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
 *                 properties:
 *                   packageId:
 *                     type: string
 *                   duration:
 *                     type: string
 *                     enum: [month, year]
 *               voucherCode:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Checkout created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactionId:
 *                       type: string
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                     subtotal:
 *                       type: number
 *                     totalAfterDiscount:
 *                       type: number
 *                     availablePaymentMethods:
 *                       type: array
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
 *     description: Create a payment for a transaction
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
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment created successfully
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
 * /api/customer/payment/list:
 *   get:
 *     summary: List user payments
 *     description: Get all payments for authenticated user
 *     tags: [Customer - Payment]
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
 *         description: Payment list retrieved
 */

// ============================================================================
// CUSTOMER - TRANSACTION ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/customer/transactions:
 *   get:
 *     summary: List user transactions
 *     description: Get all transactions for authenticated user
 *     tags: [Customer - Transaction]
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
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction list retrieved
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

// ============================================================================
// CUSTOMER - WHATSAPP MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/customer/whatsapp/list:
 *   get:
 *     summary: List WhatsApp services
 *     description: Get all WhatsApp services for authenticated user
 *     tags: [Customer - WhatsApp]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: WhatsApp services retrieved
 */

/**
 * @swagger
 * /api/customer/whatsapp/{serviceId}:
 *   get:
 *     summary: Get WhatsApp service details
 *     description: Retrieve WhatsApp service information
 *     tags: [Customer - WhatsApp]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service details retrieved
 */

/**
 * @swagger
 * /api/customer/whatsapp/{serviceId}/qr:
 *   get:
 *     summary: Get WhatsApp QR code
 *     description: Retrieve QR code for WhatsApp authentication
 *     tags: [Customer - WhatsApp]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: QR code retrieved
 */

// ============================================================================
// ADMIN - PAYMENT MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/admin/payments:
 *   get:
 *     summary: List all payments (Admin)
 *     description: Get all payments in the system
 *     tags: [Admin - Payment]
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
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payments retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */

/**
 * @swagger
 * /api/admin/payments/{paymentId}:
 *   get:
 *     summary: Get payment details (Admin)
 *     description: Retrieve detailed payment information
 *     tags: [Admin - Payment]
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
 *   patch:
 *     summary: Update payment status (Admin)
 *     description: Manually update payment status
 *     tags: [Admin - Payment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, SUCCESS, FAILED, EXPIRED]
 *     responses:
 *       200:
 *         description: Payment status updated
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

// ============================================================================
// ADMIN - WHATSAPP SERVICE CRUD ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/admin/whatsapp/packages:
 *   get:
 *     summary: List all WhatsApp packages (Admin)
 *     description: Get all WhatsApp service packages
 *     tags: [Admin - WhatsApp Service]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Packages retrieved
 *   post:
 *     summary: Create WhatsApp package (Admin)
 *     description: Create a new WhatsApp service package
 *     tags: [Admin - WhatsApp Service]
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
 *               description:
 *                 type: string
 *               priceMonth:
 *                 type: number
 *               priceYear:
 *                 type: number
 *               maxSession:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Package created
 */

/**
 * @swagger
 * /api/admin/whatsapp/packages/{packageId}:
 *   get:
 *     summary: Get package details (Admin)
 *     description: Retrieve WhatsApp package information
 *     tags: [Admin - WhatsApp Service]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: packageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Package details retrieved
 *   put:
 *     summary: Update package (Admin)
 *     description: Update WhatsApp package information
 *     tags: [Admin - WhatsApp Service]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: packageId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Package updated
 *   delete:
 *     summary: Delete package (Admin)
 *     description: Delete a WhatsApp service package
 *     tags: [Admin - WhatsApp Service]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: packageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Package deleted
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
 *               discountType:
 *                 type: string
 *               value:
 *                 type: number
 *               maxUses:
 *                 type: integer
 *               minAmount:
 *                 type: number
 *               maxDiscount:
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
 * /api/admin/voucher/{voucherId}:
 *   get:
 *     summary: Get voucher details (Admin)
 *     description: Retrieve voucher information
 *     tags: [Admin - Voucher]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: voucherId
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
 *         name: voucherId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *         name: voucherId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Voucher deleted
 */

// ============================================================================
// ADMIN - DASHBOARD ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics (Admin)
 *     description: Retrieve overview statistics for admin dashboard
 *     tags: [Admin - Dashboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                 totalRevenue:
 *                   type: number
 *                 activeServices:
 *                   type: integer
 *                 pendingPayments:
 *                   type: integer
 */

// ============================================================================
// PUBLIC ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/public/whatsapp-packages:
 *   get:
 *     summary: Get available WhatsApp packages
 *     description: Retrieve list of available WhatsApp service packages
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
 *     description: Check if voucher code is valid
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
 *     description: Submit a contact form message
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

// ============================================================================
// HEALTH CHECK ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     description: Check if API is running
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
