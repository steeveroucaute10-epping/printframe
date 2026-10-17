-- PrintFrame Database Initialization
-- Run on first container start only

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create indexes for common query patterns
-- These will be created again by Prisma migrations, but good for cold starts

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_product_category ON "Product"("category");
CREATE INDEX IF NOT EXISTS idx_product_status ON "Product"("status");
CREATE INDEX IF NOT EXISTS idx_product_created ON "Product"("createdAt" DESC);

-- Order indexes
CREATE INDEX IF NOT EXISTS idx_order_userId ON "Order"("userId");
CREATE INDEX IF NOT EXISTS idx_order_status ON "Order"("status");
CREATE INDEX IF NOT EXISTS idx_order_created ON "Order"("createdAt" DESC);

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payment_orderId ON "Payment"("orderId");
CREATE INDEX IF NOT EXISTS idx_payment_status ON "Payment"("status");

-- User indexes
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"("email");
CREATE INDEX IF NOT EXISTS idx_user_role ON "User"("role");

-- Ticket indexes
CREATE INDEX IF NOT EXISTS idx_ticket_status ON "Ticket"("status");
CREATE INDEX IF NOT EXISTS idx_ticket_userId ON "Ticket"("userId");
