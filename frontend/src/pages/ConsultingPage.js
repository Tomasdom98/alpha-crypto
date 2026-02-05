import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Briefcase, User, Building2, Mail, Send, CheckCircle, Loader2, Shield, Zap } from 'lucide-react';
import axios from 'axios';
import OwlSeal from '@/components/OwlSeal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL + '/api';

function ConsultingPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '', service_type: 'personal' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }
    setSubmitting(true);
    setError('');
    axios.post(API + '/consulting', form)
      .then(function() {
        setSubmitted(true);
        setForm({ name: '', email: '', company: '', message: '', service_type: 'personal' });
      })
      .catch(function() { setError('Error al enviar. Por favor intenta de nuevo.'); })
      .finally(function() { setSubmitting(false); });
  }

  var personalFeatures = 'Revisión de portfolio, Evaluación de riesgo, Estrategias de entrada/salida, Airdrop hunting, Estrategias DeFi';
  var businessFeatures = 'Gestión de tesorería, Pagos crypto, Diseño de tokenomics, Compliance, Capacitación de equipo';

  return (
    <div className="min-h-screen py-12 relative" data-testid="consulting-page">
      {/* Owl Seal */}
      <OwlSeal position="bottom-right" size="md" opacity={0.35} className="fixed z-10 hidden lg:block" />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 mb-4 transition-colors">
            <ChevronRight size={16} className="rotate-180" /> Volver al Inicio
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2" data-testid="consulting-heading">Crypto Consulting</h1>
          <p className="text-gray-400 text-lg">Expert guidance for your crypto journey</p>
        </div>

        <div className="glass-card rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/20"><Briefcase className="text-emerald-400" size={28} /></div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Why Alpha Crypto Consulting?</h2>
              <p className="text-gray-400">Navigate the complex crypto landscape with confidence. Our team combines years of trading experience, deep market analysis, and hands-on DeFi expertise to help you make informed decisions.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <button type="button" onClick={function() { setForm(Object.assign({}, form, { service_type: 'personal' })); }} className={'glass-card rounded-2xl p-6 text-left transition-all ' + (form.service_type === 'personal' ? 'border-2 border-emerald-500 bg-emerald-500/5' : 'border border-gray-800 hover:border-gray-700')} data-testid="service-personal">
            <div className="flex items-start gap-4 mb-4">
              <div className={'p-3 rounded-xl ' + (form.service_type === 'personal' ? 'bg-emerald-500/20' : 'bg-gray-800')}><User className={form.service_type === 'personal' ? 'text-emerald-400' : 'text-gray-400'} size={24} /></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Personal Consulting</h3>
                  {form.service_type === 'personal' && <CheckCircle className="text-emerald-400" size={20} />}
                </div>
                <p className="text-gray-400 text-sm">One-on-one guidance for individual investors</p>
              </div>
            </div>
            <p className="text-sm text-gray-300"><Zap size={14} className="inline text-emerald-400 mr-1" />{personalFeatures}</p>
          </button>

          <button type="button" onClick={function() { setForm(Object.assign({}, form, { service_type: 'business' })); }} className={'glass-card rounded-2xl p-6 text-left transition-all ' + (form.service_type === 'business' ? 'border-2 border-emerald-500 bg-emerald-500/5' : 'border border-gray-800 hover:border-gray-700')} data-testid="service-business">
            <div className="flex items-start gap-4 mb-4">
              <div className={'p-3 rounded-xl ' + (form.service_type === 'business' ? 'bg-emerald-500/20' : 'bg-gray-800')}><Building2 className={form.service_type === 'business' ? 'text-emerald-400' : 'text-gray-400'} size={24} /></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Business Consulting</h3>
                  {form.service_type === 'business' && <CheckCircle className="text-emerald-400" size={20} />}
                </div>
                <p className="text-gray-400 text-sm">Strategic crypto solutions for companies</p>
              </div>
            </div>
            <p className="text-sm text-gray-300"><Zap size={14} className="inline text-emerald-400 mr-1" />{businessFeatures}</p>
          </button>
        </div>

        <div className="glass-card rounded-2xl p-8" data-testid="consulting-form-section">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2"><Mail className="text-emerald-500" /> Get in Touch</h2>
          <p className="text-gray-400 mb-6">Tell us about your needs and we will get back to you within 24 hours.</p>

          {submitted ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="text-emerald-400" size={32} /></div>
              <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
              <p className="text-gray-400 mb-6">We will review your request and contact you soon.</p>
              <button onClick={function() { setSubmitted(false); }} className="text-emerald-400 hover:text-emerald-300">Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Name *</label>
                  <input type="text" value={form.name} onChange={function(e) { setForm(Object.assign({}, form, { name: e.target.value })); }} placeholder="Your name" className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500" data-testid="consulting-name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email *</label>
                  <input type="email" value={form.email} onChange={function(e) { setForm(Object.assign({}, form, { email: e.target.value })); }} placeholder="your@email.com" className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500" data-testid="consulting-email" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Company (optional)</label>
                <input type="text" value={form.company} onChange={function(e) { setForm(Object.assign({}, form, { company: e.target.value })); }} placeholder="Your company name" className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500" data-testid="consulting-company" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Message *</label>
                <textarea value={form.message} onChange={function(e) { setForm(Object.assign({}, form, { message: e.target.value })); }} placeholder="Tell us about your crypto goals..." rows={5} className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 resize-none" data-testid="consulting-message" />
              </div>
              <div className="p-4 bg-gray-800/30 rounded-xl text-sm text-gray-400">
                <span className="font-medium text-gray-300">Selected Service: </span>{form.service_type === 'personal' ? 'Personal Consulting' : 'Business Consulting'}
              </div>
              {error && <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}
              <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all" data-testid="consulting-submit">
                {submitting ? <Loader2 size={20} className="animate-spin" /> : <><Send size={18} />Send Message</>}
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 p-6 bg-gray-900/50 border border-gray-800 rounded-xl">
          <div className="flex items-start gap-3">
            <Shield className="text-gray-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-bold text-gray-400 mb-1">Privacy Commitment</h3>
              <p className="text-sm text-gray-500">Your information is kept strictly confidential. We never share your data with third parties.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConsultingPage;
