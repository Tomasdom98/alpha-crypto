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
  alpha: { monthly: { price: 30 }, yearly: { price: 300, monthlyEquiv: 25, discount: 20 } },
  pro: { monthly: { price: 100 }, yearly: { price: 840, monthlyEquiv: 70, discount: 30 } }
};

const TX_ES = {
  premiumPlans: 'Planes Premium', choosePlan: 'Elige el plan que mejor se adapte', monthly: 'Mensual', yearly: 'Anual',
  saveUpTo: 'Ahorra 30%', alphaAccess: 'Alpha Access', alphaPro: 'Alpha Pro', mostPopular: 'MÁS POPULAR',
  perMonth: '/mes USDC', perYear: '/año USDC', monthlyEquiv: '/mes equiv.', save20: 'Ahorra 20%', save30: 'Ahorra 30%',
  select: 'Seleccionar', freeContent: 'Contenido gratuito incluido', changePlan: '← Cambiar plan',
  selectPayment: 'Método de pago:', changePayment: '← Cambiar método', sendPayment: 'Pago vía',
  sendExactly: 'Envía exactamente', to: 'a:', ensureNetwork: 'En red', only: 'únicamente', paymentSent: 'Ya envié el pago',
  confirmEmail: 'Confirma tu email', emailDesc: 'Email para confirmación premium', email: 'Email *',
  txHashOptional: 'Hash (Opcional)', txHashPlaceholder: '0x...', submitPayment: 'Enviar', sending: 'Enviando...',
  success: '¡Pago enviado!', successDesc: 'Pendiente de verificación', whenActivated: 'cuando esté activo',
  normalTime: '24-48 horas', close: 'Cerrar', copied: 'Copiado!', errorEmail: 'Email inválido', errorSubmit: 'Error',
  month: 'mes', year: 'año',
  alphaF: ['Airdrops detallados', 'Portfolio tracking', 'Early Signals', 'Análisis premium'],
  proF: ['Todo en Alpha', 'Consultoría', 'Soporte prioritario', 'Research exclusivo', 'Llamadas mensuales']
};

const TX_EN = {
  premiumPlans: 'Premium Plans', choosePlan: 'Choose the best plan', monthly: 'Monthly', yearly: 'Yearly',
  saveUpTo: 'Save 30%', alphaAccess: 'Alpha Access', alphaPro: 'Alpha Pro', mostPopular: 'MOST POPULAR',
  perMonth: '/mo USDC', perYear: '/yr USDC', monthlyEquiv: '/mo equiv.', save20: 'Save 20%', save30: 'Save 30%',
  select: 'Select', freeContent: 'Free content included', changePlan: '← Change plan',
  selectPayment: 'Payment method:', changePayment: '← Change method', sendPayment: 'Pay via',
  sendExactly: 'Send exactly', to: 'to:', ensureNetwork: 'On', only: 'network only', paymentSent: 'I sent the payment',
  confirmEmail: 'Confirm email', emailDesc: 'Email for premium confirmation', email: 'Email *',
  txHashOptional: 'Hash (Optional)', txHashPlaceholder: '0x...', submitPayment: 'Submit', sending: 'Sending...',
  success: 'Payment sent!', successDesc: 'Pending verification', whenActivated: 'when activated',
  normalTime: '24-48 hours', close: 'Close', copied: 'Copied!', errorEmail: 'Invalid email', errorSubmit: 'Error',
  month: 'month', year: 'year',
  alphaF: ['Detailed airdrops', 'Portfolio tracking', 'Early Signals', 'Premium analysis'],
  proF: ['All in Alpha', 'Consulting', 'Priority support', 'Exclusive research', 'Monthly calls']
};

