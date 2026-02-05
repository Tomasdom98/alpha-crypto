import { X, Check, Sparkles, Copy, Wallet, Crown, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import axios from 'axios';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SOLANA_WALLET = '2X7DSWNgegbCCk1A9cdiSQm5Fk3zpkesDRpQrSqETKiv';
const EVM_WALLET = '0x8b1624c8b184Edb4e7430194865490Ba5e860f0C';

// Pricing structure
const PRICING = {
  alpha: {
    monthly: { price: 30, label: '$30/mes' },
    yearly: { price: 300, monthlyEquiv: 25, label: '$300/año', discount: 20 }
  },
  pro: {
    monthly: { price: 100, label: '$100/mes' },
    yearly: { price: 840, monthlyEquiv: 70, label: '$840/año', discount: 30 }
  }
};

// Translation strings
const TRANSLATIONS = {
  es: {
    premiumPlans: 'Planes Premium',
    choosePlan: 'Elige el plan que mejor se adapte a tus necesidades',
    monthly: 'Mensual',
    yearly: 'Anual',
    saveUpTo: 'Ahorra hasta 30%',
    alphaAccess: 'Alpha Access',
    alphaPro: 'Alpha Pro',
    mostPopular: 'MÁS POPULAR',
    perMonth: '/mes USDC',
    perYear: '/año USDC',
    monthlyEquiv: '/mes equivalente',
    save20: 'Ahorra 20%',
    save30: 'Ahorra 30%',
    select: 'Seleccionar',
    freeContent: 'Contenido gratuito: Articles, Market Indices, Educación básica',
    changePlan: '← Cambiar plan',
    selectPayment: 'Selecciona método de pago:',
    changePayment: '← Cambiar método de pago',
    sendPayment: 'Envía el pago vía',
    sendExactly: 'Envía exactamente',
    to: 'a:',
    ensureNetwork: 'Asegúrate de enviar en la red',
    only: 'únicamente',
    paymentSent: 'Ya envié el pago',
    confirmEmail: 'Confirma tu email',
    emailDesc: 'Ingresa tu email para recibir la confirmación de acceso premium.',
    email: 'Email *',
    txHashOptional: 'Hash de transacción (Opcional)',
    txHashPlaceholder: '0x... o firma de transacción',
    submitPayment: 'Enviar pago',
    sending: 'Enviando...',
    success: '¡Pago enviado!',
    successDesc: 'Tu pago está pendiente de verificación. Recibirás un email en',
    whenActivated: 'cuando tu membresía esté activada.',
    normalTime: 'Esto normalmente toma 24-48 horas.',
    close: 'Cerrar',
    copied: 'Dirección copiada al portapapeles!',
    errorEmail: 'Por favor ingresa un email válido',
    errorSubmit: 'Error al enviar el pago. Intenta de nuevo.',
    month: 'mes',
    year: 'año',
    alphaFeatures: [
      'Airdrops con guías detalladas',
      'Portfolio tracking',
      'Early Signals y alertas',
      'Análisis de mercado premium',
    ],
    proFeatures: [
      'Todo en Alpha Access',
      'Consultoría personal y empresarial',
      'Soporte prioritario',
      'Research exclusivo',
      'Llamadas mensuales de estrategia',
    ],
  },
  en: {
    premiumPlans: 'Premium Plans',
    choosePlan: 'Choose the plan that best fits your needs',
    monthly: 'Monthly',
    yearly: 'Yearly',
    saveUpTo: 'Save up to 30%',
    alphaAccess: 'Alpha Access',
    alphaPro: 'Alpha Pro',
    mostPopular: 'MOST POPULAR',
    perMonth: '/month USDC',
    perYear: '/year USDC',
    monthlyEquiv: '/month equivalent',
    save20: 'Save 20%',
    save30: 'Save 30%',
    select: 'Select',
    freeContent: 'Free content: Articles, Market Indices, Basic education',
    changePlan: '← Change plan',
    selectPayment: 'Select payment method:',
    changePayment: '← Change payment method',
    sendPayment: 'Send payment via',
    sendExactly: 'Send exactly',
    to: 'to:',
    ensureNetwork: 'Make sure to send on the',
    only: 'network only',
    paymentSent: 'I sent the payment',
    confirmEmail: 'Confirm your email',
    emailDesc: 'Enter your email to receive premium access confirmation.',
    email: 'Email *',
    txHashOptional: 'Transaction hash (Optional)',
    txHashPlaceholder: '0x... or transaction signature',
    submitPayment: 'Submit payment',
    sending: 'Sending...',
    success: 'Payment sent!',
    successDesc: 'Your payment is pending verification. You will receive an email at',
    whenActivated: 'when your membership is activated.',
    normalTime: 'This normally takes 24-48 hours.',
    close: 'Close',
    copied: 'Address copied to clipboard!',
    errorEmail: 'Please enter a valid email',
    errorSubmit: 'Error submitting payment. Please try again.',
    month: 'month',
    year: 'year',
    alphaFeatures: [
      'Airdrops with detailed guides',
      'Portfolio tracking',
      'Early Signals and alerts',
      'Premium market analysis',
    ],
    proFeatures: [
      'Everything in Alpha Access',
      'Personal and business consulting',
      'Priority support',
      'Exclusive research',
      'Monthly strategy calls',
    ],
  }
};

export default function PremiumModal({ isOpen, onClose }) {
  const [step, setStep] = useState('tier');
  const [selectedTier, setSelectedTier] = useState(null);
  const [selectedChain, setSelectedChain] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [qrCode, setQrCode] = useState('');
  const [email, setEmail] = useState('');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const { language } = useLanguage();

  // Translations
  const tx = {
    es: {
      premiumPlans: 'Planes Premium',
      choosePlan: 'Elige el plan que mejor se adapte a tus necesidades',
      monthly: 'Mensual',
      yearly: 'Anual',
      saveUpTo: 'Ahorra hasta 30%',
      alphaAccess: 'Alpha Access',
      alphaPro: 'Alpha Pro',
      mostPopular: 'MÁS POPULAR',
      perMonth: '/mes USDC',
      perYear: '/año USDC',
      monthlyEquiv: '/mes equivalente',
      save20: 'Ahorra 20%',
      save30: 'Ahorra 30%',
      select: 'Seleccionar',
      freeContent: 'Contenido gratuito: Articles, Market Indices, Educación básica',
      changePlan: '← Cambiar plan',
      selectPayment: 'Selecciona método de pago:',
      changePayment: '← Cambiar método de pago',
      sendPayment: 'Envía el pago vía',
      sendExactly: 'Envía exactamente',
      to: 'a:',
      ensureNetwork: 'Asegúrate de enviar en la red',
      only: 'únicamente',
      paymentSent: 'Ya envié el pago',
      confirmEmail: 'Confirma tu email',
      emailDesc: 'Ingresa tu email para recibir la confirmación de acceso premium.',
      email: 'Email *',
      txHashOptional: 'Hash de transacción (Opcional)',
      txHashPlaceholder: '0x... o firma de transacción',
      submitPayment: 'Enviar pago',
      sending: 'Enviando...',
      success: '¡Pago enviado!',
      successDesc: 'Tu pago está pendiente de verificación. Recibirás un email en',
      whenActivated: 'cuando tu membresía esté activada.',
      normalTime: 'Esto normalmente toma 24-48 horas.',
      close: 'Cerrar',
      copied: 'Dirección copiada al portapapeles!',
      errorEmail: 'Por favor ingresa un email válido',
      errorSubmit: 'Error al enviar el pago. Intenta de nuevo.',
      // Features
      alphaFeatures: [
        'Airdrops con guías detalladas',
        'Portfolio tracking',
        'Early Signals y alertas',
        'Análisis de mercado premium',
      ],
      proFeatures: [
        'Todo en Alpha Access',
        'Consultoría personal y empresarial',
        'Soporte prioritario',
        'Research exclusivo',
        'Llamadas mensuales de estrategia',
      ],
    },
    en: {
      premiumPlans: 'Premium Plans',
      choosePlan: 'Choose the plan that best fits your needs',
      monthly: 'Monthly',
      yearly: 'Yearly',
      saveUpTo: 'Save up to 30%',
      alphaAccess: 'Alpha Access',
      alphaPro: 'Alpha Pro',
      mostPopular: 'MOST POPULAR',
      perMonth: '/month USDC',
      perYear: '/year USDC',
      monthlyEquiv: '/month equivalent',
      save20: 'Save 20%',
      save30: 'Save 30%',
      select: 'Select',
      freeContent: 'Free content: Articles, Market Indices, Basic education',
      changePlan: '← Change plan',
      selectPayment: 'Select payment method:',
      changePayment: '← Change payment method',
      sendPayment: 'Send payment via',
      sendExactly: 'Send exactly',
      to: 'to:',
      ensureNetwork: 'Make sure to send on the',
      only: 'network only',
      paymentSent: 'I sent the payment',
      confirmEmail: 'Confirm your email',
      emailDesc: 'Enter your email to receive premium access confirmation.',
      email: 'Email *',
      txHashOptional: 'Transaction hash (Optional)',
      txHashPlaceholder: '0x... or transaction signature',
      submitPayment: 'Submit payment',
      sending: 'Sending...',
      success: 'Payment sent!',
      successDesc: 'Your payment is pending verification. You will receive an email at',
      whenActivated: 'when your membership is activated.',
      normalTime: 'This normally takes 24-48 hours.',
      close: 'Close',
      copied: 'Address copied to clipboard!',
      errorEmail: 'Please enter a valid email',
      errorSubmit: 'Error submitting payment. Please try again.',
      // Features
      alphaFeatures: [
        'Airdrops with detailed guides',
        'Portfolio tracking',
        'Early Signals and alerts',
        'Premium market analysis',
      ],
      proFeatures: [
        'Everything in Alpha Access',
        'Personal and business consulting',
        'Priority support',
        'Exclusive research',
        'Monthly strategy calls',
      ],
    }
  }[language];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setStep('tier');
      setSelectedTier(null);
      setSelectedChain(null);
      setBillingCycle('monthly');
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

  const getPaymentAddress = () => {
    if (selectedChain === 'solana') return SOLANA_WALLET;
    return EVM_WALLET;
  };

  const getTierPrice = () => {
    if (!selectedTier) return 0;
    return PRICING[selectedTier][billingCycle].price;
  };

  const generateQR = async () => {
    try {
      const address = getPaymentAddress();
      const qr = await QRCode.toDataURL(address, {
        width: 256,
        margin: 2,
        color: {
          dark: selectedTier === 'pro' ? '#f59e0b' : '#10b981',
          light: '#ffffff'
        }
      });
      setQrCode(qr);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const copyAddress = () => {
    const address = getPaymentAddress();
    navigator.clipboard.writeText(address);
    toast.success(tx.copied);
  };

  const handleSubmitPayment = async () => {
    if (!email || !email.includes('@')) {
      toast.error(tx.errorEmail);
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/payments/submit`, {
        email,
        wallet_address: getPaymentAddress(),
        chain: selectedChain,
        tx_hash: txHash || null,
        amount: getTierPrice(),
        tier: selectedTier,
        billing_cycle: billingCycle
      });

      setStep('success');
      toast.success(language === 'es' ? 'Pago enviado exitosamente!' : 'Payment sent successfully!');
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error(tx.errorSubmit);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isProTier = selectedTier === 'pro';

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4" 
      data-testid="premium-modal"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Sparkles className="text-emerald-500" size={28} />
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {step === 'tier' ? tx.premiumPlans : (isProTier ? tx.alphaPro : tx.alphaAccess)}
            </h2>
          </div>
          <button data-testid="close-modal-btn" onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="text-gray-400" size={24} />
          </button>
        </div>

        <div className="p-6">
          {step === 'tier' && (
            <div className="space-y-6">
              <p className="text-gray-400 text-center mb-4">{tx.choosePlan}</p>
              
              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-500'}`}>{tx.monthly}</span>
                <button
                  onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                  data-testid="billing-toggle"
                  className={`relative w-14 h-7 rounded-full transition-all ${billingCycle === 'yearly' ? 'bg-emerald-500' : 'bg-gray-700'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${billingCycle === 'yearly' ? 'left-8' : 'left-1'}`} />
                </button>
                <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-500'}`}>{tx.yearly}</span>
                {billingCycle === 'yearly' && (
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-full">{tx.saveUpTo}</span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Alpha Access */}
                <div
                  className="rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 hover:border-emerald-500 cursor-pointer transition-all hover:scale-[1.02]"
                  onClick={() => { setSelectedTier('alpha'); setStep('select'); }}
                  data-testid="tier-alpha"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-emerald-500/20">
                        <Zap className="text-emerald-500" size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-white">{tx.alphaAccess}</h3>
                    </div>
                    <div className="mb-2">
                      {billingCycle === 'monthly' ? (
                        <>
                          <span className="text-4xl font-black text-white">$30</span>
                          <span className="text-gray-400">{tx.perMonth}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-4xl font-black text-white">$300</span>
                          <span className="text-gray-400">{tx.perYear}</span>
                        </>
                      )}
                    </div>
                    {billingCycle === 'yearly' && (
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm text-gray-400">$25{tx.monthlyEquiv}</span>
                        <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">{tx.save20}</span>
                      </div>
                    )}
                    {billingCycle === 'monthly' && <div className="h-6 mb-4" />}
                    <ul className="space-y-3 mb-6">
                      {tx.alphaFeatures.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3"><Check className="text-emerald-500 flex-shrink-0 mt-0.5" size={16} /><span className="text-gray-300 text-sm">{feature}</span></li>
                      ))}
                    </ul>
                    <button className="w-full py-3 px-4 rounded-lg font-bold bg-emerald-500 hover:bg-emerald-400 text-white transition-all">
                      {tx.select}
                    </button>
                  </div>
                </div>

                {/* Alpha Pro */}
                <div
                  className="relative rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-orange-500/5 hover:border-amber-500 cursor-pointer transition-all hover:scale-[1.02]"
                  onClick={() => { setSelectedTier('pro'); setStep('select'); }}
                  data-testid="tier-pro"
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-xs font-bold px-4 py-1 rounded-full">{tx.mostPopular}</div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-amber-500/20">
                        <Crown className="text-amber-500" size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-white">{tx.alphaPro}</h3>
                    </div>
                    <div className="mb-2">
                      {billingCycle === 'monthly' ? (
                        <>
                          <span className="text-4xl font-black text-white">$100</span>
                          <span className="text-gray-400">{tx.perMonth}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-4xl font-black text-white">$840</span>
                          <span className="text-gray-400">{tx.perYear}</span>
                        </>
                      )}
                    </div>
                    {billingCycle === 'yearly' && (
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm text-gray-400">$70{tx.monthlyEquiv}</span>
                        <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full">{tx.save30}</span>
                      </div>
                    )}
                    {billingCycle === 'monthly' && <div className="h-6 mb-4" />}
                    <ul className="space-y-3 mb-6">
                      {tx.proFeatures.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3"><Check className="text-amber-500 flex-shrink-0 mt-0.5" size={16} /><span className="text-gray-300 text-sm">{feature}</span></li>
                      ))}
                    </ul>
                    <button className="w-full py-3 px-4 rounded-lg font-bold bg-amber-500 hover:bg-amber-400 text-black transition-all">
                      {tx.select}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-500 mt-6">
                <p>{tx.freeContent}</p>
              </div>
            </div>
          )}

          {step === 'select' && (
            <div className="space-y-4">
              <button onClick={() => setStep('tier')} className="text-gray-400 hover:text-emerald-500 text-sm transition-colors mb-4">
                {tx.changePlan}
              </button>
              
              <div className={`text-center py-4 rounded-xl border ${isProTier ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                <div className="text-3xl font-black text-white mb-1">
                  ${getTierPrice()}<span className="text-xl text-gray-400">/{billingCycle === 'monthly' ? (language === 'es' ? 'mes' : 'month') : (language === 'es' ? 'año' : 'year')}</span>
                </div>
                <p className={isProTier ? 'text-amber-500 font-medium' : 'text-emerald-500 font-medium'}>
                  {isProTier ? tx.alphaPro : tx.alphaAccess} - {billingCycle === 'monthly' ? tx.monthly : tx.yearly}
                </p>
              </div>
              
              <h3 className="text-lg font-bold text-white mt-6">{tx.selectPayment}</h3>
              
              <button onClick={() => { setSelectedChain('solana'); setStep('payment'); }} data-testid="chain-solana" className="w-full p-5 bg-gray-800/50 border border-gray-700 rounded-xl transition-all duration-300 flex items-center justify-between group hover:bg-emerald-500/10 hover:border-emerald-500/50">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">◎</span>
                  <div className="text-left">
                    <div className="text-white font-bold">Solana (USDC-SPL)</div>
                    <div className="text-sm text-gray-400">Solana • USDC-SPL</div>
                  </div>
                </div>
                <Wallet className="text-emerald-500 group-hover:scale-110 transition-transform" size={24} />
              </button>

              <button onClick={() => { setSelectedChain('base'); setStep('payment'); }} data-testid="chain-base" className="w-full p-5 bg-gray-800/50 border border-gray-700 rounded-xl transition-all duration-300 flex items-center justify-between group hover:bg-emerald-500/10 hover:border-emerald-500/50">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">🔵</span>
                  <div className="text-left">
                    <div className="text-white font-bold">Base (USDC)</div>
                    <div className="text-sm text-gray-400">Base • USDC</div>
                  </div>
                </div>
                <Wallet className="text-emerald-500 group-hover:scale-110 transition-transform" size={24} />
              </button>

              <button onClick={() => { setSelectedChain('arbitrum'); setStep('payment'); }} data-testid="chain-arbitrum" className="w-full p-5 bg-gray-800/50 border border-gray-700 rounded-xl transition-all duration-300 flex items-center justify-between group hover:bg-emerald-500/10 hover:border-emerald-500/50">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">🔷</span>
                  <div className="text-left">
                    <div className="text-white font-bold">Arbitrum (USDC)</div>
                    <div className="text-sm text-gray-400">Arbitrum • USDC</div>
                  </div>
                </div>
                <Wallet className="text-emerald-500 group-hover:scale-110 transition-transform" size={24} />
              </button>
            </div>
          )}

          {step === 'payment' && selectedChain && (
            <div className="space-y-6">
              <button onClick={() => setStep('select')} className="text-gray-400 hover:text-emerald-500 text-sm transition-colors">
                {tx.changePayment}
              </button>

              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-4">
                  {tx.sendPayment} {selectedChain === 'solana' ? 'Solana' : selectedChain === 'base' ? 'Base' : 'Arbitrum'}
                </h3>
                
                <div className="flex justify-center mb-6">
                  {qrCode && (
                    <img src={qrCode} alt="Payment QR Code" className={`w-56 h-56 rounded-xl border-4 ${isProTier ? 'border-amber-500/30' : 'border-emerald-500/30'}`} />
                  )}
                </div>

                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-4">
                  <div className="text-sm text-gray-400 mb-2">
                    {tx.sendExactly} <strong className="text-white">${getTierPrice()} USDC</strong> {tx.to}
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <code className={`${isProTier ? 'text-amber-400' : 'text-emerald-400'} text-sm break-all`}>
                      {getPaymentAddress()}
                    </code>
                    <button onClick={copyAddress} className="p-2 hover:bg-gray-700 rounded-lg transition-colors" title="Copy address">
                      <Copy size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-6">
                  {tx.ensureNetwork} {selectedChain === 'solana' ? 'Solana' : selectedChain === 'base' ? 'Base' : 'Arbitrum'} {tx.only}
                </div>

                <button onClick={() => setStep('email')} data-testid="payment-sent-btn" className={`w-full font-bold py-4 px-6 rounded-lg transition-all duration-300 hover:scale-102 ${isProTier ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_30px_rgba(245,158,11,0.4)]' : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)]'}`}>
                  {tx.paymentSent}
                </button>
              </div>
            </div>
          )}

          {step === 'email' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">{tx.confirmEmail}</h3>
              <p className="text-gray-400 text-sm mb-6">
                {tx.emailDesc}
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">{tx.email}</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" data-testid="email-input" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">{tx.txHashOptional}</label>
                  <input type="text" value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder={tx.txHashPlaceholder} data-testid="tx-hash-input" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
                </div>

                <button onClick={handleSubmitPayment} disabled={loading} data-testid="submit-payment-btn" className={`w-full font-bold py-4 px-6 rounded-lg transition-all duration-300 hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed ${isProTier ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-emerald-500 hover:bg-emerald-400 text-white'}`}>
                  {loading ? tx.sending : tx.submitPayment}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isProTier ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}>
                <Check className={isProTier ? 'text-amber-500' : 'text-emerald-500'} size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{tx.success}</h3>
              <p className="text-gray-400 mb-6">
                {tx.successDesc} <strong className="text-white">{email}</strong> {tx.whenActivated}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                {tx.normalTime}
              </p>
              <button onClick={onClose} className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                {tx.close}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
