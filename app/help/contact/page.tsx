"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { POLISH_CONTENT } from '@/utils/polish-content';
import { useAuth } from '@/contexts/AuthContext';
import {
  MessageCircle,
  Send,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Mail,
  Clock,
  User
} from 'lucide-react';
import Link from 'next/link';

interface ContactFormData {
  subject: string;
  message: string;
  category: string;
  priority: string;
}

const categories = [
  { value: 'technical', label: POLISH_CONTENT.help.technical },
  { value: 'billing', label: POLISH_CONTENT.help.billing },
  { value: 'general', label: POLISH_CONTENT.help.general },
  { value: 'feature', label: POLISH_CONTENT.help.feature }
];

const priorities = [
  { value: 'low', label: POLISH_CONTENT.help.low },
  { value: 'medium', label: POLISH_CONTENT.help.medium },
  { value: 'high', label: POLISH_CONTENT.help.high },
  { value: 'urgent', label: POLISH_CONTENT.help.urgent }
];

export default function ContactPage() {
  const { user, session } = useAuth();
  const [formData, setFormData] = useState<ContactFormData>({
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setIsSubmitted(true);
    } catch {
      setError('Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto p-8 bg-white dark:bg-neutral-dark rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 text-center"
        >
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            {POLISH_CONTENT.help.messageSent}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-8">
            Otrzymaliśmy Twoją wiadomość i odpowiemy w ciągu 24 godzin.
          </p>
          <div className="space-y-4">
            <Link
              href="/help"
              className="block w-full px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
            >
              Powrót do pomocy
            </Link>
            <Link
              href="/dashboard"
              className="block w-full px-6 py-3 bg-slate-100 dark:bg-neutral-darker hover:bg-slate-200 dark:hover:bg-neutral-dark text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
            >
              Przejdź do panelu
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-dark border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              href="/help"
              className="inline-flex items-center gap-2 text-primary dark:text-primary-light hover:underline mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Powrót do pomocy
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/10 dark:bg-primary-light/10 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-primary dark:text-primary-light" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {POLISH_CONTENT.help.contactForm}
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  Wyślij nam wiadomość, a odpowiemy w ciągu 24 godzin
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-neutral-dark rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User Info Display */}
                {user && (
                  <div className="bg-slate-50 dark:bg-neutral-darker rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-slate-500" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {user.email}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          Zalogowany użytkownik
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    {POLISH_CONTENT.help.category}
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white dark:bg-neutral-darker border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white"
                    required
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    {POLISH_CONTENT.help.priority}
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white dark:bg-neutral-darker border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white"
                    required
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    {POLISH_CONTENT.help.subject}
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Krótko opisz swój problem lub pytanie"
                    className="w-full px-4 py-3 bg-white dark:bg-neutral-darker border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    {POLISH_CONTENT.help.message}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Opisz szczegółowo swój problem, pytanie lub sugestię..."
                    className="w-full px-4 py-3 bg-white dark:bg-neutral-darker border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 resize-none"
                    required
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                  >
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-red-700 dark:text-red-300 text-sm">
                      {error}
                    </p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting || !user}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-3 bg-primary hover:bg-primary-dark disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {POLISH_CONTENT.loading.sending}
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      {POLISH_CONTENT.help.sendMessage}
                    </>
                  )}
                </motion.button>

                {!user && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 text-center">
                    <Link href="/login" className="text-primary dark:text-primary-light hover:underline">
                      Zaloguj się
                    </Link>
                    {' '}aby wysłać wiadomość
                  </p>
                )}
              </form>
            </div>
          </motion.div>

          {/* Contact Info Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Response Time */}
            <div className="bg-white dark:bg-neutral-dark rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-6 w-6 text-primary dark:text-primary-light" />
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Czas odpowiedzi
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Odpowiadamy na wszystkie wiadomości w ciągu 24 godzin w dni robocze.
              </p>
            </div>

            {/* Direct Email */}
            <div className="bg-white dark:bg-neutral-dark rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Bezpośredni kontakt
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                Możesz również napisać bezpośrednio na:
              </p>
              <a
                href="mailto:support@pracujmatcher.pl"
                className="text-primary dark:text-primary-light hover:underline font-medium"
              >
                support@pracujmatcher.pl
              </a>
            </div>

            {/* Common Issues */}
            <div className="bg-white dark:bg-neutral-dark rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                Najczęstsze problemy
              </h3>
              <div className="space-y-3">
                <Link
                  href="/help/troubleshooting/common-issues"
                  className="block text-sm text-primary dark:text-primary-light hover:underline"
                >
                  • Aplikacja nie uruchamia się
                </Link>
                <Link
                  href="/help/troubleshooting/common-issues"
                  className="block text-sm text-primary dark:text-primary-light hover:underline"
                >
                  • Problemy z logowaniem
                </Link>
                <Link
                  href="/help/billing/buying-credits"
                  className="block text-sm text-primary dark:text-primary-light hover:underline"
                >
                  • Pytania o kredyty
                </Link>
                <Link
                  href="/help/getting-started/downloading-app"
                  className="block text-sm text-primary dark:text-primary-light hover:underline"
                >
                  • Instalacja aplikacji
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}