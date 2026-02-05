import { X, Check, Sparkles, Copy, Wallet, Crown, Zap } from 'lucide-react';
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

const TIERS = {
  alpha: {
    name: 'Alpha Access',
    price: 30,
    icon: Zap,
    color: 'emerald',
    features: [
      'Airdrops con guías detalladas',
      'Portfolio tracking',
      'Early Signals y alertas',
      'Análisis de mercado premium',
      'Indicadores avanzados'
    ]
  },
  pro: {
    name: 'Alpha Pro',
    price: 100,
    icon: Crown,
    color: 'amber',
    popular: true,
    features: [
      'Todo en Alpha Access',
      'Consultoría personal y empresarial',
      'Soporte prioritario',
      'Research exclusivo',
      'Acceso anticipado a oportunidades',
      'Llamadas mensuales de estrategia'
    ]
  }
};

export default function PremiumModal({ isOpen, onClose }) {
  const [step, setStep] = useState('tier'); // tier | select | payment | email | success
  const [selectedTier, setSelectedTier] = useState(null);
  const [selectedChain, setSelectedChain] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [email, setEmail] = useState('');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setStep('tier');
      setSelectedTier(null);
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
    const option = PAYMENT_OPTIONS[selectedChain];
    navigator.clipboard.writeText(option.address);
    toast.success('Dirección copiada al portapapeles!');
  };

  const handleTierSelect = (tier) => {
    setSelectedTier(tier);
    setStep('select');
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
      toast.error('Por favor ingresa un email válido');
      return;
    }

    setLoading(true);
    try {
      const option = PAYMENT_OPTIONS[selectedChain];
      const tier = TIERS[selectedTier];
      await axios.post(`${API}/payments/submit`, {
        email,
        wallet_address: option.address,
        chain: option.chain,
        tx_hash: txHash || null,
        amount: tier.price,
        tier: selectedTier
      });

      setStep('success');
      toast.success('Pago enviado exitosamente!');
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('Error al enviar el pago. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentTier = selectedTier ? TIERS[selectedTier] : null;
  const tierColor = currentTier?.color === 'amber' ? 'amber' : 'emerald';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="premium-modal">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Sparkles className={`text-${tierColor}-500`} size={28} />
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {step === 'tier' ? 'Planes Premium' : currentTier?.name}
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
        <div className="p-6">
          {/* Step: Select Tier */}
          {step === 'tier' && (
            <div className="space-y-6">
              <p className="text-gray-400 text-center mb-8">
                Elige el plan que mejor se adapte a tus necesidades de inversión
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(TIERS).map(([key, tier]) => {
                  const Icon = tier.icon;
                  const isAmber = tier.color === 'amber';
                  return (
                    <div
                      key={key}
                      className={`relative rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                        isAmber 
                          ? 'border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-orange-500/5 hover:border-amber-500' 
                          : 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 hover:border-emerald-500'
                      }`}
                      onClick={() => handleTierSelect(key)}
                      data-testid={`tier-${key}`}
                    >
                      {tier.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-xs font-bold px-4 py-1 rounded-full">
                          MÁS POPULAR
                        </div>
                      )}
                      
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-3 rounded-xl ${isAmber ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}>
                            <Icon className={isAmber ? 'text-amber-500' : 'text-emerald-500'} size={24} />
                          </div>
                          <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                        </div>
                        
                        <div className="mb-6">
                          <span className="text-4xl font-black text-white">${tier.price}</span>
                          <span className="text-gray-400">/mes USDC</span>
                        </div>
                        
                        <ul className="space-y-3 mb-6">
                          {tier.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <Check className={`${isAmber ? 'text-amber-500' : 'text-emerald-500'} flex-shrink-0 mt-0.5`} size={16} />
                              <span className="text-gray-300 text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        
                        <button
                          className={`w-full py-3 px-4 rounded-lg font-bold transition-all ${
                            isAmber 
                              ? 'bg-amber-500 hover:bg-amber-400 text-black' 
                              : 'bg-emerald-500 hover:bg-emerald-400 text-white'
                          }`}
                        >
                          Seleccionar {tier.name}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="text-center text-sm text-gray-500 mt-6">
                <p>✓ Contenido gratuito: Articles, Market Indices, Educación básica</p>
              </div>
            </div>
          )}

          {/* Step: Select Payment Chain */}
          {step === 'select' && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('tier')}
                className="text-gray-400 hover:text-emerald-500 text-sm transition-colors mb-4"
              >
                ← Cambiar plan
              </button>
              
              <div className={`text-center py-4 rounded-xl border ${
                tierColor === 'amber' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'
              }`}>
                <div className="text-3xl font-black text-white mb-1">
                  ${currentTier?.price}<span className="text-xl text-gray-400">/mes</span>
                </div>
                <p className={`${tierColor === 'amber' ? 'text-amber-500' : 'text-emerald-500'} font-medium`}>
                  {currentTier?.name}
                </p>
              </div>
              
              <h3 className="text-lg font-bold text-white mt-6">Selecciona método de pago:</h3>
              {Object.entries(PAYMENT_OPTIONS).map(([key, option]) => (
                <button
                  key={key}
                  onClick={() => handleChainSelect(key)}
                  data-testid={`chain-${key}`}
                  className={`w-full p-5 bg-gray-800/50 border border-gray-700 rounded-xl transition-all duration-300 flex items-center justify-between group ${
                    tierColor === 'amber' ? 'hover:bg-amber-500/10 hover:border-amber-500/50' : 'hover:bg-emerald-500/10 hover:border-emerald-500/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{option.icon}</span>
                    <div className="text-left">
                      <div className="text-white font-bold">{option.name}</div>
                      <div className="text-sm text-gray-400">{option.chain} • {option.token}</div>
                    </div>
                  </div>
                  <Wallet className={`${tierColor === 'amber' ? 'text-amber-500' : 'text-emerald-500'} group-hover:scale-110 transition-transform`} size={24} />
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
                ← Cambiar método de pago
              </button>

              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-4">
                  Envía el pago vía {PAYMENT_OPTIONS[selectedChain].chain}
                </h3>
                
                {/* QR Code */}
                <div className="flex justify-center mb-6">
                  {qrCode && (
                    <img src={qrCode} alt="Payment QR Code" className={`w-56 h-56 rounded-xl border-4 ${
                      tierColor === 'amber' ? 'border-amber-500/30' : 'border-emerald-500/30'
                    }`} />
                  )}
                </div>

                {/* Address */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-4">
                  <div className="text-sm text-gray-400 mb-2">
                    Envía exactamente <strong className="text-white">${currentTier?.price} {PAYMENT_OPTIONS[selectedChain].token}</strong> a:
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <code className={`${tierColor === 'amber' ? 'text-amber-400' : 'text-emerald-400'} text-sm break-all`}>
                      {PAYMENT_OPTIONS[selectedChain].address}
                    </code>
                    <button
                      onClick={copyAddress}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Copiar dirección"
                    >
                      <Copy size={16} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-6">
                  ⚠️ Asegúrate de enviar en la red {PAYMENT_OPTIONS[selectedChain].chain} únicamente
                </div>

                <button
                  onClick={handlePaymentSent}
                  data-testid="payment-sent-btn"
                  className={`w-full font-bold py-4 px-6 rounded-lg transition-all duration-300 hover:scale-102 ${
                    tierColor === 'amber' 
                      ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_30px_rgba(245,158,11,0.4)]' 
                      : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                  }`}
                >
                  Ya envié el pago
                </button>
              </div>
            </div>
          )}

          {/* Step: Email Collection */}
          {step === 'email' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">Confirma tu email</h3>
              <p className="text-gray-400 text-sm mb-6">
                Ingresa tu email para recibir la confirmación de acceso premium. Verificaremos tu pago y activaremos tu suscripción.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    data-testid="email-input"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Hash de transacción (Opcional)</label>
                  <input
                    type="text"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    placeholder="0x... o firma de transacción"
                    data-testid="tx-hash-input"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>

                <button
                  onClick={handleSubmitPayment}
                  disabled={loading}
                  data-testid="submit-payment-btn"
                  className={`w-full font-bold py-4 px-6 rounded-lg transition-all duration-300 hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed ${
                    tierColor === 'amber' 
                      ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_30px_rgba(245,158,11,0.4)]' 
                      : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                  }`}
                >
                  {loading ? 'Enviando...' : 'Enviar pago'}
                </button>
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                tierColor === 'amber' ? 'bg-amber-500/20' : 'bg-emerald-500/20'
              }`}>
                <Check className={tierColor === 'amber' ? 'text-amber-500' : 'text-emerald-500'} size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">¡Pago enviado!</h3>
              <p className="text-gray-400 mb-6">
                Tu pago está pendiente de verificación. Recibirás un email en <strong className="text-white">{email}</strong> cuando tu membresía {currentTier?.name} esté activada.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Esto normalmente toma 24-48 horas. Verificamos los pagos manualmente para garantizar seguridad.
              </p>
              <button
                onClick={onClose}
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
