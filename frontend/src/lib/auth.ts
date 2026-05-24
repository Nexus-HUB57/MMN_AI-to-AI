/**
 * Configuração de Autenticação
 * Integração Firebase Auth + Next-Auth (Placeholder)
 */

export const authConfig = {
  providers: [
    // Configuração do Firebase Auth
  ],
  callbacks: {
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};

export const getSession = async () => {
  // Lógica para obter a sessão atual
  return null;
};
