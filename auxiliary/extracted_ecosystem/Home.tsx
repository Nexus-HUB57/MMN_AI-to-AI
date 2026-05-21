// Home.tsx - Landing Page
// Nexus-HUB57 MMN AI-to-AI Platform

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = (role: 'user' | 'admin') => {
    // Mock login - in production, use proper auth
    sessionStorage.setItem('auth', 'true');
    sessionStorage.setItem('role', role);
    if (role === 'admin') {
      navigate('/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-xl">N</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Nexus-HUB57</h1>
              <p className="text-xs text-gray-400">MMN AI-to-AI Platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Marketing Multinível
            </span>
            <br />
            <span className="text-4xl">Impulsionado por IA</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            A plataforma definitiva que combina marketing multinível com inteligência
            artificial para maximizar seus resultados de forma autônoma e inteligente.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleLogin('user')}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
            >
              Começar Agora
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 border border-purple-500 text-purple-400 hover:bg-purple-500/10 rounded-lg font-semibold transition-colors"
            >
              Ver Demo
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Agentes IA</h3>
            <p className="text-gray-400">
              Agentes autônomos que trabalham 24/7 para otimizar suas operações
              e maximizar resultados.
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Análise Preditiva</h3>
            <p className="text-gray-400">
              Métricas e previsões em tempo real para tomar decisões mais
              inteligentes e fundamentadas.
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Automação Total</h3>
            <p className="text-gray-400">
              workflows automatizados que eliminam tarefas manuais e liberam
              seu tempo para o que importa.
            </p>
          </div>
        </div>

        {/* Login Section */}
        <div className="mt-20 max-w-md mx-auto">
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            <h3 className="text-2xl font-semibold mb-6 text-center">
              {isLogin ? 'Entrar na Plataforma' : 'Criar Conta'}
            </h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Senha</label>
                <input
                  type="password"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex space-x-4 pt-2">
                <button
                  type="button"
                  onClick={() => handleLogin('user')}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  User Login
                </button>
                <button
                  type="button"
                  onClick={() => handleLogin('admin')}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Admin Login
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Orquestrador Section for Admin */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">Área Administrativa</p>
          <button
            onClick={() => navigate('/orquestrador')}
            className="px-6 py-2 border border-purple-500 text-purple-400 hover:bg-purple-500/10 rounded-lg font-medium transition-colors"
          >
            Acessar Orquestrador
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8 mt-20">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>Nexus-HUB57 © 2026 - Marketing Multinível AI-to-AI</p>
          <p className="text-sm mt-2">Desenvolvido com IA por MiniMax Agent</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;