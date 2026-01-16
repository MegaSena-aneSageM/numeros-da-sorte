import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

export default function Contact() {
  useSEO(
    'Contato | Mega-Sena Predictor - Suporte e Dúvidas',
    'Entre em contato com o Mega-Sena Predictor. Suporte, dúvidas, sugestões e feedback. Perguntas frequentes sobre o gerador de números da Mega-Sena.',
    'contato mega-sena predictor, suporte, dúvidas, perguntas frequentes, FAQ, ajuda'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="backdrop-blur-lg rounded-3xl p-6 md:p-8 shadow-2xl border bg-white/10 border-white/20">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-green-300 hover:text-green-200 mb-6 transition-colors"
          >
            ← Voltar para o início
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Entre em Contato</h1>

          <div className="space-y-6 text-green-100">
            <section>
              <p className="text-lg mb-6">
                Tem dúvidas, sugestões ou feedback sobre o Mega-Sena Predictor? Adoraríamos ouvir você!
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">📧 Formas de Contato</h2>

              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-all">
                  <h3 className="text-lg font-semibold text-yellow-300 mb-2">E-mail</h3>
                  <p className="mb-2">Para questões gerais, sugestões ou suporte:</p>
                  <a
                    href="mailto:geramegasena@gmail.com"
                    className="text-green-300 hover:text-green-200 underline font-mono"
                  >
                    geramegasena@gmail.com
                  </a>
                </div>

                <div className="bg-white/5 rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-all">
                  <h3 className="text-lg font-semibold text-yellow-300 mb-2">GitHub</h3>
                  <p className="mb-2">Encontrou um bug ou quer contribuir com o código?</p>
                  <a
                    href="https://github.com/MegaSena-aneSageM/numeros-da-sorte"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-300 hover:text-green-200 underline inline-flex items-center gap-2"
                  >
                    Visite nosso repositório
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                </div>

                <div className="bg-white/5 rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-all">
                  <h3 className="text-lg font-semibold text-yellow-300 mb-2">Suporte PIX</h3>
                  <p className="mb-2">Gostou do projeto? Ajude a mantê-lo no ar:</p>
                  <p className="text-green-300 font-mono text-sm break-all">
                    7009a9a8-33e3-4edc-91b1-eee413b117a9
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">❓ Perguntas Frequentes</h2>

              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="font-semibold text-green-200 mb-2">O algoritmo realmente funciona?</h3>
                  <p className="text-sm">
                    Este site é apenas para entretenimento. A Mega-Sena é um jogo de sorte completamente aleatório. Nenhum algoritmo pode prever os resultados com certeza.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="font-semibold text-green-200 mb-2">Vocês têm relação com a Caixa?</h3>
                  <p className="text-sm">
                    Não temos afiliação oficial com a Caixa Econômica Federal ou Loterias Caixa. Apenas utilizamos dados públicos disponibilizados pela API oficial.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="font-semibold text-green-200 mb-2">Meus dados estão seguros?</h3>
                  <p className="text-sm">
                    Sim! Não coletamos informações pessoais identificáveis. Todos os cálculos são feitos localmente no seu navegador. Consulte nossa
                    <Link to="/privacy" className="text-yellow-300 hover:text-yellow-200 underline ml-1">
                      Política de Privacidade
                    </Link> para mais detalhes.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="font-semibold text-green-200 mb-2">Como posso sugerir melhorias?</h3>
                  <p className="text-sm">
                    Adoramos receber feedback! Envie suas sugestões por e-mail ou abra uma issue no nosso repositório do GitHub.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="font-semibold text-green-200 mb-2">O site está com problemas</h3>
                  <p className="text-sm">
                    Se você encontrou um bug ou o site não está funcionando corretamente, por favor nos avise por e-mail com detalhes do problema (navegador, dispositivo, mensagem de erro, etc).
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-blue-200 text-sm">
                💡 <strong>Dica:</strong> Geralmente respondemos dentro de 24-48 horas. Para problemas urgentes, inclua "URGENTE" no assunto do e-mail.
              </p>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-full shadow-lg transition-all duration-200 hover:scale-105"
              >
                <span>🍀</span>
                <span>Voltar ao Gerador</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