function TierCard({ tier, tx, billingCycle, onClick, isProTier }) {
  const price = PRICING[tier][billingCycle].price;
  const features = isProTier ? tx.proF : tx.alphaF;
  const color = isProTier ? 'amber' : 'emerald';
  return (
    <div onClick={onClick} className={`rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${isProTier ? 'border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-orange-500/5' : 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-teal-500/5'}`}>
      {isProTier && <div className="text-center -mt-3"><span className="bg-amber-500 text-black text-xs font-bold px-4 py-1 rounded-full">{tx.mostPopular}</span></div>}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-xl bg-${color}-500/20`}>{isProTier ? <Crown className={`text-${color}-500`} size={24}/> : <Zap className={`text-${color}-500`} size={24}/>}</div>
          <h3 className="text-xl font-bold text-white">{isProTier ? tx.alphaPro : tx.alphaAccess}</h3>
        </div>
        <div className="mb-2">
          <span className="text-4xl font-black text-white">${price}</span>
          <span className="text-gray-400">{billingCycle === 'monthly' ? tx.perMonth : tx.perYear}</span>
        </div>
        {billingCycle === 'yearly' && <div className="flex items-center gap-2 mb-4"><span className="text-sm text-gray-400">${PRICING[tier].yearly.monthlyEquiv}{tx.monthlyEquiv}</span><span className={`bg-${color}-500/20 text-${color}-400 text-xs font-bold px-2 py-0.5 rounded-full`}>{isProTier ? tx.save30 : tx.save20}</span></div>}
        {billingCycle === 'monthly' && <div className="h-6 mb-4"/>}
        <ul className="space-y-3 mb-6">{features.map((f, i) => <li key={i} className="flex items-start gap-3"><Check className={`text-${color}-500 flex-shrink-0 mt-0.5`} size={16}/><span className="text-gray-300 text-sm">{f}</span></li>)}</ul>
        <button className={`w-full py-3 px-4 rounded-lg font-bold ${isProTier ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-emerald-500 hover:bg-emerald-400 text-white'}`}>{tx.select}</button>
      </div>
    </div>
  );
}

function ChainButton({ chain, name, symbol, onClick }) {
  return (
    <button onClick={onClick} className="w-full p-5 bg-gray-800/50 border border-gray-700 rounded-xl flex items-center justify-between group hover:bg-emerald-500/10 hover:border-emerald-500/50">
      <div className="flex items-center gap-4"><span className="text-3xl">{symbol}</span><div className="text-left"><div className="text-white font-bold">{name}</div><div className="text-sm text-gray-400">{chain} • USDC</div></div></div>
      <Wallet className="text-emerald-500 group-hover:scale-110" size={24}/>
    </button>
  );
}

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
  const tx = language === 'en' ? TX_EN : TX_ES;
  const isProTier = selectedTier === 'pro';

  useEffect(() => { if (selectedChain) generateQR(); }, [selectedChain, selectedTier]);

  const getPaymentAddress = () => selectedChain === 'solana' ? SOLANA_WALLET : EVM_WALLET;
  const getTierPrice = () => selectedTier ? PRICING[selectedTier][billingCycle].price : 0;

  const generateQR = async () => {
    try {
      const qr = await QRCode.toDataURL(getPaymentAddress(), { width: 256, margin: 2, color: { dark: selectedTier === 'pro' ? '#f59e0b' : '#10b981', light: '#fff' } });
      setQrCode(qr);
    } catch (e) { console.error(e); }
  };

  const copyAddress = () => { navigator.clipboard.writeText(getPaymentAddress()); toast.success(tx.copied); };

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) { toast.error(tx.errorEmail); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/payments/submit`, { email, wallet_address: getPaymentAddress(), chain: selectedChain, tx_hash: txHash || null, amount: getTierPrice(), tier: selectedTier, billing_cycle: billingCycle });
      setStep('success'); toast.success(tx.success);
    } catch (e) { toast.error(tx.errorSubmit); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3"><Sparkles className="text-emerald-500" size={28}/><h2 className="text-2xl font-bold text-white">{step === 'tier' ? tx.premiumPlans : (isProTier ? tx.alphaPro : tx.alphaAccess)}</h2></div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg"><X className="text-gray-400" size={24}/></button>
        </div>
        <div className="p-6">
          {step === 'tier' && (
            <div className="space-y-6">
              <p className="text-gray-400 text-center mb-4">{tx.choosePlan}</p>
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className={billingCycle === 'monthly' ? 'text-white text-sm font-medium' : 'text-gray-500 text-sm font-medium'}>{tx.monthly}</span>
                <button onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')} className={`relative w-14 h-7 rounded-full ${billingCycle === 'yearly' ? 'bg-emerald-500' : 'bg-gray-700'}`}>
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full ${billingCycle === 'yearly' ? 'left-8' : 'left-1'}`}/>
                </button>
                <span className={billingCycle === 'yearly' ? 'text-white text-sm font-medium' : 'text-gray-500 text-sm font-medium'}>{tx.yearly}</span>
                {billingCycle === 'yearly' && <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2 py-1 rounded-full">{tx.saveUpTo}</span>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TierCard tier="alpha" tx={tx} billingCycle={billingCycle} onClick={() => { setSelectedTier('alpha'); setStep('select'); }} isProTier={false}/>
                <TierCard tier="pro" tx={tx} billingCycle={billingCycle} onClick={() => { setSelectedTier('pro'); setStep('select'); }} isProTier={true}/>
              </div>
              <p className="text-center text-sm text-gray-500 mt-6">{tx.freeContent}</p>
            </div>
          )}
          {step === 'select' && (
            <div className="space-y-4">
              <button onClick={() => setStep('tier')} className="text-gray-400 hover:text-emerald-500 text-sm mb-4">{tx.changePlan}</button>
              <div className={`text-center py-4 rounded-xl border ${isProTier ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                <div className="text-3xl font-black text-white mb-1">${getTierPrice()}<span className="text-xl text-gray-400">/{billingCycle === 'monthly' ? tx.month : tx.year}</span></div>
                <p className={isProTier ? 'text-amber-500 font-medium' : 'text-emerald-500 font-medium'}>{isProTier ? tx.alphaPro : tx.alphaAccess} - {billingCycle === 'monthly' ? tx.monthly : tx.yearly}</p>
              </div>
              <h3 className="text-lg font-bold text-white mt-6">{tx.selectPayment}</h3>
              <ChainButton chain="Solana" name="Solana (USDC-SPL)" symbol="◎" onClick={() => { setSelectedChain('solana'); setStep('payment'); }}/>
              <ChainButton chain="Base" name="Base (USDC)" symbol="🔵" onClick={() => { setSelectedChain('base'); setStep('payment'); }}/>
              <ChainButton chain="Arbitrum" name="Arbitrum (USDC)" symbol="🔷" onClick={() => { setSelectedChain('arbitrum'); setStep('payment'); }}/>
            </div>
          )}
          {step === 'payment' && selectedChain && (
            <div className="space-y-6">
              <button onClick={() => setStep('select')} className="text-gray-400 hover:text-emerald-500 text-sm">{tx.changePayment}</button>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-4">{tx.sendPayment} {selectedChain}</h3>
                {qrCode && <div className="flex justify-center mb-6"><img src={qrCode} alt="QR" className={`w-56 h-56 rounded-xl border-4 ${isProTier ? 'border-amber-500/30' : 'border-emerald-500/30'}`}/></div>}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-4">
                  <div className="text-sm text-gray-400 mb-2">{tx.sendExactly} <strong className="text-white">${getTierPrice()} USDC</strong> {tx.to}</div>
                  <div className="flex items-center gap-2 justify-center">
                    <code className={isProTier ? 'text-amber-400 text-sm break-all' : 'text-emerald-400 text-sm break-all'}>{getPaymentAddress()}</code>
                    <button onClick={copyAddress} className="p-2 hover:bg-gray-700 rounded-lg"><Copy size={16} className="text-gray-400"/></button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-6">{tx.ensureNetwork} {selectedChain} {tx.only}</div>
                <button onClick={() => setStep('email')} className={`w-full font-bold py-4 px-6 rounded-lg ${isProTier ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-emerald-500 hover:bg-emerald-400 text-white'}`}>{tx.paymentSent}</button>
              </div>
            </div>
          )}
          {step === 'email' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">{tx.confirmEmail}</h3>
              <p className="text-gray-400 text-sm mb-6">{tx.emailDesc}</p>
              <div className="space-y-4">
                <div><label className="text-sm text-gray-400 mb-2 block">{tx.email}</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"/></div>
                <div><label className="text-sm text-gray-400 mb-2 block">{tx.txHashOptional}</label><input type="text" value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder={tx.txHashPlaceholder} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"/></div>
                <button onClick={handleSubmit} disabled={loading} className={`w-full font-bold py-4 px-6 rounded-lg disabled:opacity-50 ${isProTier ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-emerald-500 hover:bg-emerald-400 text-white'}`}>{loading ? tx.sending : tx.submitPayment}</button>
              </div>
            </div>
          )}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isProTier ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}><Check className={isProTier ? 'text-amber-500' : 'text-emerald-500'} size={40}/></div>
              <h3 className="text-2xl font-bold text-white mb-4">{tx.success}</h3>
              <p className="text-gray-400 mb-6">{tx.successDesc} <strong className="text-white">{email}</strong> {tx.whenActivated}</p>
              <p className="text-sm text-gray-500 mb-6">{tx.normalTime}</p>
              <button onClick={onClose} className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg">{tx.close}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
