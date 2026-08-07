// PostgreSQL / Supabase / Prisma Database Schema Definitions & Initial Seed Data

export interface DbUser {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  password_hash: string;
  profile_image: string;
  role: 'user' | 'admin';
  subscription_plan: 'Free' | 'Pro Monthly' | 'Pro Yearly' | 'Lifetime' | 'Enterprise';
  subscription_status: 'active' | 'cancelled' | 'past_due' | 'expired';
  subscription_start_date: string;
  subscription_end_date: string;
  created_at: string;
  updated_at: string;
}

export interface DbSubscription {
  id: string;
  user_id: string;
  plan_name: string;
  price: number;
  duration: string; // e.g., '1 month', '1 year', 'lifetime'
  status: 'active' | 'cancelled' | 'pending';
  payment_method: string;
  payment_reference: string;
  approved_by: string;
  created_at: string;
}

export interface DbPayment {
  id: string;
  user_id: string;
  amount: number;
  payment_method: 'evc_plus' | 'zaad' | 'sahal' | 'card_stripe' | 'paypal';
  transaction_id: string;
  receipt_image?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
  created_at: string;
}

export interface DbFile {
  id: string;
  user_id: string;
  original_filename: string;
  file_type: 'pdf' | 'image' | 'document' | 'video' | 'audio' | 'zip';
  file_size: number; // in bytes
  storage_url: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  output_file_url?: string;
  created_at: string;
  expires_at?: string;
}

export interface DbAiUsage {
  id: string;
  user_id: string;
  tool_name: string;
  requests_used: number;
  credits_used: number;
  created_at: string;
}

export interface DbActivityLog {
  id: string;
  user_id: string;
  action: string;
  ip_address: string;
  timestamp: string;
}

// --- INITIAL SEED DATA FOR DEMO & ADMIN CONSOLE ---

export const SEED_DB_USERS: DbUser[] = [
  {
    id: 'usr_normal_1',
    full_name: 'Abdirahman Hassan',
    email: 'abdirahman@gmail.com',
    phone_number: '+252 61 588 9201',
    password_hash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae', // SHA256 of 'password123'
    profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    role: 'user',
    subscription_plan: 'Free',
    subscription_status: 'active',
    subscription_start_date: '2026-03-15T10:00:00Z',
    subscription_end_date: '2027-03-15T10:00:00Z',
    created_at: '2026-03-15T10:00:00Z',
    updated_at: '2026-08-01T14:20:00Z',
  },
  {
    id: 'usr-admin-1',
    full_name: 'Ridwaan Mohamed (Admin)',
    email: 'admin@aisuccesshub.com',
    phone_number: '+252 61 777 9900',
    password_hash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // SHA256 of 'admin123'
    profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    role: 'admin',
    subscription_plan: 'Lifetime',
    subscription_status: 'active',
    subscription_start_date: '2026-01-10T08:00:00Z',
    subscription_end_date: '2099-12-31T23:59:59Z',
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-08-04T05:00:00Z',
  },
  {
    id: 'usr_pro_2',
    full_name: 'Ahmed Hassan',
    email: 'ahmed.h@sommail.so',
    phone_number: '+252 61 234 5678',
    password_hash: '3f6c8d1e2f1a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c',
    profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    role: 'user',
    subscription_plan: 'Pro Monthly',
    subscription_status: 'active',
    subscription_start_date: '2026-07-01T12:00:00Z',
    subscription_end_date: '2026-08-01T12:00:00Z',
    created_at: '2026-05-10T09:15:00Z',
    updated_at: '2026-07-01T12:00:00Z',
  },
  {
    id: 'usr_lifetime_3',
    full_name: 'Faduma Ali',
    email: 'faduma.ali@techmoga.so',
    phone_number: '+252 63 441 2233',
    password_hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    profile_image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    role: 'user',
    subscription_plan: 'Lifetime',
    subscription_status: 'active',
    subscription_start_date: '2026-06-20T11:00:00Z',
    subscription_end_date: '2099-12-31T23:59:59Z',
    created_at: '2026-06-20T11:00:00Z',
    updated_at: '2026-06-20T11:00:00Z',
  }
];

