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

const PRICING = {
  alpha: { monthly: 30, yearly: 252 },  // 30% discount: 30*12*0.7 = 252
  pro: { monthly: 100, yearly: 840 }    // 30% discount: 100*12*0.7 = 840
};

const ALPHA_FEATURES_ES = ['Airdrops detallados', 'Portfolio tracking', 'Early Signals', 'Análisis premium'];
const PRO_FEATURES_ES = ['Todo en Alpha', 'Consultoría', 'Soporte prioritario', 'Research exclusivo', 'Llamadas mensuales'];
const ALPHA_FEATURES_EN = ['Detailed airdrops', 'Portfolio tracking', 'Early Signals', 'Premium analysis'];
const PRO_FEATURES_EN = ['All in Alpha', 'Consulting', 'Priority support', 'Exclusive research', 'Monthly calls'];

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
  
  const isEs = language === 'es';
  const isProTier = selectedTier === 'pro';
  const alphaFeatures = isEs ? ALPHA_FEATURES_ES : ALPHA_FEATURES_EN;
  const proFeatures = isEs ? PRO_FEATURES_ES : PRO_FEATURES_EN;

  useEffect(() => {
    if (selectedChain) generateQR();
  }, [selectedChain, selectedTier]);

  const getPaymentAddress = () => selectedChain === 'solana' ? SOLANA_WALLET : EVM_WALLET;
  const getTierPrice = () => selectedTier ? PRICING[selectedTier][billingCycle] : 0;

  const generateQR = async () => {
    try {
      const qr = await QRCode.toDataURL(getPaymentAddress(), { width: 256, margin: 2 });
      setQrCode(qr);
    } catch (e) { console.error(e); }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(getPaymentAddress());
    toast.success(isEs ? 'Copiado!' : 'Copied!');
  };

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      toast.error(isEs ? 'Email inválido' : 'Invalid email');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/payments/submit`, {
        email, wallet_address: getPaymentAddress(), chain: selectedChain,
        tx_hash: txHash || null, amount: getTierPrice(), tier: selectedTier, billing_cycle: billingCycle
      });
      setStep('success');
      toast.success(isEs ? 'Enviado!' : 'Sent!');
    } catch (e) {
      toast.error(isEs ? 'Error' : 'Error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Sparkles className="text-emerald-500" size={28} />
            <h2 className="text-2xl font-bold text-white">
              {step === 'tier' ? (isEs ? 'Planes Premium' : 'Premium Plans') : (isProTier ? 'Alpha Pro' : 'Alpha Access')}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg">
            <X className="text-gray-400" size={24} />
          </button>
        </div>

        <div className="p-6">
          {step === 'tier' && (
            <div className="space-y-6">
              <p className="text-gray-400 text-center mb-4">{isEs ? 'Elige el plan que mejor se adapte' : 'Choose the best plan'}</p>
              
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className={billingCycle === 'monthly' ? 'text-white text-sm font-medium' : 'text-gray-500 text-sm font-medium'}>
                  {isEs ? 'Mensual' : 'Monthly'}
                </span>
                <button
                  onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                  className={`relative w-14 h-7 rounded-full ${billingCycle === 'yearly' ? 'bg-emerald-500' : 'bg-gray-700'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full ${billingCycle === 'yearly' ? 'left-8' : 'left-1'}`} />
                </button>
                <span className={billingCycle === 'yearly' ? 'text-white text-sm font-medium' : 'text-gray-500 text-sm font-medium'}>
                  {isEs ? 'Anual' : 'Yearly'}
                </span>
                {billingCycle === 'yearly' && (
                  <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-full">
                    {isEs ? 'Ahorra 30%' : 'Save 30%'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  onClick={() => { setSelectedTier('alpha'); setStep('select'); }}
                  className="rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 cursor-pointer hover:border-emerald-500 hover:scale-[1.02] transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-emerald-500/20">
                        <Zap className="text-emerald-500" size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-white">Alpha Access</h3>
                    </div>
                    <div className="mb-4">
                      <span className="text-4xl font-black text-white">${PRICING.alpha[billingCycle]}</span>
                      <span className="text-gray-400">{billingCycle === 'monthly' ? (isEs ? '/mes' : '/mo') : (isEs ? '/año' : '/yr')} USDC</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {alphaFeatures.map((f, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="text-emerald-500 flex-shrink-0 mt-0.5" size={16} />
                          <span className="text-gray-300 text-sm">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button className="w-full py-3 px-4 rounded-lg font-bold bg-emerald-500 hover:bg-emerald-400 text-white">
                      {isEs ? 'Seleccionar' : 'Select'}
                    </button>
                  </div>
                </div>

                <div
                  onClick={() => { setSelectedTier('pro'); setStep('select'); }}
                  className="relative rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-orange-500/5 cursor-pointer hover:border-amber-500 hover:scale-[1.02] transition-all"
                >
                  <div className="text-center -mt-3">
                    <span className="bg-amber-500 text-black text-xs font-bold px-4 py-1 rounded-full">
                      {isEs ? 'MÁS POPULAR' : 'MOST POPULAR'}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-amber-500/20">
                        <Crown className="text-amber-500" size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-white">Alpha Pro</h3>
                    </div>
                    <div className="mb-4">
                      <span className="text-4xl font-black text-white">${PRICING.pro[billingCycle]}</span>
                      <span className="text-gray-400">{billingCycle === 'monthly' ? (isEs ? '/mes' : '/mo') : (isEs ? '/año' : '/yr')} USDC</span>
                    </div>
                    <ul className="space-y-3 mb-6">
                      {proFeatures.map((f, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="text-amber-500 flex-shrink-0 mt-0.5" size={16} />
                          <span className="text-gray-300 text-sm">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <button className="w-full py-3 px-4 rounded-lg font-bold bg-amber-500 hover:bg-amber-400 text-black">
                      {isEs ? 'Seleccionar' : 'Select'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'select' && (
            <div className="space-y-4">
              <button onClick={() => setStep('tier')} className="text-gray-400 hover:text-emerald-500 text-sm mb-4">
                {isEs ? '← Cambiar plan' : '← Change plan'}
              </button>
              <div className={`text-center py-4 rounded-xl border ${isProTier ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                <div className="text-3xl font-black text-white mb-1">
                  ${getTierPrice()}<span className="text-xl text-gray-400">/{billingCycle === 'monthly' ? (isEs ? 'mes' : 'mo') : (isEs ? 'año' : 'yr')}</span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mt-6">{isEs ? 'Método de pago:' : 'Payment method:'}</h3>
              
              <button onClick={() => { setSelectedChain('solana'); setStep('payment'); }} className="w-full p-5 bg-gray-800/50 border border-gray-700 rounded-xl flex items-center justify-between group hover:bg-emerald-500/10 hover:border-emerald-500/50">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">◎</span>
                  <div className="text-left">
                    <div className="text-white font-bold">Solana (USDC-SPL)</div>
                  </div>
                </div>
                <Wallet className="text-emerald-500" size={24} />
              </button>

              <button onClick={() => { setSelectedChain('base'); setStep('payment'); }} className="w-full p-5 bg-gray-800/50 border border-gray-700 rounded-xl flex items-center justify-between group hover:bg-emerald-500/10 hover:border-emerald-500/50">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">🔵</span>
                  <div className="text-left">
                    <div className="text-white font-bold">Base (USDC)</div>
                  </div>
                </div>
                <Wallet className="text-emerald-500" size={24} />
              </button>

              <button onClick={() => { setSelectedChain('arbitrum'); setStep('payment'); }} className="w-full p-5 bg-gray-800/50 border border-gray-700 rounded-xl flex items-center justify-between group hover:bg-emerald-500/10 hover:border-emerald-500/50">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">🔷</span>
                  <div className="text-left">
                    <div className="text-white font-bold">Arbitrum (USDC)</div>
                  </div>
                </div>
                <Wallet className="text-emerald-500" size={24} />
              </button>
            </div>
          )}

          {step === 'payment' && selectedChain && (
            <div className="space-y-6">
              <button onClick={() => setStep('select')} className="text-gray-400 hover:text-emerald-500 text-sm">
                {isEs ? '← Cambiar método' : '← Change method'}
              </button>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-4">
                  {isEs ? 'Pago vía' : 'Pay via'} {selectedChain}
                </h3>
                {qrCode && (
                  <div className="flex justify-center mb-6">
                    <img src={qrCode} alt="QR" className={`w-56 h-56 rounded-xl border-4 ${isProTier ? 'border-amber-500/30' : 'border-emerald-500/30'}`} />
                  </div>
                )}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-4">
                  <div className="text-sm text-gray-400 mb-2">
                    {isEs ? 'Envía exactamente' : 'Send exactly'} <strong className="text-white">${getTierPrice()} USDC</strong>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <code className={isProTier ? 'text-amber-400 text-sm break-all' : 'text-emerald-400 text-sm break-all'}>
                      {getPaymentAddress()}
                    </code>
                    <button onClick={copyAddress} className="p-2 hover:bg-gray-700 rounded-lg">
                      <Copy size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>
                <button onClick={() => setStep('email')} className={`w-full font-bold py-4 px-6 rounded-lg ${isProTier ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-emerald-500 hover:bg-emerald-400 text-white'}`}>
                  {isEs ? 'Ya envié el pago' : 'I sent the payment'}
                </button>
              </div>
            </div>
          )}

          {step === 'email' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">{isEs ? 'Confirma tu email' : 'Confirm your email'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">{isEs ? 'Hash (Opcional)' : 'Hash (Optional)'}</label>
                  <input
                    type="text"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`w-full font-bold py-4 px-6 rounded-lg disabled:opacity-50 ${isProTier ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-emerald-500 hover:bg-emerald-400 text-white'}`}
                >
                  {loading ? (isEs ? 'Enviando...' : 'Sending...') : (isEs ? 'Enviar' : 'Submit')}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isProTier ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}>
                <Check className={isProTier ? 'text-amber-500' : 'text-emerald-500'} size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{isEs ? '¡Pago enviado!' : 'Payment sent!'}</h3>
              <p className="text-gray-400 mb-6">
                {isEs ? 'Pendiente de verificación. Te contactaremos en' : 'Pending verification. We will contact you at'}{' '}
                <strong className="text-white">{email}</strong>
              </p>
              <button onClick={onClose} className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg">
                {isEs ? 'Cerrar' : 'Close'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
