import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Copy,
  Check,
  Upload,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { EvcPaymentConfig, EvcPaymentRequest, PaymentMethodType, UserProfile } from '../../types';
import { SAMPLE_RECEIPT_IMAGE } from '../../data/evcData';

interface EvcPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  selectedPlanId?: string; // 'monthly' | 'yearly' | 'lifetime'
  initialPlanId?: string;
  config: EvcPaymentConfig;
  existingPayments: EvcPaymentRequest[];
  onSubmitPayment?: (payment: Omit<EvcPaymentRequest, 'id' | 'submittedAt' | 'status'>) => void;
  onSubmitPaymentRequest?: (payment: Omit<EvcPaymentRequest, 'id' | 'submittedAt' | 'status'>) => void;
}

export const EvcPaymentModal: React.FC<EvcPaymentModalProps> = ({
  isOpen,
  onClose,
  user,
  selectedPlanId,
  initialPlanId,
  config,
  existingPayments,
  onSubmitPayment,
  onSubmitPaymentRequest,
}) => {
  const activeSelectedPlanId = selectedPlanId || initialPlanId || 'monthly';
  const submitPaymentHandler = onSubmitPaymentRequest || onSubmitPayment;

  const [step, setStep] = useState<'instructions' | 'form' | 'success'>('instructions');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('evc_plus');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [phoneNumber, setPhoneNumber] = useState('+252 61 ');
  const [planId, setPlanId] = useState(activeSelectedPlanId);
  const [transactionId, setTransactionId] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState(SAMPLE_RECEIPT_IMAGE);
  const [customAmount, setCustomAmount] = useState<number>(
    activeSelectedPlanId === 'lifetime'
      ? config.lifetimePriceUSD
      : activeSelectedPlanId === 'yearly'
      ? config.yearlyPriceUSD
      : config.monthlyPriceUSD
  );

  // Validation States
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTxnId, setSubmittedTxnId] = useState('');

  if (!isOpen) return null;

  // Calculate pricing based on chosen plan
  const getPlanDetails = (pId: string) => {
    switch (pId) {
      case 'yearly':
        return { name: 'Pro Yearly', price: config.yearlyPriceUSD, duration: 12 };
      case 'lifetime':
        return { name: 'Lifetime VIP', price: config.lifetimePriceUSD, duration: 999 };
      case 'monthly':
      default:
        return { name: 'Pro Monthly', price: config.monthlyPriceUSD, duration: 1 };
    }
  };

  const currentPlanDetails = getPlanDetails(planId);

  // Update amount when plan changes
  const handlePlanChange = (newPlanId: string) => {
    setPlanId(newPlanId);
    const details = getPlanDetails(newPlanId);
    setCustomAmount(details.price);
  };

  // Method specific merchant data
  const getMethodInfo = () => {
    return {
      title: 'EVC Plus Payment',
      phone: '+252 61 594 1664',
      ussd: '79937333133*15#',
      badge: 'EVC Plus Payment Method',
      color: 'text-cyan-300 bg-cyan-950/80 border-cyan-800',
    };
  };

  const methodInfo = getMethodInfo();

  // Copy USSD or Phone
  const handleCopyText = (text: string, type: 'phone' | 'ussd') => {
    navigator.clipboard.writeText(text);
    if (type === 'phone') {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Screenshot Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Image size exceeds 10MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotUrl(reader.result as string);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Handler with Duplicate Txn ID Security Guard
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanTxnId = transactionId.trim().toUpperCase();

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.length < 8) {
      setErrorMsg('Please enter a valid Somalia phone number.');
      return;
    }
    if (!cleanTxnId) {
      setErrorMsg('Please enter your EVC / ZAAD / Sahal Transaction ID.');
      return;
    }

    // Security Check: Prevent Duplicate Transaction ID
    const isDuplicate = existingPayments.some(
      (p) => p.transactionId.trim().toUpperCase() === cleanTxnId
    );

    if (isDuplicate) {
      setErrorMsg(
        `Security Alert: Transaction ID "${cleanTxnId}" has already been submitted or processed. Please double check your SMS receipt or contact support if you believe this is an error.`
      );
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      if (submitPaymentHandler) {
        submitPaymentHandler({
          fullName,
          email,
          phoneNumber,
          paymentMethod,
          planId,
          planName: currentPlanDetails.name,
          amountPaidUSD: customAmount,
          transactionId: cleanTxnId,
          screenshotUrl,
          durationMonths: currentPlanDetails.duration,
          adminNotes: `Submitted via ${methodInfo.title} local mobile payment`,
        });
      }

      setSubmittedTxnId(cleanTxnId);
      setIsSubmitting(false);
      setStep('success');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-[#0A0A12] w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative my-8 text-white space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-950 border border-cyan-800 text-cyan-400 rounded-2xl">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
                <span>EVC Plus & Mobile Money Somalia</span>
              </div>
              <h2 className="text-xl font-bold text-white">Manual Payment & Account Upgrade</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Instructions & Payment Options */}
        {step === 'instructions' && (
          <div className="space-y-6">
            
            {/* Step Indicator */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
              <span className="text-cyan-400 font-bold">Step 1 of 2: Mobile Transfer</span>
              <span>Step 2: Submit Receipt</span>
            </div>

            {/* Plan Selector Bar */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                <span>Selected Plan:</span>
                <span className="text-indigo-400">{currentPlanDetails.name}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'monthly', name: 'Pro Monthly', price: `$${config.monthlyPriceUSD}/mo` },
                  { id: 'yearly', name: 'Pro Yearly', price: `$${config.yearlyPriceUSD}/yr` },
                  { id: 'lifetime', name: 'Lifetime VIP', price: `$${config.lifetimePriceUSD} once` },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handlePlanChange(p.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      planId === p.id
                        ? 'bg-indigo-950 border-indigo-500 text-white font-bold ring-1 ring-indigo-500/50'
                        : 'bg-black/40 border-white/5 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <div className="font-bold">{p.name}</div>
                    <div className="text-[10px] text-slate-300">{p.price}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Mobile Money Method:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaymentMethod('evc_plus')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'evc_plus'
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-bold shadow-lg ring-1 ring-cyan-500/40'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold">EVC Plus</div>
                  <div className="text-[10px] text-slate-400">Hormuud Somalia</div>
                </button>

                <button
                  onClick={() => setPaymentMethod('zaad')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'zaad'
                      ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold shadow-lg ring-1 ring-amber-500/40'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold">ZAAD Service</div>
                  <div className="text-[10px] text-slate-400">Telesom</div>
                </button>

                <button
                  onClick={() => setPaymentMethod('sahal')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'sahal'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold shadow-lg ring-1 ring-emerald-500/40'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold">Sahal Service</div>
                  <div className="text-[10px] text-slate-400">Golis Telecom</div>
                </button>
              </div>
            </div>

            {/* Transfer Instructions Box */}
            <div className="p-5 bg-gradient-to-br from-slate-900 via-[#0C0C16] to-slate-950 border border-white/10 rounded-2xl space-y-4 shadow-inner">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${methodInfo.color}`}>
                  {methodInfo.badge}
                </span>
                <span className="text-xs font-bold text-slate-300">
                  Total USD: <span className="text-emerald-400 text-sm font-black">${customAmount}</span>
                </span>
              </div>

              {/* Merchant Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Payment Method:</div>
                  <div className="font-bold text-white text-xs">EVC Plus Payment</div>
                </div>

                <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-between">
                    <span>Payment Number:</span>
                    <button
                      onClick={() => handleCopyText('+252 61 594 1664', 'phone')}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
                    >
                      {copiedPhone ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPhone ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="font-mono font-bold text-cyan-300 text-xs">+252 61 594 1664</div>
                </div>
              </div>

              {/* Quick USSD Dial Code */}
              <div className="p-3.5 bg-black/60 border border-cyan-800/40 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                  <span>USSD Payment Code:</span>
                  <button
                    onClick={() => handleCopyText('79937333133*15#', 'ussd')}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px] font-bold"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Copied Code' : 'Copy USSD Code'}</span>
                  </button>
                </div>
                <div className="font-mono text-base font-extrabold text-amber-300 bg-white/5 p-2.5 rounded-lg text-center tracking-wider border border-white/10 select-all">
                  79937333133*15#
                </div>
              </div>

              <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-[11px] text-slate-300 space-y-1">
                <div className="font-bold text-amber-300">EVC Plus Manual Payment Instructions:</div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>Select your subscription plan above ({currentPlanDetails.name}).</li>
                  <li>Send payment using EVC Payment Number <span className="font-mono font-bold text-cyan-300">+252 61 594 1664</span> or USSD code <span className="font-mono font-bold text-amber-300">79937333133*15#</span>.</li>
                  <li>Click "I Have Completed Payment" below to fill out confirmation details and upload your payment receipt screenshot.</li>
                </ol>
              </div>
            </div>

            {/* Navigation Button */}
            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={() => setStep('form')}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>I Have Completed Payment &rarr; Submit Confirmation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* STEP 2: Payment Confirmation Form */}
        {step === 'form' && (
          <form onSubmit={handleSubmitForm} className="space-y-5">
            
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
              <button
                type="button"
                onClick={() => setStep('instructions')}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Instructions
              </button>
              <span className="text-cyan-400 font-bold">Step 2 of 2: Submit Details</span>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{errorMsg}</div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Mahamed Abdi Hassan"
                  className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. mahamed@gmail.com"
                  className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Somalia Phone Number */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Sender Phone Number (Somalia) *</label>
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+252 61 892 4102"
                  className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Transaction ID */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-cyan-300 flex items-center justify-between">
                  <span>EVC / Mobile Transaction ID *</span>
                  <span className="text-[10px] text-slate-400 font-normal">From SMS Receipt</span>
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. TXN-EVC-948210"
                  className="w-full px-3.5 py-2.5 text-xs bg-black/60 border border-cyan-800/60 rounded-xl text-amber-300 font-mono font-bold focus:outline-none focus:border-cyan-400 uppercase tracking-wider"
                />
              </div>

              {/* Plan & Amount */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Selected Plan</label>
                <select
                  value={planId}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="monthly" className="bg-slate-900 text-white">Pro Monthly ($15 USD)</option>
                  <option value="yearly" className="bg-slate-900 text-white">Pro Yearly ($120 USD)</option>
                  <option value="lifetime" className="bg-slate-900 text-white">Lifetime VIP ($299 USD)</option>
                </select>
              </div>

              {/* Amount Paid */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Amount Paid (USD $)</label>
                <input
                  type="number"
                  required
                  value={customAmount}
                  onChange={(e) => setCustomAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/10 rounded-xl text-emerald-400 font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

            </div>

            {/* Receipt Screenshot Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Upload Receipt Screenshot *</span>
                <button
                  type="button"
                  onClick={() => setScreenshotUrl(SAMPLE_RECEIPT_IMAGE)}
                  className="text-indigo-400 hover:text-indigo-300 text-[11px] underline"
                >
                  Auto-Fill Sample EVC Receipt
                </button>
              </div>

              <div className="border-2 border-dashed border-white/20 rounded-2xl p-4 text-center bg-white/5 hover:border-indigo-500/50 transition-colors flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-left">
                  {screenshotUrl ? (
                    <img
                      src={screenshotUrl}
                      alt="EVC Receipt Preview"
                      className="w-16 h-20 object-cover rounded-lg border border-white/20 shadow-md shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-20 bg-slate-900 rounded-lg border border-white/10 flex items-center justify-center text-slate-500 shrink-0">
                      <Upload className="w-6 h-6" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-white">
                      {screenshotUrl ? 'EVC Receipt Screenshot Uploaded' : 'Drag & Drop Receipt Image'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Supports PNG, JPG, or PDF receipt captures up to 10MB
                    </div>
                  </div>
                </div>

                <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shrink-0">
                  <span>Browse Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs text-slate-400 hover:text-white font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>Verifying & Sending...</span>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Submit EVC Payment for Approval</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

        {/* STEP 3: Success Screen */}
        {step === 'success' && (
          <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-950 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white">EVC Plus Payment Submitted Successfully!</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Your payment request is now registered with Ref ID <span className="font-mono text-amber-300 font-bold">{submittedTxnId}</span>. Our admin team will review your receipt and activate your Pro subscription shortly.
              </p>
            </div>

            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl max-w-md mx-auto text-xs text-left space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Selected Plan:</span>
                <span className="font-bold text-white">{currentPlanDetails.name}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Amount Paid:</span>
                <span className="font-bold text-emerald-400">${customAmount} USD</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Status:</span>
                <span className="font-bold text-amber-300 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Pending Admin Review
                </span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Got It &amp; Return to Dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