export const SEED_DB_SUBSCRIPTIONS: DbSubscription[] = [
  {
    id: 'sub_101',
    user_id: 'usr_pro_2',
    plan_name: 'Pro Monthly',
    price: 9.99,
    duration: '1 month',
    status: 'active',
    payment_method: 'evc_plus',
    payment_reference: 'TXN-EVC-994201',
    approved_by: 'admin@aisuccesshub.com',
    created_at: '2026-07-01T12:00:00Z',
  },
  {
    id: 'sub_102',
    user_id: 'usr_lifetime_3',
    plan_name: 'Lifetime VIP',
    price: 149.00,
    duration: 'lifetime',
    status: 'active',
    payment_method: 'zaad',
    payment_reference: 'TXN-ZAAD-883210',
    approved_by: 'admin@aisuccesshub.com',
    created_at: '2026-06-20T11:00:00Z',
  },
  {
    id: 'sub_103',
    user_id: 'usr-admin-1',
    plan_name: 'Lifetime Admin',
    price: 0.00,
    duration: 'lifetime',
    status: 'active',
    payment_method: 'system_grant',
    payment_reference: 'SYS-GRANT-001',
    approved_by: 'system',
    created_at: '2026-01-10T08:00:00Z',
  }
];

export const SEED_DB_PAYMENTS: DbPayment[] = [
  {
    id: 'pay_301',
    user_id: 'usr_pro_2',
    amount: 9.99,
    payment_method: 'evc_plus',
    transaction_id: 'TXN-EVC-994201',
    receipt_image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=300',
    status: 'approved',
    admin_note: 'Verified via EVC Plus SMS confirmation.',
    created_at: '2026-07-01T11:58:00Z',
  },
  {
    id: 'pay_302',
    user_id: 'usr_lifetime_3',
    amount: 149.00,
    payment_method: 'zaad',
    transaction_id: 'TXN-ZAAD-883210',
    receipt_image: 'https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&q=80&w=300',
    status: 'approved',
    admin_note: 'ZAAD reference code matches merchant ledger.',
    created_at: '2026-06-20T10:55:00Z',
  },
  {
    id: 'pay_303',
    user_id: 'usr_normal_1',
    amount: 89.99,
    payment_method: 'sahal',
    transaction_id: 'TXN-SAHAL-771029',
    receipt_image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=300',
    status: 'pending',
    admin_note: 'Awaiting admin verification.',
    created_at: '2026-08-04T04:12:00Z',
  }
];

export const SEED_DB_FILES: DbFile[] = [
  {
    id: 'file_501',
    user_id: 'usr_normal_1',
    original_filename: 'Q2_Financial_Report.pdf',
    file_type: 'pdf',
    file_size: 4820100, // ~4.8 MB
    storage_url: 'https://storage.r2.cloudflarestorage.com/ai-hub/usr_normal_1/Q2_Financial_Report.pdf',
    processing_status: 'completed',
    output_file_url: 'https://storage.r2.cloudflarestorage.com/ai-hub/usr_normal_1/Q2_Financial_Report_Compressed.pdf',
    created_at: '2026-08-03T14:30:00Z',
    expires_at: '2026-08-10T14:30:00Z',
  },
  {
    id: 'file_502',
    user_id: 'usr_pro_2',
    original_filename: 'Project_Contract_Draft.docx',
    file_type: 'document',
    file_size: 1240000,
    storage_url: 'https://storage.r2.cloudflarestorage.com/ai-hub/usr_pro_2/Project_Contract_Draft.docx',
    processing_status: 'completed',
    output_file_url: 'https://storage.r2.cloudflarestorage.com/ai-hub/usr_pro_2/Project_Contract_Draft.pdf',
    created_at: '2026-08-02T09:10:00Z',
  },
  {
    id: 'file_503',
    user_id: 'usr_lifetime_3',
    original_filename: 'Product_Launch_Presentation.zip',
    file_type: 'zip',
    file_size: 24500000,
    storage_url: 'https://storage.r2.cloudflarestorage.com/ai-hub/usr_lifetime_3/Product_Launch_Presentation.zip',
    processing_status: 'completed',
    output_file_url: 'https://storage.r2.cloudflarestorage.com/ai-hub/usr_lifetime_3/Product_Launch_Presentation_Optimized.zip',
    created_at: '2026-08-01T18:45:00Z',
  }
];

export const SEED_DB_AI_USAGE: DbAiUsage[] = [
  {
    id: 'ai_701',
    user_id: 'usr_normal_1',
    tool_name: 'AI Document Summarizer',
    requests_used: 12,
    credits_used: 24,
    created_at: '2026-08-04T02:15:00Z',
  },
  {
    id: 'ai_702',
    user_id: 'usr_pro_2',
    tool_name: 'AI Copilot & Code Assistant',
    requests_used: 48,
    credits_used: 96,
    created_at: '2026-08-03T20:10:00Z',
  },
  {
    id: 'ai_703',
    user_id: 'usr_lifetime_3',
    tool_name: 'Smart OCR Text Extractor',
    requests_used: 30,
    credits_used: 60,
    created_at: '2026-08-02T16:00:00Z',
  }
];

