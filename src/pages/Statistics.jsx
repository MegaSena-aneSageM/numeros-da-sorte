import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLotteryData } from '../hooks/useLotteryData';
import Footer from '../components/Footer';
import { calculateFrequencies, getStatistics, filterViradaResults } from '../utils/frequencies';
import {
    FALLBACK_HISTORICAL_FREQUENCY,
    FALLBACK_VIRADA_FREQUENCY,
    FALLBACK_TOTAL_DRAWINGS
} from '../data/fallbackData';

export default function Statistics() {
    const { data: lotteryData, loading, error } = useLotteryData();
    const [activeTab, setActiveTab] = useState('frequency');
    const [isVirada, setIsVirada] = useState(false);

    // Calculate frequencies locally
    const frequencies = useMemo(() => {
        if (!lotteryData || !Array.isArray(lotteryData) || lotteryData.length === 0) {
            return {
                historical: FALLBACK_HISTORICAL_FREQUENCY,
                virada: FALLBACK_VIRADA_FREQUENCY,
                stats: { totalDrawings: FALLBACK_TOTAL_DRAWINGS, viradaDrawings: 22 }
            };
        }

        const historical = calculateFrequencies(lotteryData);
        const viradaResults = filterViradaResults(lotteryData);
        const virada = calculateFrequencies(viradaResults);

        return {
            historical,
            virada,
            stats: getStatistics(lotteryData)
        };
    }, [lotteryData]);

    // Calculate comprehensive statistics
    const stats = useMemo(() => {
        if (!frequencies || !frequencies.historical) {
            return null;
        }

        const freq = isVirada ? frequencies.virada : frequencies.historical;
        if (!freq) return null;
        const values = Object.values(freq).filter(v => v > 0);

        if (values.length === 0) return null;

        // Sort values for calculations
        const sortedValues = [...values].sort((a, b) => a - b);
        const n = sortedValues.length;

        // Mean (average)
        const sum = values.reduce((a, b) => a + b, 0);
        const mean = sum / n;

        // Median
        const mid = Math.floor(n / 2);
        const median = n % 2 !== 0
            ? sortedValues[mid]
            : (sortedValues[mid - 1] + sortedValues[mid]) / 2;

        // Mode (most frequent value)
        const valueCount = {};
        values.forEach(v => {
            valueCount[v] = (valueCount[v] || 0) + 1;
        });
        const maxCount = Math.max(...Object.values(valueCount));
        const modes = Object.entries(valueCount)
            .filter(([_, count]) => count === maxCount)
            .map(([val]) => parseInt(val));

        // Range
        const min = sortedValues[0];
        const max = sortedValues[n - 1];
        const range = max - min;

        // Variance and Standard Deviation
        const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / n;
        const stdDev = Math.sqrt(variance);

        // Coefficient of Variation
        const cv = (stdDev / mean) * 100;

        // Quartiles
        const q1Index = Math.floor(n * 0.25);
        const q3Index = Math.floor(n * 0.75);
        const q1 = sortedValues[q1Index];
        const q3 = sortedValues[q3Index];
        const iqr = q3 - q1;

        // Frequency distribution by ranges
        const distribution = {
            '1-10': 0, '11-20': 0, '21-30': 0, '31-40': 0, '41-50': 0, '51-60': 0
        };
        Object.entries(freq).forEach(([num, count]) => {
            const n = parseInt(num);
            if (n <= 10) distribution['1-10'] += count;
            else if (n <= 20) distribution['11-20'] += count;
            else if (n <= 30) distribution['21-30'] += count;
            else if (n <= 40) distribution['31-40'] += count;
            else if (n <= 50) distribution['41-50'] += count;
            else distribution['51-60'] += count;
        });

        // Odd vs Even distribution
        let oddCount = 0, evenCount = 0;
        Object.entries(freq).forEach(([num, count]) => {
            if (parseInt(num) % 2 === 0) evenCount += count;
            else oddCount += count;
        });

        // Low vs High distribution (1-30 vs 31-60)
        let lowCount = 0, highCount = 0;
        Object.entries(freq).forEach(([num, count]) => {
            if (parseInt(num) <= 30) lowCount += count;
            else highCount += count;
        });

        return {
            mean: mean.toFixed(2),
            median: median.toFixed(2),
            modes,
            min,
            max,
            range,
            variance: variance.toFixed(2),
            stdDev: stdDev.toFixed(2),
            cv: cv.toFixed(2),
            q1,
            q3,
            iqr,
            distribution,
            oddCount,
            evenCount,
            lowCount,
            highCount,
            totalDraws: isVirada ? frequencies.stats?.viradaDrawings : frequencies.stats?.totalDrawings
        };
    }, [frequencies, isVirada]);

    // Helpers
    const getFrequencyData = () => {
        if (!frequencies || !frequencies.historical) return { freq: {}, maxFreq: 0, top10: [], bottom10: [] };
        const freq = isVirada ? (frequencies.virada || {}) : (frequencies.historical || {});

        if (Object.keys(freq).length === 0) return { freq: {}, maxFreq: 0, top10: [], bottom10: [] };

        const maxFreq = Math.max(...Object.values(freq));
        const sortedNumbers = Object.entries(freq).sort((a, b) => b[1] - a[1]);
        return {
            freq,
            maxFreq,
            top10: sortedNumbers.slice(0, 10),
            bottom10: sortedNumbers.slice(-10).reverse()
        };
    };

    const { freq, maxFreq, top10, bottom10 } = getFrequencyData();

    const tabClass = (tab) => `px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
        ? isVirada
            ? 'bg-purple-500 text-white'
            : 'bg-green-500 text-white'
        : 'text-gray-300 hover:bg-white/10'
        }`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white font-sans">
            <div className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link to="/" className="text-white hover:text-green-200 flex items-center gap-2 font-medium transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Voltar
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Modo:</span>
                        <button
                            onClick={() => setIsVirada(!isVirada)}
                            className={`px-3 py-1 text-xs rounded-full font-bold transition-all ${isVirada ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Mega da Virada
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    </div>
                )}

                {error && (
                    <div className="text-center py-20 text-red-400">
                        Erro ao carregar dados: {error}
                    </div>
                )}

                {!loading && stats && (
                    <div className="animate-fade-in">
                        <div className="flex flex-col md:flex-row items-baseline gap-2 mb-8 border-b border-white/10 pb-4">
                            <h1 className="text-3xl md:text-4xl font-bold text-white">Análise Estatística</h1>
                            <span className="text-lg text-gray-400">
                                Baseado em {stats.totalDraws?.toLocaleString()} sorteios
                            </span>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex flex-wrap gap-2 mb-6 bg-black/20 rounded-xl p-1 overflow-x-auto">
                            <button onClick={() => setActiveTab('frequency')} className={tabClass('frequency')}>
                                📈 Frequência
                            </button>
                            <button onClick={() => setActiveTab('central')} className={tabClass('central')}>
                                📐 Tendência Central
                            </button>
                            <button onClick={() => setActiveTab('dispersion')} className={tabClass('dispersion')}>
                                📏 Dispersão
                            </button>
                            <button onClick={() => setActiveTab('distribution')} className={tabClass('distribution')}>
                                🎯 Distribuição
                            </button>
                        </div>

                        {/* Content */}
                        <div className="space-y-6">

                            {/* Frequency Tab */}
                            {activeTab === 'frequency' && (
                                <div className="space-y-6">
                                    <div className={`rounded-2xl p-6 border ${isVirada ? 'bg-purple-900/20 border-purple-500/20' : 'bg-green-900/20 border-green-500/20'}`}>
                                        <h4 className={`text-lg font-semibold mb-6 ${isVirada ? 'text-purple-300' : 'text-green-300'}`}>
                                            Frequência Geral (1-60)
                                        </h4>
                                        <div className="grid grid-cols-10 gap-x-2 gap-y-4">
                                            {Array.from({ length: 60 }, (_, i) => i + 1).map(num => {
                                                const count = freq[num] || 0;
                                                const height = maxFreq > 0 ? (count / maxFreq) * 100 : 0;
                                                const isHot = top10.some(([n]) => parseInt(n) === num);
                                                const isCold = bottom10.some(([n]) => parseInt(n) === num);

                                                return (
                                                    <div key={num} className="flex flex-col items-center group relative">
                                                        <div className="w-full h-24 flex items-end justify-center bg-black/20 rounded-lg overflow-hidden relative">
                                                            <div
                                                                className={`w-full absolute bottom-0 transition-all duration-500 ${isHot
                                                                    ? 'bg-gradient-to-t from-yellow-500 to-orange-400'
                                                                    : isCold
                                                                        ? 'bg-gradient-to-t from-blue-500 to-cyan-400'
                                                                        : isVirada
                                                                            ? 'bg-gradient-to-t from-purple-500 to-pink-400'
                                                                            : 'bg-gradient-to-t from-green-500 to-emerald-400'
                                                                    }`}
                                                                style={{ height: `${Math.max(height, 5)}%` }}
                                                            />
                                                            <span className="relative z-10 text-[10px] font-bold text-white/90 mb-1 drop-shadow-md">
                                                                {count}
                                                            </span>
                                                        </div>
                                                        <span className={`text-xs mt-2 font-medium ${isHot ? 'text-yellow-400' : isCold ? 'text-blue-400' : 'text-gray-400'}`}>
                                                            {num.toString().padStart(2, '0')}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Top 10 */}
                                        <div className={`rounded-2xl p-6 border ${isVirada ? 'bg-purple-900/20 border-purple-500/20' : 'bg-green-900/20 border-green-500/20'}`}>
                                            <h4 className="text-yellow-400 font-bold text-lg mb-4 flex items-center gap-2">
                                                <span>🔥</span> Mais Sorteados
                                            </h4>
                                            <div className="space-y-3">
                                                {top10.map(([num, count], idx) => (
                                                    <div key={num} className="flex items-center gap-3">
                                                        <span className="text-yellow-500/50 font-mono w-4">{idx + 1}.</span>
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isVirada ? 'bg-purple-600 text-white' : 'bg-green-600 text-white'}`}>
                                                            {num.toString().padStart(2, '0')}
                                                        </div>
                                                        <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-yellow-500 rounded-full"
                                                                style={{ width: `${(count / maxFreq) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-white font-mono text-sm">{count}x</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Bottom 10 */}
                                        <div className={`rounded-2xl p-6 border ${isVirada ? 'bg-purple-900/20 border-purple-500/20' : 'bg-green-900/20 border-green-500/20'}`}>
                                            <h4 className="text-blue-400 font-bold text-lg mb-4 flex items-center gap-2">
                                                <span>❄️</span> Menos Sorteados
                                            </h4>
                                            <div className="space-y-3">
                                                {bottom10.map(([num, count], idx) => (
                                                    <div key={num} className="flex items-center gap-3">
                                                        <span className="text-blue-500/50 font-mono w-4">{idx + 1}.</span>
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isVirada ? 'bg-purple-900/50 text-purple-200' : 'bg-green-900/50 text-green-200'}`}>
                                                            {num.toString().padStart(2, '0')}
                                                        </div>
                                                        <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-blue-500 rounded-full"
                                                                style={{ width: `${(count / maxFreq) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-white font-mono text-sm">{count}x</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Central Tendency Tab */}
                            {activeTab === 'central' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className={`rounded-2xl p-6 text-center border ${isVirada ? 'bg-purple-900/20 border-purple-500/20' : 'bg-green-900/20 border-green-500/20'}`}>
                                            <div className="text-4xl mb-3">📊</div>
                                            <h4 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Média</h4>
                                            <div className="text-3xl font-bold text-white mb-2">{stats.mean}</div>
                                            <p className="text-xs text-gray-500">Média aritmética de todas as dezenas</p>
                                        </div>
                                        <div className={`rounded-2xl p-6 text-center border ${isVirada ? 'bg-purple-900/20 border-purple-500/20' : 'bg-green-900/20 border-green-500/20'}`}>
                                            <div className="text-4xl mb-3">📈</div>
                                            <h4 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Mediana</h4>
                                            <div className="text-3xl font-bold text-white mb-2">{stats.median}</div>
                                            <p className="text-xs text-gray-500">Valor central da distribuição</p>
                                        </div>
                                        <div className={`rounded-2xl p-6 text-center border ${isVirada ? 'bg-purple-900/20 border-purple-500/20' : 'bg-green-900/20 border-green-500/20'}`}>
                                            <div className="text-4xl mb-3">🎯</div>
                                            <h4 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Moda</h4>
                                            <div className="text-3xl font-bold text-white mb-2">
                                                {stats.modes.length > 3 ? `${stats.modes.slice(0, 3).join(', ')}...` : stats.modes.join(', ')}
                                            </div>
                                            <p className="text-xs text-gray-500">Números que mais se repetem</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Dispersion Tab */}
                            {activeTab === 'dispersion' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                                            <h4 className="text-gray-400 text-xs uppercase mb-1">Amplitude</h4>
                                            <div className="text-2xl font-bold text-white">{stats.range}</div>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                                            <h4 className="text-gray-400 text-xs uppercase mb-1">Desvio Padrão</h4>
                                            <div className="text-2xl font-bold text-white">{stats.stdDev}</div>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                                            <h4 className="text-gray-400 text-xs uppercase mb-1">Variância</h4>
                                            <div className="text-2xl font-bold text-white">{stats.variance}</div>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                                            <h4 className="text-gray-400 text-xs uppercase mb-1">Coef. Variação</h4>
                                            <div className="text-2xl font-bold text-white">{stats.cv}%</div>
                                        </div>
                                    </div>

                                    <div className={`rounded-2xl p-6 border ${isVirada ? 'bg-purple-900/20 border-purple-500/20' : 'bg-green-900/20 border-green-500/20'}`}>
                                        <h4 className="text-white font-semibold mb-6">Box Plot (Quartis)</h4>
                                        <div className="relative h-20 flex items-center px-4">
                                            {/* Scale */}
                                            <div className="absolute left-0 right-0 h-1 bg-gray-700 rounded-full top-1/2 -translate-y-1/2"></div>

                                            {/* Box */}
                                            <div
                                                className={`absolute h-12 top-1/2 -translate-y-1/2 rounded border-2 ${isVirada ? 'bg-purple-500/20 border-purple-400' : 'bg-green-500/20 border-green-400'}`}
                                                style={{
                                                    left: `${((stats.q1 - stats.min) / (stats.max - stats.min)) * 100}%`,
                                                    width: `${((stats.q3 - stats.q1) / (stats.max - stats.min)) * 100}%`
                                                }}
                                            >
                                                <span className="absolute -top-6 left-0 text-xs text-gray-400">Q1: {stats.q1}</span>
                                                <span className="absolute -top-6 right-0 text-xs text-gray-400">Q3: {stats.q3}</span>
                                            </div>

                                            {/* Median Line */}
                                            <div
                                                className="absolute h-16 w-1 bg-yellow-400 top-1/2 -translate-y-1/2 rounded"
                                                style={{ left: `${((parseFloat(stats.median) - stats.min) / (stats.max - stats.min)) * 100}%` }}
                                            >
                                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-yellow-500 font-bold">Med</span>
                                            </div>

                                            {/* Min/Max Markers */}
                                            <div className="absolute w-1 h-8 bg-blue-500 rounded top-1/2 -translate-y-1/2 left-0">
                                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-blue-400">{stats.min}</span>
                                            </div>
                                            <div className="absolute w-1 h-8 bg-red-500 rounded top-1/2 -translate-y-1/2 right-0">
                                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-red-400">{stats.max}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Distribution Tab */}
                            {activeTab === 'distribution' && (
                                <div className="space-y-6">
                                    <div className={`rounded-2xl p-6 border ${isVirada ? 'bg-purple-900/20 border-purple-500/20' : 'bg-green-900/20 border-green-500/20'}`}>
                                        <h4 className="text-white font-semibold mb-6">Distribuição por Faixas</h4>
                                        <div className="space-y-4">
                                            {Object.entries(stats.distribution).map(([range, count]) => {
                                                const maxDist = Math.max(...Object.values(stats.distribution));
                                                const percent = ((count / (stats.totalDraws * 6)) * 100).toFixed(1);
                                                return (
                                                    <div key={range} className="flex items-center gap-4">
                                                        <span className="text-gray-400 text-sm w-12 font-mono">{range}</span>
                                                        <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${isVirada ? 'bg-purple-500' : 'bg-green-500'}`}
                                                                style={{ width: `${(count / maxDist) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-white text-sm w-24 text-right">{count} <span className="text-gray-500 text-xs">({percent}%)</span></span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
