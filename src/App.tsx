import React, { useState, useEffect } from 'react';
import { TOOLS_DATA } from './data/toolsData';
import { INITIAL_NOTIFICATIONS, INITIAL_MARKETPLACE_ITEMS, INITIAL_WORKFLOWS, INITIAL_API_KEYS, API_ENDPOINTS_DOCS } from './data/v2Data';
import { INITIAL_EVC_PAYMENTS, INITIAL_EVC_CONFIG, INITIAL_PAYMENT_AUDIT_LOGS } from './data/evcData';
import { INITIAL_REGISTERED_USERS } from './data/usersData';
import { PRICING_PLANS } from './data/pricingData';
import { UserProfile, ProcessedFile, ToolCategory, AppNotification, EvcPaymentRequest, EvcPaymentConfig, PaymentAuditLog, PricingPlan, MarketplaceItem, Workflow, ApiKey } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { ToolGrid } from './components/ToolGrid';

// Executors
import { PdfToolStudio } from './components/ToolExecutors/PdfToolStudio';
import { AiTextStudio } from './components/ToolExecutors/AiTextStudio';
import { AiChatStudio } from './components/ToolExecutors/AiChatStudio';
import { AiImageStudio } from './components/ToolExecutors/AiImageStudio';
import { ImageToolStudio } from './components/ToolExecutors/ImageToolStudio';
import { ConverterStudio } from './components/ToolExecutors/ConverterStudio';
import { AiResumeStudio } from './components/ToolExecutors/AiResumeStudio';
import { AiVideoGeneratorStudio } from './components/ToolExecutors/AiVideoGeneratorStudio';
import { ImageWatermarkRemoverStudio } from './components/ToolExecutors/ImageWatermarkRemoverStudio';
import { VideoWatermarkRemoverStudio } from './components/ToolExecutors/VideoWatermarkRemoverStudio';


// Dashboards
import { UserDashboard } from './components/Dashboard/UserDashboard';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { AdminGuard } from './components/Dashboard/AdminGuard';

// Modals
import { AuthModal } from './components/Modals/AuthModal';
import { PricingModal } from './components/Modals/PricingModal';
import { EvcPaymentModal } from './components/Modals/EvcPaymentModal';
import { CommandPalette } from './components/Modals/CommandPalette';
import { NotificationCenter } from './components/Modals/NotificationCenter';
import { UsageLimitModal } from './components/Modals/UsageLimitModal';
import { SubscriptionManagementModal } from './components/Modals/SubscriptionManagementModal';

// Pages
import { PricingPage } from './components/Pages/PricingPage';
import { BlogPage } from './components/Pages/BlogPage';
import { AboutPage } from './components/Pages/AboutPage';
import { ContactPage } from './components/Pages/ContactPage';
import { ApiDocsPage } from './components/Pages/ApiDocsPage';
import { TermsPage } from './components/Pages/TermsPage';
import { PrivacyPage } from './components/Pages/PrivacyPage';

