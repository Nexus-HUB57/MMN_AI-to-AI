import { useState } from 'react';
import { trpc } from '../lib/trpc';

interface NewsletterSubscriptionProps {
  source?: string;
  compact?: boolean;
}

export function NewsletterSubscription({ source = 'direct', compact = false }: NewsletterSubscriptionProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      setStatus('success');
      setMessage(data.message);
      setEmail('');
      setName('');
    },
    onError: (error) => {
      setStatus('error');
      setMessage(error.message || 'Erro ao processar inscrição');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    subscribeMutation.mutate({ email, name, source });
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Seu melhor e-mail"
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          {status === 'loading' ? '...' : 'Inscrever'}
        </button>
        {message && <span className="text-sm text-gray-600">{message}</span>}
      </form>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-8 text-white">
      <h3 className="text-2xl font-bold mb-2">Receba novidades e dicas exclusivas</h3>
      <p className="text-purple-100 mb-6">Cadastre-se e receba conteúdo estratégico sobre marketing de rede</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            className="px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu melhor e-mail"
            className="px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            required
          />
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          {status === 'loading' ? 'Inscrevendo...' : 'QUERO RECEBER CONTEÚDO EXCLUSIVO'}
        </button>

        {message && (
          <div className={`p-3 rounded-lg ${status === 'error' ? 'bg-red-400' : 'bg-green-400'}`}>
            {message}
          </div>
        )}
      </form>

      <p className="text-xs text-purple-200 mt-4">
        Não se preocupe, não praticamos spam. Você pode cancelar a qualquer momento.
      </p>
    </div>
  );
}