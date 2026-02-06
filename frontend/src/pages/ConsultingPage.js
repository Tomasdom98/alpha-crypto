import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Briefcase, User, Building2, Mail, Send, CheckCircle, Loader2, Shield, Zap } from 'lucide-react';
import axios from 'axios';
import OwlSeal from '@/components/OwlSeal';
import { useLanguage } from '@/context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL + '/api';

function ConsultingPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '', service_type: 'personal' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { language } = useLanguage();

  const tx = {
    backHome: language === 'es' ? 'Volver al Inicio' : 'Back to Home',
    title: 'Crypto Consulting',
    subtitle: language === 'es' ? 'Asesoría experta para tu viaje crypto' : 'Expert guidance for your crypto journey',
    whyTitle: language === 'es' ? '¿Por qué Alpha Crypto Consulting?' : 'Why Alpha Crypto Consulting?',
    whyDesc: language === 'es' 
      ? 'Navega el complejo panorama crypto con confianza. Nuestro equipo combina años de experiencia en trading, análisis profundo del mercado y experiencia práctica en DeFi para ayudarte a tomar decisiones informadas.'
      : 'Navigate the complex crypto landscape with confidence. Our team combines years of trading experience, deep market analysis, and hands-on DeFi expertise to help you make informed decisions.',
    personalTitle: language === 'es' ? 'Consultoría Personal' : 'Personal Consulting',
    personalDesc: language === 'es' ? 'Asesoría individual para inversores' : 'One-on-one guidance for individual investors',
    personalFeatures: language === 'es' 
      ? 'Revisión de portfolio, Evaluación de riesgo, Estrategias de entrada/salida, Airdrop hunting, Estrategias DeFi'
      : 'Portfolio review, Risk assessment, Entry/exit strategies, Airdrop hunting, DeFi strategies',
    businessTitle: language === 'es' ? 'Consultoría Empresarial' : 'Business Consulting',
    businessDesc: language === 'es' ? 'Soluciones crypto estratégicas para empresas' : 'Strategic crypto solutions for companies',
    businessFeatures: language === 'es' 
      ? 'Gestión de tesorería, Pagos crypto, Diseño de tokenomics, Compliance, Capacitación de equipo'
      : 'Treasury management, Crypto payments, Tokenomics design, Compliance, Team training',
    contactTitle: language === 'es' ? 'Contáctanos' : 'Get in Touch',
    contactDesc: language === 'es' 
      ? 'Cuéntanos sobre tus necesidades y te responderemos en 24 horas.'
      : 'Tell us about your needs and we will get back to you within 24 hours.',
    nameLabel: language === 'es' ? 'Nombre *' : 'Name *',
    namePlaceholder: language === 'es' ? 'Tu nombre' : 'Your name',
    emailLabel: 'Email *',
    emailPlaceholder: language === 'es' ? 'tu@email.com' : 'your@email.com',
    companyLabel: language === 'es' ? 'Empresa (opcional)' : 'Company (optional)',
    companyPlaceholder: language === 'es' ? 'Nombre de tu empresa' : 'Your company name',
    messageLabel: language === 'es' ? 'Mensaje *' : 'Message *',
    messagePlaceholder: language === 'es' ? 'Cuéntanos sobre tus metas crypto...' : 'Tell us about your crypto goals...',
    selectedService: language === 'es' ? 'Servicio seleccionado: ' : 'Selected Service: ',
    sendBtn: language === 'es' ? 'Enviar Mensaje' : 'Send Message',
    sending: language === 'es' ? 'Enviando...' : 'Sending...',
    sentTitle: language === 'es' ? '¡Mensaje Enviado!' : 'Message Sent!',
    sentDesc: language === 'es' 
      ? 'Revisaremos tu solicitud y te contactaremos pronto.'
      : 'We will review your request and contact you soon.',
    sendAnother: language === 'es' ? 'Enviar otro mensaje' : 'Send another message',
    privacyTitle: language === 'es' ? 'Compromiso de Privacidad' : 'Privacy Commitment',
    privacyDesc: language === 'es' 
      ? 'Tu información se mantiene estrictamente confidencial. Nunca compartimos tus datos con terceros.'
      : 'Your information is kept strictly confidential. We never share your data with third parties.',
    errorRequired: language === 'es' ? 'Por favor completa todos los campos requeridos' : 'Please complete all required fields',
    errorSend: language === 'es' ? 'Error al enviar. Por favor intenta de nuevo.' : 'Error sending. Please try again.',
  };

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError(tx.errorRequired);
      return;
    }
    setSubmitting(true);
    setError('');
    axios.post(API + '/consulting', form)
      .then(function() {
        setSubmitted(true);
        setForm({ name: '', email: '', company: '', message: '', service_type: 'personal' });
      })
      .catch(function() { setError(tx.errorSend); })
      .finally(function() { setSubmitting(false); });
  }

  return (
    <div className="min-h-screen py-12 relative hero-gradient" data-testid="consulting-page">
      <div className="absolute inset-0 grid-background opacity-30" />
      <OwlSeal position="bottom-right" size="lg" opacity={0.6} className="fixed" />
      
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 mb-4 transition-all duration-300">
            <ChevronRight size={16} className="rotate-180" /> {tx.backHome}
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }} data-testid="consulting-heading">{tx.title}</h1>
          <p className="text-gray-500 text-lg">{tx.subtitle}</p>
        </div>

        <div className="glass-card rounded-2xl p-8 mb-10">
          <div className="flex items-start gap-5">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30"><Briefcase className="text-emerald-400" size={32} /></div>
            <div>
              <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{tx.whyTitle}</h2>
              <p className="text-gray-400 leading-relaxed">{tx.whyDesc}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <button type="button" onClick={function() { setForm(Object.assign({}, form, { service_type: 'personal' })); }} className={'glass-card rounded-2xl p-6 text-left transition-all duration-300 ' + (form.service_type === 'personal' ? 'border-2 border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10' : 'hover:border-white/20')} data-testid="service-personal">
            <div className="flex items-start gap-4 mb-4">
              <div className={'p-3 rounded-xl transition-colors ' + (form.service_type === 'personal' ? 'bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30' : 'bg-white/5')}><User className={form.service_type === 'personal' ? 'text-emerald-400' : 'text-gray-400'} size={24} /></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{tx.personalTitle}</h3>
                  {form.service_type === 'personal' && <CheckCircle className="text-emerald-400" size={20} />}
                </div>
                <p className="text-gray-400 text-sm">{tx.personalDesc}</p>
              </div>
            </div>
            <p className="text-sm text-gray-300"><Zap size={14} className="inline text-emerald-400 mr-1" />{tx.personalFeatures}</p>
          </button>

          <button type="button" onClick={function() { setForm(Object.assign({}, form, { service_type: 'business' })); }} className={'glass-card rounded-2xl p-6 text-left transition-all ' + (form.service_type === 'business' ? 'border-2 border-emerald-500 bg-emerald-500/5' : 'border border-gray-800 hover:border-gray-700')} data-testid="service-business">
            <div className="flex items-start gap-4 mb-4">
              <div className={'p-3 rounded-xl ' + (form.service_type === 'business' ? 'bg-emerald-500/20' : 'bg-gray-800')}><Building2 className={form.service_type === 'business' ? 'text-emerald-400' : 'text-gray-400'} size={24} /></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{tx.businessTitle}</h3>
                  {form.service_type === 'business' && <CheckCircle className="text-emerald-400" size={20} />}
                </div>
                <p className="text-gray-400 text-sm">{tx.businessDesc}</p>
              </div>
            </div>
            <p className="text-sm text-gray-300"><Zap size={14} className="inline text-emerald-400 mr-1" />{tx.businessFeatures}</p>
          </button>
        </div>

        <div className="glass-card rounded-2xl p-8" data-testid="consulting-form-section">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><Mail className="text-emerald-500" /> {tx.contactTitle}</h2>
          <p className="text-gray-400 mb-6">{tx.contactDesc}</p>

          {submitted ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="text-emerald-400" size={32} /></div>
              <h3 className="text-xl font-bold text-white mb-2">{tx.sentTitle}</h3>
              <p className="text-gray-400 mb-6">{tx.sentDesc}</p>
              <button onClick={function() { setSubmitted(false); }} className="text-emerald-400 hover:text-emerald-300">{tx.sendAnother}</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{tx.nameLabel}</label>
                  <input type="text" value={form.name} onChange={function(e) { setForm(Object.assign({}, form, { name: e.target.value })); }} placeholder={tx.namePlaceholder} className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500" data-testid="consulting-name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">{tx.emailLabel}</label>
                  <input type="email" value={form.email} onChange={function(e) { setForm(Object.assign({}, form, { email: e.target.value })); }} placeholder={tx.emailPlaceholder} className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500" data-testid="consulting-email" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">{tx.companyLabel}</label>
                <input type="text" value={form.company} onChange={function(e) { setForm(Object.assign({}, form, { company: e.target.value })); }} placeholder={tx.companyPlaceholder} className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500" data-testid="consulting-company" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">{tx.messageLabel}</label>
                <textarea value={form.message} onChange={function(e) { setForm(Object.assign({}, form, { message: e.target.value })); }} placeholder={tx.messagePlaceholder} rows={5} className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none" data-testid="consulting-message" />
              </div>
              <div className="p-4 bg-gray-800/30 rounded-xl text-sm text-gray-400">
                <span className="font-medium text-gray-300">{tx.selectedService}</span>{form.service_type === 'personal' ? tx.personalTitle : tx.businessTitle}
              </div>
              {error && <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}
              <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all" data-testid="consulting-submit">
                {submitting ? <Loader2 size={20} className="animate-spin" /> : <><Send size={18} />{tx.sendBtn}</>}
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
          <div className="flex items-start gap-3">
            <Shield className="text-gray-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-bold text-gray-400 mb-1">{tx.privacyTitle}</h3>
              <p className="text-sm text-gray-500">{tx.privacyDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConsultingPage;
