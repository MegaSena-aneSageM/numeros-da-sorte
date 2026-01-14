import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLotteryData } from '../hooks/useLotteryData';
import AdSense from './AdSense';
import Footer from './Footer';
import {
  calculateFrequencies,
  calculateRecentHot,
  filterViradaResults,
  getTopNumbers,
  getBottomNumbers,
  getStatistics
} from '../utils/frequencies';

// Fallback static data (used if API fails and no cache available)
const FALLBACK_HISTORICAL_FREQUENCY = {
  1: 288, 2: 295, 3: 273, 4: 314, 5: 322, 6: 294, 7: 276, 8: 293, 9: 281, 10: 345,
  11: 311, 12: 279, 13: 304, 14: 287, 15: 264, 16: 305, 17: 312, 18: 281, 19: 287, 20: 288,
  21: 246, 22: 263, 23: 309, 24: 296, 25: 294, 26: 243, 27: 312, 28: 303, 29: 294, 30: 312,
  31: 274, 32: 312, 33: 316, 34: 320, 35: 310, 36: 299, 37: 321, 38: 316, 39: 284, 40: 279,
  41: 305, 42: 311, 43: 308, 44: 310, 45: 289, 46: 309, 47: 281, 48: 276, 49: 300, 50: 290,
  51: 301, 52: 298, 53: 336, 54: 310, 55: 255, 56: 310, 57: 283, 58: 282, 59: 285, 60: 283
};

const FALLBACK_VIRADA_FREQUENCY = {
  1: 3, 2: 2, 3: 4, 4: 2, 5: 4, 6: 1, 7: 1, 8: 0, 9: 1, 10: 6,
  11: 3, 12: 3, 13: 0, 14: 2, 15: 2, 16: 1, 17: 4, 18: 2, 19: 3, 20: 3,
  21: 1, 22: 2, 23: 1, 24: 2, 25: 1, 26: 1, 27: 1, 28: 0, 29: 2, 30: 1,
  31: 1, 32: 4, 33: 4, 34: 5, 35: 4, 36: 4, 37: 3, 38: 2, 39: 1, 40: 2,
  41: 5, 42: 2, 43: 1, 44: 1, 45: 1, 46: 2, 47: 2, 48: 1, 49: 2, 50: 3,
  51: 4, 52: 1, 53: 2, 54: 0, 55: 2, 56: 4, 57: 2, 58: 4, 59: 3, 60: 1
};

const FALLBACK_RECENT_HOT = [15, 4, 9, 27, 38, 54, 8, 5, 40, 37];
const FALLBACK_VIRADA_HOT = [10, 41, 34, 32, 3, 5, 17, 35, 33, 36, 51, 58, 56];
const FALLBACK_TOTAL_DRAWINGS = 2954;

// PIX donation info
const PIX_KEY = '7009a9a8-33e3-4edc-91b1-eee413b117a9';

// Seeded random number generator based on timestamp
function seededRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Generate prediction based on multiple factors
function generatePrediction(count, timestamp, isVirada, luckyNumber, frequencies) {
  const date = new Date(timestamp);

  let seed = timestamp +
    date.getDate() * 1000000 +
    date.getMonth() * 10000000 +
    date.getHours() * 100000000 +
    date.getMinutes() * 1000000000 +
    date.getSeconds() * 10000000000;

  if (luckyNumber && luckyNumber >= 1 && luckyNumber <= 60) {
    seed += luckyNumber * 88888888;
  }

  let currentSeed = seed;
  const getNextRandom = () => {
    currentSeed++;
    return seededRandom(currentSeed);
  };

  const frequency = isVirada ? frequencies.virada : frequencies.historical;
  const hotNumbers = isVirada ? frequencies.viradaHot : frequencies.recentHot;
  const baseWeight = isVirada ? 2 : 280;

  const weightedPool = [];

  for (let num = 1; num <= 60; num++) {
    let weight = (frequency[num] || 0) + baseWeight;

    if (hotNumbers.includes(num)) {
      weight *= 1.7;
    }

    if (luckyNumber && luckyNumber >= 1 && luckyNumber <= 60) {
      if (num === luckyNumber) {
        weight *= 2.6;
      }
      if (Math.abs(num - luckyNumber) <= 5 && num !== luckyNumber) {
        weight *= 1.16;
      }
      if (num === (61 - luckyNumber)) {
        weight *= 1.34;
      }
      if (num % 10 === luckyNumber % 10 && num !== luckyNumber) {
        weight *= 1.07;
      }
    }

    const hour = date.getHours();
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();

    if (hour < 12) {
      if (num <= 30) weight *= 1.07;
    } else {
      if (num > 30) weight *= 1.07;
    }

    if ((num % 7) === dayOfWeek) {
      weight *= 1.16;
    }

    if (num === dayOfMonth || num === (dayOfMonth + 30) % 60 + 1) {
      weight *= 1.25;
    }

    const entries = Math.max(1, Math.round(weight));
    for (let i = 0; i < entries; i++) {
      weightedPool.push(num);
    }
  }

  const selected = new Set();
  let attempts = 0;

  while (selected.size < count && attempts < 1000) {
    const randomIndex = Math.floor(getNextRandom() * weightedPool.length);
    const num = weightedPool[randomIndex];
    selected.add(num);
    attempts++;
  }

  while (selected.size < count) {
    const num = Math.floor(getNextRandom() * 60) + 1;
    selected.add(num);
  }

  return Array.from(selected).sort((a, b) => a - b);
}

