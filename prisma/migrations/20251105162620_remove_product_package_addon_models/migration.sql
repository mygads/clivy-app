-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "password" TEXT,
    "otp" TEXT,
    "otpExpires" TIMESTAMP(3),
    "otpVerificationDeadline" TIMESTAMP(3),
    "emailVerified" TIMESTAMP(3),
    "phoneVerified" TIMESTAMP(3),
    "image" TEXT,
    "emailVerificationToken" TEXT,
    "emailVerificationTokenExpires" TIMESTAMP(3),
    "role" TEXT NOT NULL DEFAULT 'customer',
    "apiKey" TEXT,
    "updatedAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "emailOtp" TEXT,
    "emailOtpExpires" TIMESTAMP(3),
    "resetPasswordOtp" TEXT,
    "resetPasswordOtpExpires" TIMESTAMP(3),
    "resetPasswordLastRequestAt" TIMESTAMP(3),
    "ssoOtp" TEXT,
    "ssoOtpExpires" TIMESTAMP(3),
    "ssoLastRequestAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppSession" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'disconnected',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "message" TEXT,
    "sessionName" TEXT NOT NULL,
    "connected" BOOLEAN NOT NULL DEFAULT false,
    "events" TEXT,
    "expiration" INTEGER NOT NULL DEFAULT 0,
    "isSystemSession" BOOLEAN NOT NULL DEFAULT false,
    "jid" TEXT,
    "loggedIn" BOOLEAN NOT NULL DEFAULT false,
    "proxyEnabled" BOOLEAN NOT NULL DEFAULT false,
    "proxyUrl" TEXT,
    "qrcode" TEXT,
    "s3AccessKey" TEXT,
    "s3Bucket" TEXT,
    "s3Enabled" BOOLEAN NOT NULL DEFAULT false,
    "s3Endpoint" TEXT,
    "s3MediaDelivery" TEXT DEFAULT 'base64',
    "s3PathStyle" BOOLEAN NOT NULL DEFAULT false,
    "s3PublicUrl" TEXT,
    "s3Region" TEXT,
    "s3RetentionDays" INTEGER NOT NULL DEFAULT 30,
    "s3SecretKey" TEXT,
    "token" TEXT NOT NULL,
    "webhook" TEXT,

    CONSTRAINT "WhatsAppSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'created',
    "amount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "discountAmount" DECIMAL(10,2),
    "originalAmount" DECIMAL(10,2),
    "voucherId" TEXT,
    "notes" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'idr',
    "finalAmount" DECIMAL(10,2),
    "serviceFeeAmount" DECIMAL(10,2),
    "totalAfterDiscount" DECIMAL(10,2),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionWhatsappService" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "whatsappPackageId" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),

    CONSTRAINT "TransactionWhatsappService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "externalId" TEXT,
    "paymentUrl" TEXT,
    "serviceFee" DECIMAL(10,2),
    "adminNotes" TEXT,
    "adminAction" TEXT,
    "adminUserId" TEXT,
    "actionDate" TIMESTAMP(3),
    "gatewayProvider" TEXT,
    "gatewayResponse" JSONB,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsappApiPackage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceMonth_idr" INTEGER NOT NULL,
    "priceMonth_usd" INTEGER NOT NULL,
    "priceYear_idr" INTEGER NOT NULL,
    "priceYear_usd" INTEGER NOT NULL,
    "maxSession" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsappApiPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicesWhatsappCustomers" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "activatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSubscriptionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServicesWhatsappCustomers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "userId" TEXT NOT NULL,
    "token" VARCHAR(512) NOT NULL,
    "deviceInfo" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "id" TEXT NOT NULL,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Voucher" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "minAmount" DECIMAL(10,2),
    "maxDiscount" DECIMAL(10,2),
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "allowMultipleUsePerUser" BOOLEAN NOT NULL DEFAULT false,
    "currency" TEXT NOT NULL DEFAULT 'idr',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoucherUsage" (
    "id" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transactionId" TEXT,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discountAmount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "VoucherUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "currency" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "gatewayProvider" TEXT,
    "gatewayCode" TEXT,
    "gatewayImageUrl" TEXT,
    "isGatewayMethod" BOOLEAN NOT NULL DEFAULT false,
    "bankDetailId" TEXT,
    "feeType" TEXT,
    "feeValue" DECIMAL(10,4),
    "minFee" DECIMAL(10,2),
    "maxFee" DECIMAL(10,2),
    "requiresManualApproval" BOOLEAN NOT NULL DEFAULT false,
    "paymentInstructions" TEXT,
    "instructionType" TEXT DEFAULT 'text',
    "instructionImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankDetail" (
    "id" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "swiftCode" TEXT,
    "currency" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Server" (
    "id" TEXT NOT NULL,
    "dropletId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "memory" INTEGER NOT NULL,
    "vcpus" INTEGER NOT NULL,
    "disk" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "regionSlug" TEXT NOT NULL,
    "sizeSlug" TEXT NOT NULL,
    "publicIp" TEXT,
    "privateIp" TEXT,
    "priceMonthly" DECIMAL(10,2) NOT NULL,
    "priceHourly" DECIMAL(15,14) NOT NULL,
    "tags" JSONB,
    "features" JSONB,
    "imageDistribution" TEXT,
    "imageName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppCampaigns" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT DEFAULT 'active',
    "message_body" TEXT,
    "image_url" TEXT,
    "image_base64" TEXT,
    "caption" TEXT,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "WhatsAppCampaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppBulkCampaigns" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "campaign_id" BIGINT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message_body" TEXT,
    "image_url" TEXT,
    "image_base64" TEXT,
    "caption" TEXT,
    "status" TEXT DEFAULT 'pending',
    "total_count" BIGINT DEFAULT 0,
    "sent_count" BIGINT DEFAULT 0,
    "failed_count" BIGINT DEFAULT 0,
    "scheduled_at" TIMESTAMPTZ(6),
    "timezone" TEXT,
    "processed_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "WhatsAppBulkCampaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppBulkCampaignItems" (
    "id" BIGSERIAL NOT NULL,
    "bulk_campaign_id" BIGINT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" TEXT DEFAULT 'pending',
    "message_id" TEXT,
    "error_message" TEXT,
    "sent_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "WhatsAppBulkCampaignItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppContact" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT,
    "full_name" TEXT,
    "push_name" TEXT,
    "short" TEXT,
    "notify" TEXT,
    "business" BOOLEAN DEFAULT false,
    "verified" BOOLEAN DEFAULT false,
    "source" TEXT DEFAULT 'sync',
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "WhatsAppContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppMessageStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "totalMessagesSent" INTEGER NOT NULL DEFAULT 0,
    "totalMessagesFailed" INTEGER NOT NULL DEFAULT 0,
    "textMessagesSent" INTEGER NOT NULL DEFAULT 0,
    "textMessagesFailed" INTEGER NOT NULL DEFAULT 0,
    "imageMessagesSent" INTEGER NOT NULL DEFAULT 0,
    "imageMessagesFailed" INTEGER NOT NULL DEFAULT 0,
    "documentMessagesSent" INTEGER NOT NULL DEFAULT 0,
    "documentMessagesFailed" INTEGER NOT NULL DEFAULT 0,
    "audioMessagesSent" INTEGER NOT NULL DEFAULT 0,
    "audioMessagesFailed" INTEGER NOT NULL DEFAULT 0,
    "stickerMessagesSent" INTEGER NOT NULL DEFAULT 0,
    "stickerMessagesFailed" INTEGER NOT NULL DEFAULT 0,
    "videoMessagesSent" INTEGER NOT NULL DEFAULT 0,
    "videoMessagesFailed" INTEGER NOT NULL DEFAULT 0,
    "locationMessagesSent" INTEGER NOT NULL DEFAULT 0,
    "locationMessagesFailed" INTEGER NOT NULL DEFAULT 0,
    "contactMessagesSent" INTEGER NOT NULL DEFAULT 0,
    "contactMessagesFailed" INTEGER NOT NULL DEFAULT 0,
    "templateMessagesSent" INTEGER NOT NULL DEFAULT 0,
    "templateMessagesFailed" INTEGER NOT NULL DEFAULT 0,
    "lastMessageSentAt" TIMESTAMP(3),
    "lastMessageFailedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppMessageStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Portfolio" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "gallery" TEXT[],
    "tech" TEXT[],
    "category" TEXT,
    "description" TEXT,
    "link" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientLogo" (
    "id" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientLogo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailVerificationToken_key" ON "User"("emailVerificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_apiKey_key" ON "User"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppSession_sessionId_key" ON "WhatsAppSession"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppSession_token_key" ON "WhatsAppSession"("token");

-- CreateIndex
CREATE INDEX "WhatsAppSession_userId_idx" ON "WhatsAppSession"("userId");

-- CreateIndex
CREATE INDEX "WhatsAppSession_token_idx" ON "WhatsAppSession"("token");

-- CreateIndex
CREATE INDEX "WhatsAppSession_connected_idx" ON "WhatsAppSession"("connected");

-- CreateIndex
CREATE INDEX "WhatsAppSession_isSystemSession_idx" ON "WhatsAppSession"("isSystemSession");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_voucherId_fkey" ON "Transaction"("voucherId");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Transaction_expiresAt_idx" ON "Transaction"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "TransactionWhatsappService_transactionId_key" ON "TransactionWhatsappService"("transactionId");

-- CreateIndex
CREATE INDEX "TransactionWhatsappService_whatsappPackageId_idx" ON "TransactionWhatsappService"("whatsappPackageId");

-- CreateIndex
CREATE INDEX "TransactionWhatsappService_status_idx" ON "TransactionWhatsappService"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "Payment"("transactionId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_expiresAt_idx" ON "Payment"("expiresAt");

-- CreateIndex
CREATE INDEX "Payment_externalId_idx" ON "Payment"("externalId");

-- CreateIndex
CREATE INDEX "Payment_gatewayProvider_idx" ON "Payment"("gatewayProvider");

-- CreateIndex
CREATE INDEX "Payment_method_idx" ON "Payment"("method");

-- CreateIndex
CREATE INDEX "ServicesWhatsappCustomers_customerId_idx" ON "ServicesWhatsappCustomers"("customerId");

-- CreateIndex
CREATE INDEX "ServicesWhatsappCustomers_packageId_idx" ON "ServicesWhatsappCustomers"("packageId");

-- CreateIndex
CREATE INDEX "ServicesWhatsappCustomers_status_idx" ON "ServicesWhatsappCustomers"("status");

-- CreateIndex
CREATE INDEX "ServicesWhatsappCustomers_expiredAt_idx" ON "ServicesWhatsappCustomers"("expiredAt");

-- CreateIndex
CREATE UNIQUE INDEX "ServicesWhatsappCustomers_customerId_packageId_key" ON "ServicesWhatsappCustomers"("customerId", "packageId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_token_key" ON "UserSession"("token");

-- CreateIndex
CREATE INDEX "UserSession_userId_idx" ON "UserSession"("userId");

-- CreateIndex
CREATE INDEX "UserSession_token_idx" ON "UserSession"("token");

-- CreateIndex
CREATE INDEX "UserSession_expiresAt_idx" ON "UserSession"("expiresAt");

-- CreateIndex
CREATE INDEX "UserSession_isActive_idx" ON "UserSession"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_code_key" ON "Voucher"("code");

-- CreateIndex
CREATE INDEX "Voucher_code_idx" ON "Voucher"("code");

-- CreateIndex
CREATE INDEX "Voucher_isActive_idx" ON "Voucher"("isActive");

-- CreateIndex
CREATE INDEX "Voucher_currency_idx" ON "Voucher"("currency");

-- CreateIndex
CREATE INDEX "Voucher_type_idx" ON "Voucher"("type");

-- CreateIndex
CREATE INDEX "Voucher_discountType_idx" ON "Voucher"("discountType");

-- CreateIndex
CREATE INDEX "Voucher_startDate_idx" ON "Voucher"("startDate");

-- CreateIndex
CREATE INDEX "Voucher_endDate_idx" ON "Voucher"("endDate");

-- CreateIndex
CREATE INDEX "VoucherUsage_voucherId_idx" ON "VoucherUsage"("voucherId");

-- CreateIndex
CREATE INDEX "VoucherUsage_userId_idx" ON "VoucherUsage"("userId");

-- CreateIndex
CREATE INDEX "VoucherUsage_transactionId_idx" ON "VoucherUsage"("transactionId");

-- CreateIndex
CREATE INDEX "VoucherUsage_usedAt_idx" ON "VoucherUsage"("usedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_code_key" ON "PaymentMethod"("code");

-- CreateIndex
CREATE INDEX "PaymentMethod_code_idx" ON "PaymentMethod"("code");

-- CreateIndex
CREATE INDEX "PaymentMethod_type_idx" ON "PaymentMethod"("type");

-- CreateIndex
CREATE INDEX "PaymentMethod_currency_idx" ON "PaymentMethod"("currency");

-- CreateIndex
CREATE INDEX "PaymentMethod_isActive_idx" ON "PaymentMethod"("isActive");

-- CreateIndex
CREATE INDEX "PaymentMethod_bankDetailId_idx" ON "PaymentMethod"("bankDetailId");

-- CreateIndex
CREATE INDEX "PaymentMethod_gatewayProvider_idx" ON "PaymentMethod"("gatewayProvider");

-- CreateIndex
CREATE INDEX "PaymentMethod_feeType_idx" ON "PaymentMethod"("feeType");

-- CreateIndex
CREATE INDEX "PaymentMethod_isGatewayMethod_idx" ON "PaymentMethod"("isGatewayMethod");

-- CreateIndex
CREATE INDEX "BankDetail_currency_idx" ON "BankDetail"("currency");

-- CreateIndex
CREATE INDEX "BankDetail_isActive_idx" ON "BankDetail"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Server_dropletId_key" ON "Server"("dropletId");

-- CreateIndex
CREATE INDEX "Server_dropletId_idx" ON "Server"("dropletId");

-- CreateIndex
CREATE INDEX "Server_status_idx" ON "Server"("status");

-- CreateIndex
CREATE INDEX "Server_region_idx" ON "Server"("region");

-- CreateIndex
CREATE INDEX "idx_WhatsAppCampaigns_deleted_at" ON "WhatsAppCampaigns"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_WhatsAppCampaigns_user_id" ON "WhatsAppCampaigns"("user_id");

-- CreateIndex
CREATE INDEX "idx_WhatsAppBulkCampaigns_campaign_id" ON "WhatsAppBulkCampaigns"("campaign_id");

-- CreateIndex
CREATE INDEX "idx_WhatsAppBulkCampaigns_deleted_at" ON "WhatsAppBulkCampaigns"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_WhatsAppBulkCampaigns_user_id" ON "WhatsAppBulkCampaigns"("user_id");

-- CreateIndex
CREATE INDEX "idx_WhatsAppBulkCampaignItems_bulk_campaign_id" ON "WhatsAppBulkCampaignItems"("bulk_campaign_id");

-- CreateIndex
CREATE INDEX "idx_WhatsAppBulkCampaignItems_deleted_at" ON "WhatsAppBulkCampaignItems"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_WhatsAppContact_deleted_at" ON "WhatsAppContact"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_WhatsAppContact_phone" ON "WhatsAppContact"("phone");

-- CreateIndex
CREATE INDEX "idx_WhatsAppContact_user_id" ON "WhatsAppContact"("user_id");

-- CreateIndex
CREATE INDEX "WhatsAppMessageStats_userId_idx" ON "WhatsAppMessageStats"("userId");

-- CreateIndex
CREATE INDEX "WhatsAppMessageStats_sessionId_idx" ON "WhatsAppMessageStats"("sessionId");

-- CreateIndex
CREATE INDEX "WhatsAppMessageStats_lastMessageSentAt_idx" ON "WhatsAppMessageStats"("lastMessageSentAt");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppMessageStats_userId_sessionId_key" ON "WhatsAppMessageStats"("userId", "sessionId");

-- CreateIndex
CREATE INDEX "Portfolio_isActive_idx" ON "Portfolio"("isActive");

-- CreateIndex
CREATE INDEX "Portfolio_category_idx" ON "Portfolio"("category");

-- CreateIndex
CREATE INDEX "ClientLogo_isActive_idx" ON "ClientLogo"("isActive");

-- CreateIndex
CREATE INDEX "ClientLogo_sortOrder_idx" ON "ClientLogo"("sortOrder");

-- AddForeignKey
ALTER TABLE "WhatsAppSession" ADD CONSTRAINT "WhatsAppSession_user_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_user_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_voucher_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionWhatsappService" ADD CONSTRAINT "TransactionWhatsappService_transaction_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionWhatsappService" ADD CONSTRAINT "TransactionWhatsappService_whatsappPackage_fkey" FOREIGN KEY ("whatsappPackageId") REFERENCES "WhatsappApiPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicesWhatsappCustomers" ADD CONSTRAINT "ServicesWhatsappCustomers_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicesWhatsappCustomers" ADD CONSTRAINT "ServicesWhatsappCustomers_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "WhatsappApiPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherUsage" ADD CONSTRAINT "VoucherUsage_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherUsage" ADD CONSTRAINT "VoucherUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoucherUsage" ADD CONSTRAINT "VoucherUsage_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "Voucher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_bankDetailId_fkey" FOREIGN KEY ("bankDetailId") REFERENCES "BankDetail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppCampaigns" ADD CONSTRAINT "fk_WhatsAppCampaigns_user" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "WhatsAppBulkCampaigns" ADD CONSTRAINT "fk_WhatsAppBulkCampaigns_user" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "WhatsAppBulkCampaigns" ADD CONSTRAINT "fk_WhatsAppCampaigns_bulk_campaigns" FOREIGN KEY ("campaign_id") REFERENCES "WhatsAppCampaigns"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "WhatsAppBulkCampaignItems" ADD CONSTRAINT "fk_WhatsAppBulkCampaigns_items" FOREIGN KEY ("bulk_campaign_id") REFERENCES "WhatsAppBulkCampaigns"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "WhatsAppContact" ADD CONSTRAINT "WhatsAppContact_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "WhatsAppMessageStats" ADD CONSTRAINT "WhatsAppMessageStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppMessageStats" ADD CONSTRAINT "WhatsAppMessageStats_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WhatsAppSession"("sessionId") ON DELETE CASCADE ON UPDATE CASCADE;