export const SEED_DB_ACTIVITY_LOGS: DbActivityLog[] = [
  {
    id: 'act_901',
    user_id: 'usr-admin-1',
    action: 'ADMIN_LOGIN_SUCCESS',
    ip_address: '197.220.84.12',
    timestamp: '2026-08-04T05:20:11Z',
  },
  {
    id: 'act_902',
    user_id: 'usr_normal_1',
    action: 'USER_LOGIN',
    ip_address: '102.218.42.89',
    timestamp: '2026-08-04T04:10:00Z',
  },
  {
    id: 'act_903',
    user_id: 'usr_normal_1',
    action: 'EVC_PAYMENT_SUBMITTED',
    ip_address: '102.218.42.89',
    timestamp: '2026-08-04T04:12:00Z',
  },
  {
    id: 'act_904',
    user_id: 'usr_pro_2',
    action: 'FILE_CONVERT_PDF',
    ip_address: '197.220.91.44',
    timestamp: '2026-08-03T19:40:00Z',
  }
];

// --- PRISMA SCHEMA GENERATOR STRING ---
export const PRISMA_SCHEMA_STRING = `// Prisma Schema for PostgreSQL / Supabase
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  user
  admin
}

enum PaymentStatus {
  pending
  approved
  rejected
}

enum FileType {
  pdf
  image
  document
  video
  audio
  zip
}

enum ProcessingStatus {
  pending
  processing
  completed
  failed
}

model User {
  id                      String         @id @default(uuid())
  full_name               String
  email                   String         @unique
  phone_number            String
  password_hash           String
  profile_image           String?
  role                    Role           @default(user)
  subscription_plan       String         @default("Free")
  subscription_status     String         @default("active")
  subscription_start_date DateTime?
  subscription_end_date   DateTime?
  created_at              DateTime       @default(now())
  updated_at              DateTime       @updatedAt

  subscriptions           Subscription[]
  payments                Payment[]
  files                   File[]
  ai_usage                AiUsage[]
  activity_logs           ActivityLog[]
}

model Subscription {
  id                String   @id @default(uuid())
  user_id           String
  plan_name         String
  price             Float
  duration          String
  status            String   @default("active")
  payment_method    String
  payment_reference String
  approved_by       String
  created_at        DateTime @default(now())

  user              User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
}

model Payment {
  id             String        @id @default(uuid())
  user_id        String
  amount         Float
  payment_method String
  transaction_id String        @unique
  receipt_image  String?
  status         PaymentStatus @default(pending)
  admin_note     String?
  created_at     DateTime      @default(now())

  user           User          @relation(fields: [user_id], references: [id], onDelete: Cascade)
}

model File {
  id                String           @id @default(uuid())
  user_id           String
  original_filename String
  file_type         FileType
  file_size         Int
  storage_url       String
  processing_status ProcessingStatus @default(pending)
  output_file_url   String?
  created_at        DateTime         @default(now())
  expires_at        DateTime?

  user              User             @relation(fields: [user_id], references: [id], onDelete: Cascade)
}

model AiUsage {
  id            String   @id @default(uuid())
  user_id       String
  tool_name     String
  requests_used Int      @default(0)
  credits_used  Int      @default(0)
  created_at    DateTime @default(now())

  user          User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
}

model ActivityLog {
  id         String   @id @default(uuid())
  user_id    String
  action     String
  ip_address String
  timestamp  DateTime @default(now())

  user       User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
}
`;

// --- POSTGRESQL / SUPABASE DDL SQL SCRIPT ---
export const POSTGRES_SCHEMA_SQL = `-- PostgreSQL / Supabase Migration DDL Script

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  profile_image TEXT,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  subscription_plan VARCHAR(50) DEFAULT 'Free',
  subscription_status VARCHAR(20) DEFAULT 'active',
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Subscriptions Table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  payment_method VARCHAR(50) NOT NULL,
  payment_reference VARCHAR(255) NOT NULL,
  approved_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Payments Table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  receipt_image TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Files Table
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_filename VARCHAR(255) NOT NULL,
  file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('pdf', 'image', 'document', 'video', 'audio', 'zip')),
  file_size INT NOT NULL,
  storage_url TEXT NOT NULL,
  processing_status VARCHAR(20) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  output_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ
);

-- 5. AI Usage Table
CREATE TABLE ai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_name VARCHAR(100) NOT NULL,
  requests_used INT DEFAULT 0,
  credits_used INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Activity Logs Table
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for maximum query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_files_user ON files(user_id);
CREATE INDEX idx_activity_user ON activity_logs(user_id);
`;