// Shuffle array using Fisher-Yates with seeded random
function shuffleArray(array, seed) {
  const result = [...array];
  let currentSeed = seed;

  const getNextRandom = () => {
    currentSeed++;
    return seededRandom(currentSeed);
  };

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(getNextRandom() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

// Generate shuffled sets from user numbers
function generateShuffledSets(userNumbers, numbersPerSet, numberOfSets, timestamp) {
  const date = new Date(timestamp);
  let baseSeed = timestamp +
    date.getDate() * 1000000 +
    date.getMilliseconds() * 10000000;

  const sets = [];
  const usedCombinations = new Set();
  let attempts = 0;
  const maxAttempts = numberOfSets * 100;

  while (sets.length < numberOfSets && attempts < maxAttempts) {
    const shuffled = shuffleArray(userNumbers, baseSeed + attempts);
    const selectedSet = shuffled.slice(0, numbersPerSet).sort((a, b) => a - b);
    const combinationKey = selectedSet.join('-');

    if (!usedCombinations.has(combinationKey)) {
      usedCombinations.add(combinationKey);
      sets.push(selectedSet);
    }

    attempts++;
  }

  return sets;
}

// Ball component
function LotteryBall({ number, delay, isRevealed, isLucky, size = 'normal' }) {
  const sizeClasses = size === 'small'
    ? 'w-10 h-10 md:w-12 md:h-12 text-sm md:text-base'
    : 'w-16 h-16 md:w-20 md:h-20 text-xl md:text-2xl';

  return (
    <div
      className={`
        ${sizeClasses} rounded-full flex items-center justify-center
        font-bold text-white shadow-lg
        transition-all duration-500 transform relative
        ${isRevealed ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
      `}
      style={{
        background: isLucky
          ? 'linear-gradient(145deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'
          : 'linear-gradient(145deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
        boxShadow: isLucky
          ? '0 4px 15px rgba(251, 191, 36, 0.5), inset 0 2px 10px rgba(255,255,255,0.3)'
          : '0 4px 15px rgba(34, 197, 94, 0.4), inset 0 2px 10px rgba(255,255,255,0.3)',
        transitionDelay: `${delay}ms`
      }}
    >
      {number.toString().padStart(2, '0')}
      {isLucky && (
        <span className="absolute -top-1 -right-1 text-xs">🍀</span>
      )}
    </div>
  );
}

/*
// Statistics Section moved to src/pages/Statistics.jsx
*/

// Latest Draws Component
function LatestDraws({ draws, isVirada }) {
  if (!draws || draws.length === 0) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    // Handle both DD/MM/YYYY and ISO formats
    if (dateStr.includes('/')) {
      return dateStr;
    }
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getPrizeInfo = (draw, hits) => {
    if (!draw || !draw.premiacao || !Array.isArray(draw.premiacao)) return { winners: 0, prize: 'R$ 0,00' };

    const prizeData = draw.premiacao.find(p => {
      if (!p) return false;
      const desc = p.descricao || p.descricaoFaixa || p.nome || '';
      return desc.includes(`${hits} acertos`) || desc.includes(`${hits} Acertos`) || p.faixa === (7 - hits) || p.acertos === hits;
    });

    if (!prizeData) return { winners: 0, prize: 'R$ 0,00' };

    return {
      winners: prizeData.ganhadores || prizeData.numeroDeGanhadores || prizeData.quantidade_ganhadores || 0,
      prize: formatCurrency(prizeData.valorPremio || prizeData.valor || prizeData.valor_total || 0)
    };
  };

  return (
    <div className={`mt-6 backdrop-blur rounded-2xl p-4 md:p-6 border ${isVirada ? 'bg-purple-500/10 border-purple-300/20' : 'bg-white/10 border-white/20'
      }`}>
      <h3 className={`font-bold text-lg mb-4 flex items-center gap-2 ${isVirada ? 'text-purple-200' : 'text-green-200'
        }`}>
        <span>📋</span> Últimos Resultados
      </h3>

      <div className="space-y-4">
        {Array.isArray(draws) && draws.map((draw, index) => {
          if (!draw) return null;
          const numbers = Array.isArray(draw.dezenas) ? draw.dezenas : (Array.isArray(draw.listaDezenas) ? draw.listaDezenas : []);
          const date = draw.data || draw.dataApuracao || draw.data_concurso || '';
          const contest = draw.concurso || draw.numero || draw.numero_concurso || '';

          let prize6, prize5, prize4;
          try {
            prize6 = getPrizeInfo(draw, 6);
            prize5 = getPrizeInfo(draw, 5);
            prize4 = getPrizeInfo(draw, 4);
          } catch (e) {
            console.error("Error calculating prize", e);
            prize6 = { winners: 0, prize: 'Erro' };
            prize5 = { winners: 0, prize: 'Erro' };
            prize4 = { winners: 0, prize: 'Erro' };
          }

          return (
            <div
              key={contest || index}
              className={`rounded-xl p-4 border ${isVirada
                ? 'bg-purple-900/30 border-purple-500/20'
                : 'bg-green-900/30 border-green-500/20'
                }`}
            >
              {/* Header */}
              <div className={`text-sm font-semibold mb-3 ${isVirada ? 'text-purple-300' : 'text-green-300'
                }`}>
                Resultado: Concurso {contest} ({formatDate(date)})
              </div>

              {/* Numbers */}
              <div className="mb-3">
                <div className={`text-xs mb-2 ${isVirada ? 'text-purple-400' : 'text-green-400'}`}>
                  Números:
                </div>
                <div className="flex flex-wrap gap-2">
                  {numbers.map((num, numIndex) => (
                    <span
                      key={numIndex}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white ${isVirada
                        ? 'bg-gradient-to-br from-purple-500 to-pink-600'
                        : 'bg-gradient-to-br from-green-500 to-emerald-600'
                        }`}
                    >
                      {num.toString().padStart(2, '0')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Prize Information */}
              <div className={`text-xs space-y-1 ${isVirada ? 'text-purple-300' : 'text-green-300'}`}>
                <div className="font-semibold mb-1">Premiação:</div>
                <div className="flex justify-between">
                  <span>6 acertos:</span>
                  <span className="text-yellow-400">
                    {prize6.winners > 0
                      ? `${prize6.winners} ganhador${prize6.winners > 1 ? 'es' : ''} - ${prize6.prize}`
                      : 'Acumulou!'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>5 acertos:</span>
                  <span>{prize5.winners} ganhador{prize5.winners !== 1 ? 'es' : ''} - {prize5.prize}</span>
                </div>
                <div className="flex justify-between">
                  <span>4 acertos:</span>
                  <span>{prize4.winners} ganhador{prize4.winners !== 1 ? 'es' : ''} - {prize4.prize}</span>
                </div>
              </div>
            </div >
          );
        })}
      </div >
    </div >
  );
}

// Donation Modal Component
function DonationModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-white/10">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 mb-4">
            <span className="text-3xl">💚</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Apoie o Projeto!</h2>
          <p className="text-gray-300 text-sm">
            Gostou? Ajude a manter o projeto no ar!
          </p>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-2xl p-4 mb-4">
          <img
            src="./qrcode_pix.jpg"
            alt="QR Code PIX"
            className="w-full h-auto rounded-lg"
          />
        </div>

        {/* PIX Key */}
        <div className="mb-4">
          <label className="block text-gray-400 text-xs mb-2 text-center">
            Chave PIX (clique para copiar)
          </label>
          <button
            onClick={handleCopyPix}
            className={`w-full p-3 rounded-xl font-mono text-xs transition-all duration-200 ${copied
              ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
              : 'bg-gray-800 border-2 border-gray-700 text-gray-300 hover:border-green-500 hover:text-white'
              }`}
          >
            {copied ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copiado!
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {PIX_KEY}
              </span>
            )}
          </button>
        </div>

        {/* Thank you message */}
        <p className="text-center text-gray-500 text-xs">
          Qualquer valor é bem-vindo! 🙏
        </p>
      </div>
    </div>
  );
}

export default function MegaSenaPredictor() {
  const navigate = useNavigate();
  // Fetch lottery data from API
  const { data: lotteryData, loading: dataLoading, error: dataError, lastUpdate, nextUpdate, refresh } = useLotteryData();

  const [mode, setMode] = useState('megasena'); // 'megasena', 'virada', 'shuffle'
  const [numberCount, setNumberCount] = useState(6);
  const [prediction, setPrediction] = useState([]);
  const [shuffledSets, setShuffledSets] = useState([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [generationTime, setGenerationTime] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [luckyNumber, setLuckyNumber] = useState('');
  const [usedLuckyNumber, setUsedLuckyNumber] = useState(null);
  const [showDonation, setShowDonation] = useState(false);

  // Shuffle mode states
  const [userNumbersInput, setUserNumbersInput] = useState('');
  const [numberOfSets, setNumberOfSets] = useState(3);
  const [shuffleError, setShuffleError] = useState('');

  const isVirada = mode === 'virada';
  const isShuffle = mode === 'shuffle';

  // Calculate frequencies from API data or use fallback
  const frequencies = useMemo(() => {
    if (!lotteryData || !Array.isArray(lotteryData)) {
      return {
        historical: FALLBACK_HISTORICAL_FREQUENCY,
        virada: FALLBACK_VIRADA_FREQUENCY,
        recentHot: FALLBACK_RECENT_HOT,
        viradaHot: FALLBACK_VIRADA_HOT,
        stats: { totalDrawings: FALLBACK_TOTAL_DRAWINGS, viradaDrawings: 22 }
      };
    }

    const historical = calculateFrequencies(lotteryData);
    const viradaResults = filterViradaResults(lotteryData);
    const virada = calculateFrequencies(viradaResults);
    const recentHot = calculateRecentHot(lotteryData, lotteryData.length);
    const viradaHot = getTopNumbers(virada, 13);
    const stats = getStatistics(lotteryData);

    return {
      historical,
      virada,
      recentHot,
      viradaHot,
      stats
    };
  }, [lotteryData]);

  const handleLuckyNumberChange = (e) => {
    const value = e.target.value;
    if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 60)) {
      setLuckyNumber(value);
    }
  };

  const parseUserNumbers = (input) => {
    const numbers = input
      .split(/[\n,\-\s]+/)
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && n >= 1 && n <= 60);

    return [...new Set(numbers)];
  };

  const handleGenerate = () => {
    if (isShuffle) {
      const userNumbers = parseUserNumbers(userNumbersInput);

      if (userNumbers.length < numberCount) {
        setShuffleError(`Você precisa de pelo menos ${numberCount} números únicos. Você tem ${userNumbers.length}.`);
        return;
      }

      const factorial = (n) => n <= 1 ? 1 : n * factorial(n - 1);
      const combinations = (n, r) => factorial(n) / (factorial(r) * factorial(n - r));
      const maxCombinations = combinations(userNumbers.length, numberCount);

      if (numberOfSets > maxCombinations) {
        setShuffleError(`Com ${userNumbers.length} números, só é possível gerar ${Math.floor(maxCombinations)} jogos de ${numberCount} números.`);
        return;
      }

      setShuffleError('');
      setIsGenerating(true);
      setIsRevealed(false);
      setShuffledSets([]);

      setTimeout(() => {
        const timestamp = Date.now();
        const sets = generateShuffledSets(userNumbers, numberCount, numberOfSets, timestamp);
        setShuffledSets(sets);
        setGenerationTime(new Date(timestamp));
        setIsGenerating(false);

        setTimeout(() => {
          setIsRevealed(true);
        }, 100);
      }, 800);
    } else {
      setIsGenerating(true);
      setIsRevealed(false);
      setPrediction([]);

      setTimeout(() => {
        const timestamp = Date.now();
        const lucky = luckyNumber ? parseInt(luckyNumber) : null;
        const numbers = generatePrediction(numberCount, timestamp, isVirada, lucky, frequencies);
        setPrediction(numbers);
        setGenerationTime(new Date(timestamp));
        setUsedLuckyNumber(lucky);
        setIsGenerating(false);

        setTimeout(() => {
          setIsRevealed(true);
        }, 100);
      }, 800);
    }
  };

  const formatDateTime = (date) => {
    if (!date) return '';
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getCacheAge = (lastUpdate) => {
    if (!lastUpdate) return '';

    const now = Date.now();
    const updateTime = lastUpdate.getTime();
    const hours = Math.floor((now - updateTime) / (1000 * 60 * 60));
    const minutes = Math.floor((now - updateTime) / (1000 * 60));

    if (hours < 1) {
      if (minutes < 1) return 'agora mesmo';
      if (minutes === 1) return 'há 1 minuto';
      return `há ${minutes} minutos`;
    }
    if (hours === 1) return 'há 1 hora';
    if (hours < 24) return `há ${hours} horas`;

    const days = Math.floor(hours / 24);
    if (days === 1) return 'ontem';
    return `há ${days} dias`;
  };

  const getNextUpdateText = (nextUpdate) => {
    if (!nextUpdate) return '';

    const now = new Date();
    const next = new Date(nextUpdate);

    // If next update is today
    if (now.toDateString() === next.toDateString()) {
      return `hoje às ${next.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // If next update is tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (tomorrow.toDateString() === next.toDateString()) {
      return `amanhã às ${next.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    return next.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const hotNumbers = isVirada ? frequencies.viradaHot.slice(0, 5) : frequencies.recentHot.slice(0, 5);
  const coldNumbers = getBottomNumbers(isVirada ? frequencies.virada : frequencies.historical, 5);
  const totalDrawings = frequencies.stats?.totalDrawings || FALLBACK_TOTAL_DRAWINGS;
  const viradaDrawings = frequencies.stats?.viradaDrawings || 22;

  const getBackgroundClass = () => {
    if (isShuffle) return 'bg-gradient-to-br from-amber-900 via-orange-900 to-amber-800';
    if (isVirada) return 'bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800';
    return 'bg-gradient-to-br from-green-900 via-green-800 to-emerald-900';
  };

  const getCardClass = () => {
    if (isShuffle) return 'bg-amber-500/10 border-amber-300/20';
    if (isVirada) return 'bg-purple-500/10 border-purple-300/20';
    return 'bg-white/10 border-white/20';
  };

  // Show loading screen while data is being fetched
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 mb-4 animate-pulse">
            <span className="text-3xl">🍀</span>
          </div>
          <p className="text-white text-xl font-semibold mb-2">Carregando dados...</p>
          <p className="text-green-200 text-sm">Obtendo resultados da Mega-Sena</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 md:p-8 transition-all duration-500 ${getBackgroundClass()}`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${isShuffle
              ? 'bg-gradient-to-br from-orange-400 to-red-500'
              : isVirada
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                : 'bg-gradient-to-br from-yellow-400 to-yellow-600'
              }`}>
              <span className="text-2xl">{isShuffle ? '🔀' : isVirada ? '🎆' : '🍀'}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {isShuffle ? 'Embaralhar' : isVirada ? 'Mega da Virada' : 'Mega-Sena'} Predictor
            </h1>
          </div>
          <p className="text-green-200 text-sm md:text-base">
            {isShuffle
              ? 'Embaralhe seus números e gere novos jogos'
              : isVirada
                ? `Baseado em ${viradaDrawings} sorteios da Mega da Virada`
                : `Baseado em ${totalDrawings.toLocaleString()} sorteios históricos`}
          </p>

          {/* Data update status */}
          {lastUpdate && (
            <div className="mt-2 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
                  <span className="text-green-300 text-xs">⏱️</span>
                  <span className="text-green-100 text-xs">
                    Atualizado {getCacheAge(lastUpdate)}
                  </span>
                </div>
                <button
                  onClick={refresh}
                  className="inline-flex items-center gap-1 bg-green-500/20 hover:bg-green-500/30 text-green-200 text-xs px-3 py-1 rounded-full transition-colors"
                  title="Atualizar dados agora"
                >
                  🔄 Atualizar
                </button>
              </div>
              {nextUpdate && (
                <div className="inline-flex items-center gap-2 bg-blue-500/10 rounded-full px-3 py-1 border border-blue-500/20">
                  <span className="text-blue-300 text-xs">📅</span>
                  <span className="text-blue-100 text-xs">
                    Próxima atualização: {getNextUpdateText(nextUpdate)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Error indicator */}
          {dataError && (
            <div className="mt-2 inline-flex items-center gap-2 bg-yellow-500/20 rounded-full px-3 py-1">
              <span className="text-yellow-300 text-xs">⚠️</span>
              <span className="text-yellow-100 text-xs">{dataError}</span>
            </div>
          )}

          {/* Donation Button */}
          <button
            onClick={() => setShowDonation(true)}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium text-sm rounded-full shadow-lg shadow-green-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <span>💚</span>
            <span>Apoiar com PIX</span>
          </button>


        </div>

        {/* Ad Placement - Top */}
        {/* <AdSense adFormat="auto" fullWidthResponsive={true} /> */}

        {/* Main Card */}
        <div className={`backdrop-blur-lg rounded-3xl p-6 md:p-8 shadow-2xl border transition-all duration-300 ${getCardClass()}`}>

          {/* Mode Toggle */}
          <div className="mb-6">
            <div className="flex justify-center">
              <div className="bg-black/20 rounded-2xl p-1 inline-flex flex-wrap justify-center gap-1">
                <button
                  onClick={() => setMode('megasena')}
                  className={`px-3 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${mode === 'megasena'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'text-green-200 hover:text-white'
                    }`}
                >
                  🍀 Mega-Sena
                </button>
                <button
                  onClick={() => setMode('virada')}
                  className={`px-3 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${mode === 'virada'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-purple-200 hover:text-white'
                    }`}
                >
                  🎆 Mega da Virada
                </button>
                <button
                  onClick={() => setMode('shuffle')}
                  className={`px-3 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${mode === 'shuffle'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'text-orange-200 hover:text-white'
                    }`}
                >
                  🔀 Embaralhar
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col md:flex-row gap-3 mt-6 mb-2">
            <button
              onClick={() => navigate('/results')}
              className="w-full bg-white/5 hover:bg-white/10 text-green-100 py-3 rounded-xl border border-white/10 transition-all text-sm font-medium flex items-center justify-center gap-2"
            >
              <span>📅</span> Ver Últimos Resultados
            </button>
            <button
              onClick={() => navigate('/statistics')}
              className="w-full bg-white/5 hover:bg-white/10 text-green-100 py-3 rounded-xl border border-white/10 transition-all text-sm font-medium flex items-center justify-center gap-2"
            >
              <span>📊</span> Ver Análise Estatística
            </button>
          </div>

          {/* Shuffle Mode Input */}
          {isShuffle ? (
            <div className="mb-6">
              <label className="block text-amber-100 text-sm font-medium mb-2 text-center">
                📝 Cole seus números (separados por - , espaço ou linha)
              </label>
              <textarea
                value={userNumbersInput}
                onChange={(e) => setUserNumbersInput(e.target.value)}
                placeholder="01-10-57-29-23-55&#10;01-10-12-49-52-55&#10;07-27-30-36-37-39"
                rows={5}
                className="w-full p-4 rounded-2xl bg-amber-900/50 border-2 border-amber-400/50 text-white placeholder-amber-300/50 focus:border-yellow-400 outline-none transition-all duration-200 text-sm font-mono"
              />
              {shuffleError && (
                <p className="text-red-400 text-sm mt-2 text-center">{shuffleError}</p>
              )}
              <p className="text-amber-300/70 text-xs text-center mt-2">
                {parseUserNumbers(userNumbersInput).length} números únicos detectados
              </p>

              {/* Number of Sets */}
              <div className="mt-4">
                <label className="block text-amber-100 text-sm font-medium mb-2 text-center">
                  Quantos jogos gerar?
                </label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 5, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => setNumberOfSets(num)}
                      className={`
                        w-12 h-12 rounded-xl font-bold text-lg transition-all duration-200
                        ${numberOfSets === num
                          ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white scale-110 shadow-lg'
                          : 'bg-white/20 text-white hover:bg-white/30'}
                      `}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Lucky Number Input */
            <div className="mb-6">
              <label className="block text-green-100 text-sm font-medium mb-2 text-center">
                🍀 Seu Número da Sorte (opcional)
              </label>
              <div className="flex justify-center">
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={luckyNumber}
                    onChange={handleLuckyNumberChange}
                    placeholder="1-60"
                    className={`w-32 h-14 text-center text-xl font-bold rounded-2xl border-2 transition-all duration-200 outline-none ${isVirada
                      ? 'bg-purple-900/50 border-purple-400/50 text-white placeholder-purple-300 focus:border-yellow-400'
                      : 'bg-green-900/50 border-green-400/50 text-white placeholder-green-300 focus:border-yellow-400'
                      }`}
                  />
                  {luckyNumber && (
                    <button
                      onClick={() => setLuckyNumber('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              <p className="text-green-300/70 text-xs text-center mt-2">
                Seu número da sorte influencia a previsão
              </p>
            </div>
          )}

          {/* Number Count Selector */}
          <div className="mb-6">
            <label className="block text-green-100 text-sm font-medium mb-3 text-center">
              Quantos números por jogo?
            </label>
            <div className="flex justify-center gap-3">
              {[6, 7, 8].map((num) => (
                <button
                  key={num}
                  onClick={() => setNumberCount(num)}
                  className={`
                    w-16 h-16 rounded-2xl font-bold text-xl transition-all duration-200
                    ${numberCount === num
                      ? isShuffle
                        ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white scale-110 shadow-lg shadow-orange-500/30'
                        : isVirada
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-purple-900 scale-110 shadow-lg shadow-orange-500/30'
                          : 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-green-900 scale-110 shadow-lg shadow-yellow-500/30'
                      : 'bg-white/20 text-white hover:bg-white/30'}
                  `}
                >
                  {num}
                </button>
              ))}
            </div>
            <p className="text-green-300 text-xs text-center mt-2">
              {numberCount === 6 ? 'Aposta simples' : numberCount === 7 ? '7 dezenas (7x mais chances!)' : '8 dezenas (28x mais chances!)'}
            </p>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`
              w-full py-4 px-6 rounded-2xl font-bold text-lg md:text-xl
              transition-all duration-300 transform
              ${isGenerating
                ? 'bg-gray-500 cursor-not-allowed'
                : isShuffle
                  ? 'bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 hover:from-orange-500 hover:via-red-600 hover:to-pink-600 hover:scale-[1.02] active:scale-[0.98]'
                  : isVirada
                    ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 hover:from-yellow-500 hover:via-orange-600 hover:to-pink-600 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 hover:scale-[1.02] active:scale-[0.98]'}
              text-gray-900 shadow-lg
            `}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Gerando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>{isShuffle ? '🔀' : isVirada ? '🎆' : '🎰'}</span>
                {isShuffle ? `GERAR ${numberOfSets} JOGO${numberOfSets > 1 ? 'S' : ''}` : 'GERAR NÚMEROS DA SORTE'}
              </span>
            )}
          </button>

          {/* Results - Shuffle Mode */}
          {isShuffle && shuffledSets.length > 0 && (
            <div className="mt-8 space-y-4">
              {shuffledSets.map((set, setIndex) => (
                <div
                  key={setIndex}
                  className={`
                    bg-white/5 rounded-2xl p-4 transition-all duration-500
                    ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                  `}
                  style={{ transitionDelay: `${setIndex * 150}ms` }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-amber-400 font-bold text-sm">Jogo {setIndex + 1}</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {set.map((num, index) => (
                      <LotteryBall
                        key={`${setIndex}-${num}-${index}`}
                        number={num}
                        delay={setIndex * 150 + index * 50}
                        isRevealed={isRevealed}
                        isLucky={false}
                        size="small"
                      />
                    ))}
                  </div>
                </div>
              ))}

              {generationTime && isRevealed && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                    <span className="text-amber-300 text-sm">⏱️</span>
                    <span className="text-amber-100 text-sm">
                      Gerado em: {formatDateTime(generationTime)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results - Normal Mode */}
          {!isShuffle && prediction.length > 0 && (
            <div className="mt-8">
              <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                {prediction.map((num, index) => (
                  <LotteryBall
                    key={`${num}-${index}`}
                    number={num}
                    delay={index * 150}
                    isRevealed={isRevealed}
                    isLucky={usedLuckyNumber && num === usedLuckyNumber}
                  />
                ))}
              </div>

              {generationTime && isRevealed && (
                <div className="mt-6 text-center space-y-2">
                  <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                    <span className="text-green-300 text-sm">⏱️</span>
                    <span className="text-green-100 text-sm">
                      Gerado em: {formatDateTime(generationTime)}
                    </span>
                  </div>
                  {usedLuckyNumber && (
                    <div className="block">
                      <span className="inline-flex items-center gap-2 bg-yellow-500/20 rounded-full px-4 py-2">
                        <span className="text-yellow-300 text-sm">🍀</span>
                        <span className="text-yellow-100 text-sm">
                          Número da Sorte: {usedLuckyNumber.toString().padStart(2, '0')}
                          {prediction.includes(usedLuckyNumber) && ' ✨ Incluído!'}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Cards - Only show for non-shuffle modes */}
        {!isShuffle && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className={`backdrop-blur rounded-2xl p-4 border ${isVirada ? 'bg-purple-500/10 border-purple-300/10' : 'bg-white/10 border-white/10'
              }`}>
              <h3 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                🔥 Números Quentes {isVirada && '(Virada)'}
              </h3>
              <p className="text-green-100 text-sm">
                {hotNumbers.map(n => n.toString().padStart(2, '0')).join(', ')}
              </p>
              <p className="text-green-300 text-xs mt-1">
                {isVirada
                  ? 'Mais frequentes nas Mega da Virada'
                  : 'Mais frequentes em todos os sorteios'}
              </p>
            </div>

            <div className={`backdrop-blur rounded-2xl p-4 border ${isVirada ? 'bg-purple-500/10 border-purple-300/10' : 'bg-white/10 border-white/10'
              }`}>
              <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                {isVirada ? '🎆 Campeão da Virada' : '❄️ Números "Atrasados"'}
              </h3>
              <p className="text-green-100 text-sm">
                {isVirada
                  ? `${hotNumbers[0]?.toString().padStart(2, '0')} (${(frequencies.virada[hotNumbers[0]] || 0)}x), ${hotNumbers[1]?.toString().padStart(2, '0')} (${(frequencies.virada[hotNumbers[1]] || 0)}x), ${hotNumbers[2]?.toString().padStart(2, '0')} (${(frequencies.virada[hotNumbers[2]] || 0)}x)`
                  : coldNumbers.map(n => n.toString().padStart(2, '0')).join(', ')}
              </p>
              <p className="text-green-300 text-xs mt-1">
                {isVirada
                  ? `Número ${hotNumbers[0]} saiu em ${frequencies.virada[hotNumbers[0]] || 0} das ${viradaDrawings} Viradas!`
                  : 'Menos frequentes historicamente'}
              </p>
            </div>
          </div>
        )}

        {/* Shuffle Mode Info */}
        {isShuffle && (
          <div className="mt-6 bg-amber-500/5 backdrop-blur rounded-2xl p-4 border border-amber-300/10">
            <h3 className="text-amber-200 font-semibold mb-2 text-sm">🔀 Como funciona o Embaralhar?</h3>
            <ul className="text-amber-300 text-xs space-y-1">
              <li>• Cole seus números de jogos anteriores ou favoritos</li>
              <li>• O sistema extrai todos os números únicos</li>
              <li>• Gera novas combinações embaralhando seus números</li>
              <li>• Cada jogo gerado é único (sem repetições)</li>
              <li>• Use para recombinar números que você já joga!</li>
            </ul>
          </div>
        )}
        {/* Statistics Section Moved to Separate Page */}



        {/* Algorithm Info - Normal modes */}
        {!isShuffle && (
          <div className={`mt-6 backdrop-blur rounded-2xl p-4 border ${isVirada ? 'bg-purple-500/5 border-purple-300/10' : 'bg-white/5 border-white/10'
            }`}>
            <h3 className="text-green-200 font-semibold mb-2 text-sm">🧮 Como funciona?</h3>
            <ul className="text-green-300 text-xs space-y-1">
              {isVirada ? (
                <>
                  <li>• Analisa os {viradaDrawings} sorteios da Mega da Virada</li>
                  <li>• Prioriza números que mais saíram na virada ({hotNumbers.slice(0, 3).join(', ')}...)</li>
                </>
              ) : (
                <>
                  <li>• Analisa frequência de {totalDrawings.toLocaleString()} sorteios históricos</li>
                  <li>• Considera tendências de todos os jogos</li>
                </>
              )}
              <li>• Usa a data e hora exata como semente única</li>
              <li>• Seu número da sorte influencia toda a previsão</li>
              <li>• Números próximos ao seu número da sorte ganham peso extra</li>
              <li>• {lotteryData ? '✅ Dados atualizados da API' : '📦 Usando dados estáticos'}</li>
            </ul>
          </div>
        )}

        {/* Ad Placement - Middle */}
        {/* <AdSense adFormat="auto" fullWidthResponsive={true} /> */}

        {/* Disclaimer */}
        <p className="text-center text-green-400/60 text-xs mt-6">
          ⚠️ Apenas para entretenimento. A Mega-Sena é um jogo de sorte e os resultados são completamente aleatórios.
        </p>

        {/* Ad Placement - Bottom */}
        {/* <AdSense adFormat="auto" fullWidthResponsive={true} /> */}
      </div>

      {/* Footer */}
      <Footer />

      {/* Donation Modal */}
      <DonationModal isOpen={showDonation} onClose={() => setShowDonation(false)} />
    </div>
  );
}
