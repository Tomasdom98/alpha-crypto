import { X, Check, Sparkles, Copy, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PAYMENT_OPTIONS = {
  solana: {
    name: 'Solana (USDC-SPL)',
    address: '2X7DSWNgegbCCk1A9cdiSQm5Fk3zpkesDRpQrSqETKiv',
    chain: 'Solana',
    token: 'USDC-SPL',
    icon: '◎'
  },
  base: {
    name: 'Base (USDC)',
    address: '0x8b1624c8b184Edb4e7430194865490Ba5e860f0C',
    chain: 'Base',
    token: 'USDC',
    icon: '🔵'
  },
  arbitrum: {
    name: 'Arbitrum (USDC)',
    address: '0x8b1624c8b184Edb4e7430194865490Ba5e860f0C',
    chain: 'Arbitrum',
    token: 'USDC',
    icon: '🔷'
  }
};

export default function PremiumModal({ isOpen, onClose }) {
  const [step, setStep] = useState('select'); // select | payment | email | success
  const [selectedChain, setSelectedChain] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [email, setEmail] = useState('');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setStep('select');
      setSelectedChain(null);
      setEmail('');
      setTxHash('');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (selectedChain && step === 'payment') {
      generateQR();
    }
  }, [selectedChain, step]);

  const generateQR = async () => {
    try {
      const option = PAYMENT_OPTIONS[selectedChain];
      const qr = await QRCode.toDataURL(option.address, {
        width: 256,
        margin: 2,
        color: {
          dark: '#10b981',
          light: '#ffffff'
        }
      });
      setQrCode(qr);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const copyAddress = () => {
    const option = PAYMENT_OPTIONS[selectedChain];
    navigator.clipboard.writeText(option.address);
    toast.success('Address copied to clipboard!');
  };

  const handleChainSelect = (chain) => {
    setSelectedChain(chain);
    setStep('payment');
  };

  const handlePaymentSent = () => {
    setStep('email');
  };

  const handleSubmitPayment = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const option = PAYMENT_OPTIONS[selectedChain];
      await axios.post(`${API}/payments/submit`, {
        email,
        wallet_address: option.address,
        chain: option.chain,
        tx_hash: txHash || null,
        amount: 20
      });

      setStep('success');
      toast.success('Payment submitted successfully!');
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('Failed to submit payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const features = [
    'Exclusive premium articles and analysis',
    'Access to premium-only airdrops',
    'Early market signals and alerts',
    'Deep-dive tokenomics research',
    'Advanced market indicators',
    'Priority support',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="premium-modal">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-emerald-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Sparkles className="text-emerald-500" size={28} />
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Premium Subscription
            </h2>
          </div>
          <button
            data-testid="close-modal-btn"
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="text-gray-400" size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Price */}
          <div className="text-center py-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20">
            <div className="text-5xl font-black text-white mb-2" style={{ fontFamily: 'Space Grotesk, monospace' }}>
              $20<span className="text-2xl text-gray-400">/month</span>
            </div>
            <p className="text-emerald-500 font-medium">Pay with crypto - Solana, Base, or Arbitrum</p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white mb-4">What's Included:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="text-emerald-500" size={14} />
                  </div>
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step: Select Payment Chain */}
          {step === 'select' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Select Payment Method:</h3>
              {Object.entries(PAYMENT_OPTIONS).map(([key, option]) => (
                <button
                  key={key}
                  onClick={() => handleChainSelect(key)}
                  data-testid={`chain-${key}`}
                  className="w-full p-5 bg-gray-800/50 hover:bg-emerald-500/10 border border-gray-700 hover:border-emerald-500/50 rounded-xl transition-all duration-300 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{option.icon}</span>
                    <div className="text-left">
                      <div className="text-white font-bold">{option.name}</div>
                      <div className="text-sm text-gray-400">{option.chain} • {option.token}</div>
                    </div>
                  </div>
                  <Wallet className="text-emerald-500 group-hover:scale-110 transition-transform" size={24} />
                </button>
              ))}
            </div>
          )}

          {/* Step: Show Payment Details */}
          {step === 'payment' && selectedChain && (
            <div className="space-y-6">
              <button
                onClick={() => setStep('select')}
                className="text-gray-400 hover:text-emerald-500 text-sm transition-colors"
              >
                ← Change payment method
              </button>

              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-4">Send Payment to {PAYMENT_OPTIONS[selectedChain].chain}</h3>
                
                {/* QR Code */}
                <div className="flex justify-center mb-6">
                  {qrCode && (
                    <img src={qrCode} alt="Payment QR Code" className="w-64 h-64 rounded-xl border-4 border-emerald-500/30" />
                  )}
                </div>

                {/* Address */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-4">
                  <div className="text-sm text-gray-400 mb-2">Send exactly <strong className="text-white">$20 {PAYMENT_OPTIONS[selectedChain].token}</strong> to:</div>
                  <div className="flex items-center gap-2 justify-center">
                    <code className="text-emerald-400 text-sm break-all">{PAYMENT_OPTIONS[selectedChain].address}</code>
                    <button
                      onClick={copyAddress}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Copy address"
                    >
                      <Copy size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-6">
                  ⚠️ Make sure to send on {PAYMENT_OPTIONS[selectedChain].chain} network only
                </div>

                <button
                  onClick={handlePaymentSent}
                  data-testid="payment-sent-btn"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 px-6 rounded-lg shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-102"
                >
                  I've Sent the Payment
                </button>
              </div>
            </div>
          )}

          {/* Step: Email Collection */}
          {step === 'email' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">Confirm Your Email</h3>
              <p className="text-gray-400 text-sm mb-6">
                Enter your email to receive premium access confirmation. We'll verify your payment and activate your subscription.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    data-testid="email-input"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Transaction Hash (Optional)</label>
                  <input
                    type="text"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder="0x... or transaction signature"
                    data-testid="tx-hash-input"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>

                <button
                  onClick={handleSubmitPayment}
                  disabled={loading}
                  data-testid="submit-payment-btn"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 px-6 rounded-lg shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Payment'}
                </button>
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="text-emerald-500" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Payment Submitted!</h3>
              <p className="text-gray-400 mb-6">
                Your payment is pending verification. You'll receive an email at <strong className="text-white">{email}</strong> once your premium membership is activated.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                This usually takes 24-48 hours. We verify payments manually to ensure security.
              </p>
              <button
                onClick={onClose}
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}