import React from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

export default function About() {
  useSEO(
    'Sobre o Mega-Sena Predictor | Gerador Inteligente de Números para a Mega-Sena',
    'Conheça o Mega-Sena Predictor: ferramenta gratuita de análise estatística para Mega-Sena. +2.950 sorteios analisados. Números quentes, números frios, estatísticas e previsões.',
    'sobre mega-sena predictor, como funciona, análise estatística, algoritmo mega-sena, números que mais saem, números que menos saem, gerador loteria'
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

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Gerador de Números Mega-Sena com Inteligência Artificial</h1>

          <div className="space-y-6 text-green-100">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">🍀 O que é o Mega-Sena Predictor?</h2>
              <p>
                O <strong>Mega-Sena Predictor</strong> é um <strong>gerador inteligente de números para Mega-Sena</strong> que utiliza análise estatística e inteligência artificial para gerar combinações baseadas em mais de 2.950 sorteios históricos. Nossa ferramenta analisa <strong>números quentes</strong> (que mais saem) e <strong>números frios</strong> (que menos saem) para criar previsões personalizadas para a Mega-Sena e Mega da Virada 2026.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">🎯 Nossa Missão</h2>
              <p>
                Nossa missão é fornecer uma forma divertida e interativa de gerar números para jogos de loteria, utilizando dados históricos e algoritmos únicos para criar combinações personalizadas.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">🧮 Como Funciona o Algoritmo de IA para Mega-Sena?</h2>
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-lg font-semibold text-yellow-300 mb-2">Análise Estatística de Números Mais Sorteados</h3>
                  <p>
                    Analisamos mais de 2.950+ sorteios históricos da Mega-Sena para identificar <strong>números que mais saem</strong> (números quentes) e <strong>números que menos saem</strong> (números frios). Nosso algoritmo de inteligência artificial considera a frequência de cada número ao longo da história para gerar previsões mais inteligentes.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-lg font-semibold text-yellow-300 mb-2">Personalização com Número da Sorte</h3>
                  <p>
                    Você pode inserir seu "número da sorte" que influenciará toda a geração. Números próximos ao seu número da sorte ganham peso extra no algoritmo de previsão.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-lg font-semibold text-yellow-300 mb-2">Gerador para Mega da Virada 2026</h3>
                  <p>
                    Modo especial que analisa especificamente os <strong>sorteios da Mega da Virada</strong>, priorizando números que historicamente saíram mais nesse sorteio especial de fim de ano.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-lg font-semibold text-yellow-300 mb-2">Modo Embaralhar Números</h3>
                  <p>
                    Permite que você insira seus próprios números favoritos e gere novas combinações embaralhando-os de forma inteligente com base em estatísticas.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">📊 Estatísticas e Dados em Tempo Real da Mega-Sena</h2>
              <p>
                Nosso sistema busca automaticamente os <strong>resultados mais recentes da Mega-Sena</strong> através da API oficial da Caixa Econômica Federal, garantindo que as análises estatísticas e previsões estejam sempre atualizadas com os últimos concursos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">🔒 Privacidade e Segurança</h2>
              <p>
                Valorizamos sua privacidade. Não coletamos informações pessoais identificáveis. Todos os dados são processados localmente no seu navegador. Para mais detalhes, consulte nossa
                <Link to="/privacy" className="text-yellow-300 hover:text-yellow-200 underline ml-1">
                  Política de Privacidade
                </Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">💚 Apoie o Projeto de Análise de Loteria</h2>
              <p>
                Este é um projeto gratuito e sem fins lucrativos. Se você gostou do nosso <strong>gerador de números para Mega-Sena</strong> e quer ajudar a manter o site no ar, considere fazer uma contribuição via PIX. Qualquer valor é bem-vindo!
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-3">📱 Tecnologia por Trás do Gerador</h2>
              <p className="mb-3">
                Nosso <strong>simulador de Mega-Sena com IA</strong> foi desenvolvido com tecnologias modernas para garantir análises precisas e interface intuitiva:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>React - Interface moderna e responsiva para análise de números</li>
                <li>Tailwind CSS - Design elegante e adaptável</li>
                <li>API oficial da Caixa - Dados oficiais e resultados em tempo real</li>
                <li>Algoritmos de IA personalizados para análise estatística de loteria</li>
              </ul>
            </section>

            <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <p className="text-yellow-200 text-sm">
                ⚠️ <strong>Aviso Importante:</strong> Este site é apenas para fins de entretenimento. A Mega-Sena é um jogo de sorte e os resultados são completamente aleatórios. Não há garantia de ganho. Jogue com responsabilidade e apenas o que você pode perder. Este site não tem afiliação oficial com a Caixa Econômica Federal ou Loterias Caixa.
              </p>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-full shadow-lg transition-all duration-200 hover:scale-105"
              >
                <span>📧</span>
                <span>Entre em Contato</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