// V2 SaaS Pages & Components
import { FilePipelineEngine } from './components/FileProcessing/FilePipelineEngine';
import { ForgotPasswordModal } from './components/Modals/ForgotPasswordModal';
import { AutomationBuilder } from './components/Pages/AutomationBuilder';
import { KnowledgeBasePage } from './components/Pages/KnowledgeBasePage';
import { ApiPlatformPage } from './components/Pages/ApiPlatformPage';
import { MarketplacePage } from './components/Pages/MarketplacePage';
import { AffiliatePage } from './components/Pages/AffiliatePage';
import { TeamWorkspacePage } from './components/Pages/TeamWorkspacePage';
import { SupportCenterPage } from './components/Pages/SupportCenterPage';
import { MobileHubPage } from './components/Pages/MobileHubPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('all');
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [initialFile, setInitialFile] = useState<File | null>(null);

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('ais_user_logged_in') === 'true';
  });

  // User Profile
  const [user, setUser] = useState<UserProfile>(() => {
    const savedLoggedIn = localStorage.getItem('ais_user_logged_in') === 'true';
    if (savedLoggedIn) {
      return {
        id: 'usr_normal_1',
        name: 'Abdirahman Hassan',
        email: 'abdirahman@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        plan: 'Pro Monthly',
        storageUsedMB: 120,
        storageLimitMB: 10000,
        filesProcessedCount: 24,
        favorites: ['merge-pdf', 'ai-summarizer', 'ai-chat'],
        role: 'user',
        accountStatus: 'active',
        joinedDate: '2026-03-15',
        usage: {
          aiRequestsToday: 0,
          aiRequestsLimitDaily: 50,
          aiRequestsThisMonth: 12,
          aiRequestsLimitMonthly: 500,
          pdfOpsToday: 0,
          pdfOpsLimitDaily: 20,
          storageUsedMB: 120,
          storageLimitMB: 10000,
          maxFileSizeMB: 100,
          apiRequestsThisMonth: 0,
          apiRequestsLimitMonthly: 0,
        },
      };
    }
    return {
      id: 'usr_guest',
      name: 'Guest User',
      email: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      plan: 'Free',
      storageUsedMB: 0,
      storageLimitMB: 100,
      filesProcessedCount: 0,
      favorites: [],
      role: 'user',
      accountStatus: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      usage: {
        aiRequestsToday: 0,
        aiRequestsLimitDaily: 10,
        aiRequestsThisMonth: 0,
        aiRequestsLimitMonthly: 100,
        pdfOpsToday: 0,
        pdfOpsLimitDaily: 5,
        storageUsedMB: 0,
        storageLimitMB: 100,
        maxFileSizeMB: 10,
        apiRequestsThisMonth: 0,
        apiRequestsLimitMonthly: 0,
      },
    };
  });

  // Registered Users Directory State
  const [usersList, setUsersList] = useState<UserProfile[]>(INITIAL_REGISTERED_USERS);

  // Dynamic Pricing Plans Controlled by Admin State
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>(PRICING_PLANS);

  // Marketplace items state
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>(INITIAL_MARKETPLACE_ITEMS);

  // Workflows state
  const [workflows, setWorkflows] = useState<Workflow[]>(INITIAL_WORKFLOWS);

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(INITIAL_API_KEYS);

  // Recent files activity
  const [recentFiles, setRecentFiles] = useState<ProcessedFile[]>([
    {
      id: 'f-1',
      fileName: 'Q3_Financial_Summary.pdf',
      originalSize: 1024 * 1250,
      processedSize: 1024 * 380,
      toolUsed: 'Compress PDF',
      createdAt: '10 mins ago',
    },
    {
      id: 'f-2',
      fileName: 'Executive_Contract_Signed.pdf',
      originalSize: 1024 * 890,
      processedSize: 1024 * 890,
      toolUsed: 'Sign PDF',
      createdAt: '2 hours ago',
    },
  ]);

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // EVC Plus Payments & Config State
  const [evcPayments, setEvcPayments] = useState<EvcPaymentRequest[]>(INITIAL_EVC_PAYMENTS);
  const [evcConfig, setEvcConfig] = useState<EvcPaymentConfig>(INITIAL_EVC_CONFIG);
  const [evcAuditLogs, setEvcAuditLogs] = useState<PaymentAuditLog[]>(INITIAL_PAYMENT_AUDIT_LOGS);

  // Dark mode (default to true for Immersive UI aesthetic)
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [evcModalOpen, setEvcModalOpen] = useState(false);
  const [selectedEvcPlanId, setSelectedEvcPlanId] = useState<string>('monthly');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);

  // Usage & Subscription Modals
  const [usageLimitModalOpen, setUsageLimitModalOpen] = useState(false);
  const [usageLimitReason, setUsageLimitReason] = useState<
    'ai_daily' | 'ai_monthly' | 'pdf_daily' | 'file_size' | 'storage_full' | 'api_limit'
  >('ai_daily');
  const [subscriptionManagementModalOpen, setSubscriptionManagementModalOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Toggle favorite
  const handleToggleFavorite = (toolId: string) => {
    setUser((prev) => {
      const exists = prev.favorites.includes(toolId);
      const newFavs = exists
        ? prev.favorites.filter((id) => id !== toolId)
        : [...prev.favorites, toolId];
      return { ...prev, favorites: newFavs };
    });
  };

  // Notification handlers
  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  // EVC Plus Submission Handler
  const handleSubmitEvcPaymentRequest = (newRequest: EvcPaymentRequest) => {
    setEvcPayments((prev) => [newRequest, ...prev]);

    // Create Audit Log
    const newAuditLog: PaymentAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'SUBMITTED',
      adminEmail: newRequest.email,
      transactionId: newRequest.transactionId,
      details: `User submitted EVC payment of $${newRequest.amountPaidUSD} (${newRequest.planId} plan). Tx ID: ${newRequest.transactionId}`,
      ipAddress: '197.220.64.12',
    };
    setEvcAuditLogs((prev) => [newAuditLog, ...prev]);

    // Add Notification to Admin & User
    const adminNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'New Somalia EVC Payment Received',
      message: `${newRequest.fullName} submitted payment of $${newRequest.amountPaidUSD} (TxID: ${newRequest.transactionId}). Pending admin approval.`,
      timestamp: 'Just now',
      read: false,
      type: 'payment',
    };
    setNotifications((prev) => [adminNotif, ...prev]);
  };

  // EVC Approval Handler
  const handleApproveEvcPayment = (paymentId: string, durationMonths: number, adminNotes?: string) => {
    setEvcPayments((prev) =>
      prev.map((p) => {
        if (p.id === paymentId) {
          return {
            ...p,
            status: 'approved',
            approvedAt: new Date().toISOString(),
            durationMonths,
            adminNotes,
          };
        }
        return p;
      })
    );

    const payment = evcPayments.find((p) => p.id === paymentId);
    if (payment) {
      // Upgrade active user if email matches or for testing demo
      setUser((prev) => ({
        ...prev,
        plan: payment.planId === 'lifetime' ? 'Lifetime VIP' : 'Pro',
        storageLimitMB: payment.planId === 'lifetime' ? 100000 : 10000,
      }));

      // Audit Log
      const auditLog: PaymentAuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'APPROVED',
        adminEmail: 'admin@aisuccesshub.com',
        transactionId: payment.transactionId,
        details: `Approved payment ${payment.transactionId} for user ${payment.fullName} (${payment.email}). Subscription duration set to ${durationMonths} month(s).`,
      };
      setEvcAuditLogs((prev) => [auditLog, ...prev]);

      // Notification
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        title: '🎉 EVC Plus Payment Approved!',
        message: `Your payment of $${payment.amountPaidUSD} (TxID: ${payment.transactionId}) has been verified. Your account is now upgraded to ${payment.planId === 'lifetime' ? 'Lifetime VIP' : 'Pro'}!`,
        timestamp: 'Just now',
        read: false,
        type: 'subscription',
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  // EVC Rejection Handler
  const handleRejectEvcPayment = (paymentId: string, rejectionReason: string) => {
    setEvcPayments((prev) =>
      prev.map((p) => {
        if (p.id === paymentId) {
          return {
            ...p,
            status: 'rejected',
            rejectionReason,
          };
        }
        return p;
      })
    );

    const payment = evcPayments.find((p) => p.id === paymentId);
    if (payment) {
      const auditLog: PaymentAuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'REJECTED',
        adminEmail: 'admin@aisuccesshub.com',
        transactionId: payment.transactionId,
        details: `Rejected payment ${payment.transactionId} for ${payment.email}. Reason: ${rejectionReason}`,
      };
      setEvcAuditLogs((prev) => [auditLog, ...prev]);

      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        title: 'EVC Payment Rejected',
        message: `Your payment request (${payment.transactionId}) could not be verified. Reason: ${rejectionReason}`,
        timestamp: 'Just now',
        read: false,
        type: 'security',
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  // Update EVC Merchant Config
  const handleUpdateEvcConfig = (newConfig: EvcPaymentConfig) => {
    setEvcConfig(newConfig);
    const auditLog: PaymentAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'CONFIG_UPDATED',
      adminEmail: 'admin@aisuccesshub.com',
      transactionId: 'SYS_CFG',
      details: `Merchant settings updated. Merchant number set to ${newConfig.merchantPhone}`,
    };
    setEvcAuditLogs((prev) => [auditLog, ...prev]);
  };

  // User & Role Management Handlers
  const handleUpdateUserRole = (userId: string, newRole: 'user' | 'admin') => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    if (user.id === userId) {
      setUser((prev) => ({ ...prev, role: newRole }));
    }

    const log: PaymentAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'CONFIG_UPDATED',
      adminEmail: user.email,
      transactionId: 'USER_ROLE_CHG',
      details: `Updated role for user ID ${userId} to '${newRole}'`,
    };
    setEvcAuditLogs((prev) => [log, ...prev]);
  };

  const handleUpdateUserPlan = (userId: string, newPlan: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, plan: newPlan } : u))
    );
    if (user.id === userId) {
      setUser((prev) => ({ ...prev, plan: newPlan }));
    }

    const log: PaymentAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'PRICING_UPDATED',
      adminEmail: user.email,
      transactionId: 'USER_PLAN_CHG',
      details: `Updated subscription plan for user ID ${userId} to '${newPlan}'`,
    };
    setEvcAuditLogs((prev) => [log, ...prev]);
  };

  const handleToggleAccountStatus = (userId: string, newStatus: 'active' | 'suspended') => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, accountStatus: newStatus } : u))
    );

    const log: PaymentAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'CONFIG_UPDATED',
      adminEmail: user.email,
      transactionId: 'USER_STATUS_CHG',
      details: `Set account status for user ID ${userId} to '${newStatus}'`,
    };
    setEvcAuditLogs((prev) => [log, ...prev]);
  };

  const handleAddUser = (newUser: UserProfile) => {
    setUsersList((prev) => [newUser, ...prev]);

    const log: PaymentAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'CONFIG_UPDATED',
      adminEmail: user.email,
      transactionId: 'USER_CREATED',
      details: `Created new user account: ${newUser.email} (${newUser.role})`,
    };
    setEvcAuditLogs((prev) => [log, ...prev]);
  };

  const handleUpdatePlans = (updatedPlans: PricingPlan[]) => {
    setPricingPlans(updatedPlans);

    const log: PaymentAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'PRICING_UPDATED',
      adminEmail: user.email,
      transactionId: 'PRICING_CFG_CHG',
      details: `Admin updated pricing plans configuration (${updatedPlans.length} active plans)`,
    };
    setEvcAuditLogs((prev) => [log, ...prev]);
  };

  const handleSuccessAdminAuth = (adminEmail: string) => {
    setUser({
      id: 'usr-admin-1',
      name: 'Ridwaan Mohamed (Admin)',
      email: adminEmail || 'admin@aisuccesshub.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      plan: 'Lifetime',
      storageUsedMB: 1240,
      storageLimitMB: 100000,
      filesProcessedCount: 342,
      favorites: ['merge-pdf', 'ai-copilot'],
      role: 'admin',
      accountStatus: 'active',
      joinedDate: '2026-01-10',
    });
    setCurrentPage('admin');

    const log: PaymentAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'CONFIG_UPDATED',
      adminEmail: adminEmail || 'admin@aisuccesshub.com',
      transactionId: 'ADMIN_AUTH_PASS',
      details: `Admin authenticated successfully via private SHA-256 password challenge.`,
    };
    setEvcAuditLogs((prev) => [log, ...prev]);
  };

  // Log file processing
  const handleLogFileProcess = (
    fileName: string,
    originalSize: number,
    processedSize: number,
    toolUsed: string
  ) => {
    const newFile: ProcessedFile = {
      id: `f-${Date.now()}`,
      fileName,
      originalSize,
      processedSize,
      toolUsed,
      createdAt: 'Just now',
    };
    setRecentFiles((prev) => [newFile, ...prev]);

    setUser((prev) => ({
      ...prev,
      filesProcessedCount: prev.filesProcessedCount + 1,
      storageUsedMB: prev.storageUsedMB + processedSize / (1024 * 1024),
    }));
  };

  const handleSelectTool = (toolId: string, file?: File) => {
    const tool = TOOLS_DATA.find((t) => t.id === toolId);
    
    // Perform limit checks based on user's active plan limits
    if (tool && user.usage) {
      // Check file size limit
      if (file && file.size > user.usage.maxFileSizeMB * 1024 * 1024) {
        setUsageLimitReason('file_size');
        setUsageLimitModalOpen(true);
        return;
      }

      // Check AI request limits
      if (tool.category === 'ai' || tool.id.startsWith('ai-')) {
        if (
          user.usage.aiRequestsLimitDaily > 0 &&
          user.usage.aiRequestsToday >= user.usage.aiRequestsLimitDaily
        ) {
          setUsageLimitReason('ai_daily');
          setUsageLimitModalOpen(true);
          return;
        }

        if (
          user.usage.aiRequestsLimitMonthly > 0 &&
          user.usage.aiRequestsThisMonth >= user.usage.aiRequestsLimitMonthly
        ) {
          setUsageLimitReason('ai_monthly');
          setUsageLimitModalOpen(true);
          return;
        }
      }

      // Check PDF operations limits
      if (tool.category === 'pdf' || tool.id.includes('pdf')) {
        if (
          user.usage.pdfOpsLimitDaily > 0 &&
          user.usage.pdfOpsToday >= user.usage.pdfOpsLimitDaily
        ) {
          setUsageLimitReason('pdf_daily');
          setUsageLimitModalOpen(true);
          return;
        }
      }

      // Check Storage limit
      if (user.storageUsedMB >= user.storageLimitMB) {
        setUsageLimitReason('storage_full');
        setUsageLimitModalOpen(true);
        return;
      }
    }

    // Increment usage tracking when tool is launched
    setUser((prev) => {
      if (!prev.usage) return prev;
      const isAi = tool?.category === 'ai' || toolId.startsWith('ai-');
      const isPdf = tool?.category === 'pdf' || toolId.includes('pdf');
      return {
        ...prev,
        usage: {
          ...prev.usage,
          aiRequestsToday: isAi ? prev.usage.aiRequestsToday + 1 : prev.usage.aiRequestsToday,
          aiRequestsThisMonth: isAi ? prev.usage.aiRequestsThisMonth + 1 : prev.usage.aiRequestsThisMonth,
          pdfOpsToday: isPdf ? prev.usage.pdfOpsToday + 1 : prev.usage.pdfOpsToday,
        },
      };
    });

    setActiveToolId(toolId);
    if (file) setInitialFile(file);
    setCurrentPage('tool-studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Usage & Subscription Handlers
  const handleIncrementAiUsage = () => {
    setUser((prev) => ({
      ...prev,
      usage: {
        ...prev.usage,
        aiRequestsToday: prev.usage.aiRequestsToday + 1,
        aiRequestsThisMonth: prev.usage.aiRequestsThisMonth + 1,
      },
    }));
  };

  const handleTriggerUsageLimitModal = (
    reason: 'ai_daily' | 'ai_monthly' | 'pdf_daily' | 'file_size' | 'storage_full' | 'api_limit'
  ) => {
    setUsageLimitReason(reason);
    setUsageLimitModalOpen(true);
  };

  const renderToolExecutor = () => {
    if (!activeToolId) return null;
    const tool = TOOLS_DATA.find((t) => t.id === activeToolId);
    if (!tool) return null;

    if (activeToolId === 'ai-chat') {
      return (
        <AiChatStudio
          user={user}
          onBack={() => {
            setActiveToolId(null);
            setCurrentPage('home');
          }}
          onIncrementAiUsage={handleIncrementAiUsage}
          onTriggerUsageLimit={(reason) => handleTriggerUsageLimitModal(reason)}
        />
      );
    }

    if (activeToolId === 'ai-resume-builder') {
      return (
        <AiResumeStudio
          user={user}
          onBack={() => {
            setActiveToolId(null);
            setCurrentPage('home');
          }}
          onLogFileProcess={handleLogFileProcess}
          onIncrementAiUsage={handleIncrementAiUsage}
          onTriggerUsageLimit={(reason) => handleTriggerUsageLimitModal(reason)}
        />
      );
    }

    if (activeToolId === 'ai-video-generator') {
      return (
        <AiVideoGeneratorStudio
          user={user}
          onTriggerUsageLimit={(reason) => handleTriggerUsageLimitModal(reason)}
          onSaveFileToDashboard={(file) => {
            handleLogFileProcess(file.name, file.sizeMB * 1024 * 1024, file.sizeMB * 1024 * 1024, file.tool);
          }}
        />
      );
    }

    if (activeToolId === 'ai-image-watermark-remover') {
      return (
        <ImageWatermarkRemoverStudio
          user={user}
          onTriggerUsageLimit={(reason) => handleTriggerUsageLimitModal(reason)}
          onSaveFileToDashboard={(file) => {
            handleLogFileProcess(file.name, file.sizeMB * 1024 * 1024, file.sizeMB * 1024 * 1024, file.tool);
          }}
        />
      );
    }

    if (activeToolId === 'ai-video-watermark-remover') {
      return (
        <VideoWatermarkRemoverStudio
          user={user}
          onTriggerUsageLimit={(reason) => handleTriggerUsageLimitModal(reason)}
          onSaveFileToDashboard={(file) => {
            handleLogFileProcess(file.name, file.sizeMB * 1024 * 1024, file.sizeMB * 1024 * 1024, file.tool);
          }}
        />
      );
    }

    if (activeToolId === 'ai-image-generator' || activeToolId === 'ai-thumbnail-generator') {

      return (
        <AiImageStudio
          user={user}
          onBack={() => {
            setActiveToolId(null);
            setCurrentPage('home');
          }}
          onLogFileProcess={handleLogFileProcess}
          onIncrementAiUsage={handleIncrementAiUsage}
          onTriggerUsageLimit={(reason) => handleTriggerUsageLimitModal(reason)}
        />
      );
    }

    if (tool.category === 'pdf') {
      return (
        <PdfToolStudio
          toolId={activeToolId}
          initialFile={initialFile}
          onBack={() => {
            setActiveToolId(null);
            setCurrentPage('home');
          }}
          onLogFileProcess={handleLogFileProcess}
        />
      );
    }

    if (tool.category === 'ai') {
      return (
        <AiTextStudio
          toolId={activeToolId}
          user={user}
          onBack={() => {
            setActiveToolId(null);
            setCurrentPage('home');
          }}
          onLogFileProcess={handleLogFileProcess}
          onIncrementAiUsage={handleIncrementAiUsage}
          onTriggerUsageLimit={(reason) => handleTriggerUsageLimitModal(reason)}
        />
      );
    }

    if (tool.category === 'image') {
      return (
        <ImageToolStudio
          toolId={activeToolId}
          initialFile={initialFile}
          onBack={() => {
            setActiveToolId(null);
            setCurrentPage('home');
          }}
          onLogFileProcess={handleLogFileProcess}
        />
      );
    }

    return (
      <ConverterStudio
        toolId={activeToolId}
        initialFile={initialFile}
        onBack={() => {
          setActiveToolId(null);
          setCurrentPage('home');
        }}
        onLogFileProcess={handleLogFileProcess}
      />
    );
  };

  const renderCurrentPage = () => {
    if (currentPage === 'tool-studio') {
      return renderToolExecutor();
    }

    switch (currentPage) {
      case 'pricing':
        return (
          <PricingPage
            user={user}
            plans={pricingPlans}
            onOpenPricingModal={() => setPricingModalOpen(true)}
            onOpenEvcModal={(planId) => {
              setSelectedEvcPlanId(planId);
              setEvcModalOpen(true);
            }}
          />
        );
      case 'blog':
        return <BlogPage onBack={() => setCurrentPage('home')} />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'api-docs':
        return <ApiDocsPage />;
      case 'terms':
        return <TermsPage />;
      case 'privacy':
        return <PrivacyPage />;
      case 'dashboard':
        return (
          <UserDashboard
            user={user}
            recentFiles={recentFiles}
            tools={TOOLS_DATA}
            onSelectTool={handleSelectTool}
            onOpenPricing={() => setPricingModalOpen(true)}
            onOpenSubscriptionManagement={() => setSubscriptionManagementModalOpen(true)}
          />
        );
      case 'admin':
        return (
          <AdminGuard
            user={user}
            onNavigateHome={() => setCurrentPage('home')}
            onSuccessAdminAuth={handleSuccessAdminAuth}
          >
            <AdminDashboard
              onBack={() => setCurrentPage('home')}
              evcPayments={evcPayments}
              evcConfig={evcConfig}
              evcAuditLogs={evcAuditLogs}
              users={usersList}
              plans={pricingPlans}
              apiKeys={apiKeys}
              onCreateKey={(keyName) => {
                const newKeyObj: ApiKey = {
                  id: `key-${Date.now()}`,
                  name: keyName,
                  key: `sk_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
                  createdAt: 'Just now',
                  lastUsed: 'Never',
                  status: 'active',
                  requestsCount: 0,
                  rateLimitPerMin: 1200,
                };
                setApiKeys((prev) => [newKeyObj, ...prev]);
              }}
              onRevokeKey={(keyId) => {
                setApiKeys((prev) =>
                  prev.map((k) => (k.id === keyId ? { ...k, status: 'revoked' } : k))
                );
              }}
              onApproveEvcPayment={handleApproveEvcPayment}
              onRejectEvcPayment={handleRejectEvcPayment}
              onUpdateEvcConfig={handleUpdateEvcConfig}
              onUpdateUserRole={handleUpdateUserRole}
              onUpdateUserPlan={handleUpdateUserPlan}
              onToggleAccountStatus={handleToggleAccountStatus}
              onAddUser={handleAddUser}
              onUpdatePlans={handleUpdatePlans}
            />
          </AdminGuard>
        );

      // V2 SaaS Pages
      case 'file-pipeline':
        return <FilePipelineEngine user={user} onLogFileProcess={(name, orig, proc, tool) => {
          setRecentFiles((prev) => [
            {
              id: `f-${Date.now()}`,
              fileName: name,
              originalSize: orig,
              processedSize: proc,
              toolUsed: tool,
              createdAt: 'Just now',
            },
            ...prev,
          ]);
        }} />;
      case 'automation':
        return (
          <AutomationBuilder
            workflows={workflows}
            onSaveWorkflow={(savedWf) => {
              setWorkflows((prev) => {
                const idx = prev.findIndex((w) => w.id === savedWf.id);
                if (idx >= 0) {
                  const updated = [...prev];
                  updated[idx] = savedWf;
                  return updated;
                }
                return [savedWf, ...prev];
              });
            }}
            onRunWorkflow={(wfId) => {
              setWorkflows((prev) =>
                prev.map((w) =>
                  w.id === wfId
                    ? { ...w, runsCount: (w.runsCount || 0) + 1, lastRun: 'Just now' }
                    : w
                )
              );
            }}
          />
        );
      case 'knowledge-base':
        return <KnowledgeBasePage />;
      case 'api-platform':
        return (
          <ApiPlatformPage
            apiKeys={apiKeys}
            endpoints={API_ENDPOINTS_DOCS}
            onCreateKey={(keyName) => {
              const newKeyObj: ApiKey = {
                id: `key-${Date.now()}`,
                name: keyName,
                key: `sk_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`,
                createdAt: 'Just now',
                lastUsed: 'Never',
                status: 'active',
                requestsCount: 0,
                rateLimitPerMin: 1200,
              };
              setApiKeys((prev) => [newKeyObj, ...prev]);
            }}
            onRevokeKey={(keyId) => {
              setApiKeys((prev) =>
                prev.map((k) => (k.id === keyId ? { ...k, status: 'revoked' } : k))
              );
            }}
          />
        );
      case 'marketplace':
        return (
          <MarketplacePage
            items={marketplaceItems}
            onAddItem={(newItem) => setMarketplaceItems((prev) => [newItem, ...prev])}
          />
        );
      case 'affiliate':
        return <AffiliatePage />;
      case 'team-workspace':
        return <TeamWorkspacePage />;
      case 'support-center':
        return <SupportCenterPage />;
      case 'mobile-hub':
        return <MobileHubPage />;

      default:
        return (
          <main>
            <Hero onSelectTool={handleSelectTool} tools={TOOLS_DATA} />
            <ToolGrid
              tools={TOOLS_DATA}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              favorites={user.favorites}
              onToggleFavorite={handleToggleFavorite}
              onSelectTool={handleSelectTool}
            />
          </main>
        );
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#020205] text-slate-100 flex flex-col font-sans transition-colors duration-200 relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background Ambient Glow Orbs */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/3 right-10 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 left-[-100px] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      
      {/* Top Navbar */}
      <Navbar
        user={user}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setCurrentPage('home');
          setActiveToolId(null);
        }}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenPricing={() => setPricingModalOpen(true)}
        onOpenSubscriptionManagement={() => setSubscriptionManagementModalOpen(true)}
        onOpenDashboard={() => setCurrentPage('dashboard')}
        onOpenAdmin={() => setCurrentPage('admin')}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onOpenNotifications={() => setNotificationCenterOpen(true)}
        unreadNotificationsCount={unreadCount}
        onNavigatePage={(page) => {
          setCurrentPage(page);
          setActiveToolId(null);
        }}
        currentPage={currentPage}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Page Content */}
      <div className="flex-1">{renderCurrentPage()}</div>

      {/* Footer */}
      <Footer
        onNavigatePage={(page) => {
          setCurrentPage(page);
          setActiveToolId(null);
        }}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setCurrentPage('home');
          setActiveToolId(null);
        }}
      />

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(u) => setUser(u)}
        onOpenForgotPassword={() => {
          setAuthModalOpen(false);
          setForgotPasswordModalOpen(true);
        }}
      />

      <ForgotPasswordModal
        isOpen={forgotPasswordModalOpen}
        onClose={() => setForgotPasswordModalOpen(false)}
        onReturnToLogin={() => {
          setForgotPasswordModalOpen(false);
          setAuthModalOpen(true);
        }}
      />

      <PricingModal
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
        user={user}
        plans={pricingPlans}
        onUpgradePlan={(newPlan) => setUser((prev) => ({ ...prev, plan: newPlan }))}
        onOpenEvcModal={(planId) => {
          setPricingModalOpen(false);
          setSelectedEvcPlanId(planId);
          setEvcModalOpen(true);
        }}
      />

      <EvcPaymentModal
        isOpen={evcModalOpen}
        onClose={() => setEvcModalOpen(false)}
        user={user}
        initialPlanId={selectedEvcPlanId}
        selectedPlanId={selectedEvcPlanId}
        config={evcConfig}
        existingPayments={evcPayments}
        onSubmitPaymentRequest={handleSubmitEvcPaymentRequest}
        onSubmitPayment={handleSubmitEvcPaymentRequest}
      />

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        tools={TOOLS_DATA}
        onSelectTool={handleSelectTool}
        onNavigatePage={(p) => {
          setCurrentPage(p);
          setActiveToolId(null);
        }}
      />

      <NotificationCenter
        notifications={notifications}
        isOpen={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
        onMarkAsRead={handleMarkNotificationRead}
        onClearAll={handleClearAllNotifications}
        onNavigatePage={(p) => {
          setCurrentPage(p);
          setActiveToolId(null);
        }}
      />

      <UsageLimitModal
        isOpen={usageLimitModalOpen}
        onClose={() => setUsageLimitModalOpen(false)}
        user={user}
        reason={usageLimitReason}
        onOpenPricing={() => {
          setUsageLimitModalOpen(false);
          setPricingModalOpen(true);
        }}
      />

      <SubscriptionManagementModal
        isOpen={subscriptionManagementModalOpen}
        onClose={() => setSubscriptionManagementModalOpen(false)}
        user={user}
        plans={pricingPlans}
        onUpgradePlan={(newPlan) => setUser((prev) => ({ ...prev, plan: newPlan }))}
        onOpenEvcModal={(planId) => {
          setSubscriptionManagementModalOpen(false);
          setSelectedEvcPlanId(planId);
          setEvcModalOpen(true);
        }}
      />

    </div>
  );
}


