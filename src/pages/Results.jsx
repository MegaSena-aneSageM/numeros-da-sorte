import React from 'react';
import { Link } from 'react-router-dom';
import { useLotteryData } from '../hooks/useLotteryData';
import Footer from '../components/Footer';

export default function Results() {
    const { data: lotteryData, loading, error } = useLotteryData();

    // Helper validation to ensure we have data object
    const result = Array.isArray(lotteryData) ? lotteryData[0] : (lotteryData || null);

    const formatCurrency = (value) => {
        if (value === undefined || value === null) return '';
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        if (dateStr.includes('/')) return dateStr;
        return new Date(dateStr).toLocaleDateString('pt-BR');
    };

    const getPrizeList = (data) => {
        if (!data) return [];
        // Handle different API key names for prize list
        return data.listaRateioPremio || data.premiacao || [];
    };

    // Safe accessors for prize info
    const getPrizeByHits = (prizeList, hits) => {
        if (!prizeList) return null;

        // Find by description or range/faixa
        return prizeList.find(p => {
            const desc = (p.descricaoFaixa || p.descricao || '').toLowerCase();
            // Check description or numeric range (1=6 hits, 2=5 hits, 3=4 hits usually)
            return desc.includes(`${hits} acertos`) || p.faixa === (7 - hits);
        });
    };

    const openCaixaSearch = () => {
        window.open('https://loterias.caixa.gov.br/Paginas/Mega-Sena.aspx', '_blank');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white font-sans transition-all duration-500">
            <div className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link to="/" className="text-white hover:text-green-200 flex items-center gap-2 font-medium transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Voltar
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-green-100/80 text-sm hidden md:inline">Buscar por concurso:</span>
                        <button
                            onClick={openCaixaSearch}
                            className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 text-sm rounded-full border border-white/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                        >
                            <span>Ir para site da Caixa</span>
                            <span className="text-xs">↗</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 mb-4 animate-pulse flex items-center justify-center">
                            <span className="text-3xl">🍀</span>
                        </div>
                        <p className="text-white/80 animate-pulse">Carregando resultados...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/20 text-red-100 p-6 rounded-2xl text-center mb-6 border border-red-500/30 backdrop-blur-sm">
                        <p className="text-xl font-bold mb-2">Ops! Algo deu errado</p>
                        <p className="text-sm opacity-80">{error}</p>
                    </div>
                )}

                {!loading && result && (
                    <div className="animate-fade-in space-y-8">
                        {/* Header Section */}
                        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-white/10 shadow-xl">
                            <div className="flex flex-col md:flex-row items-baseline gap-3 mb-6 border-b border-white/10 pb-6">
                                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-200">
                                    Resultado
                                </h1>
                                <span className="text-xl md:text-2xl text-green-100/60 font-light">
                                    Concurso <strong className="text-white font-bold">{result.numero || result.concurso}</strong> • {formatDate(result.dataApuracao || result.data)}
                                </span>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                                {/* Left Column (2/3 width) */}
                                <div className="md:col-span-2 space-y-8">

                                    {/* Status */}
                                    <div>
                                        <h2 className="text-4xl font-bold text-yellow-400 mb-2 drop-shadow-lg">
                                            {result.acumulado ? 'Acumulou!' : 'Saiu!'}
                                        </h2>
                                        <p className="text-green-100/60 text-sm uppercase tracking-wider font-medium">
                                            Sorteio realizado no {result.localSorteio} em <span className="text-white">{result.nomeMunicipioUFSorteio}</span>
                                        </p>
                                    </div>

                                    {/* Numbers */}
                                    <div className="flex flex-wrap gap-3">
                                        {(result.listaDezenas || result.dezenas || []).map((num) => (
                                            <div key={num} className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 border-2 border-green-400/30 flex items-center justify-center shadow-lg shadow-green-900/50">
                                                <span className="text-white text-2xl md:text-3xl font-bold">{num}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Next Contest Estimation */}
                                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                        <div className="text-green-200 text-sm mb-1">
                                            Estimativa de prêmio do próximo concurso {formatDate(result.dataProximoConcurso)}
                                        </div>
                                        <div className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                                            {formatCurrency(result.valorEstimadoProximoConcurso)}
                                        </div>
                                    </div>

                                    {/* Accumulated Values */}
                                    <div className="space-y-4 pt-2">
                                        <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                            <span className="text-green-100/70">Acumulado próximo concurso</span>
                                            <span className="font-bold text-white text-lg">{formatCurrency(result.valorAcumuladoProximoConcurso)}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                            <div className="flex flex-col">
                                                <span className="text-green-100/70">Acumulado próximo concurso final zero/cinco</span>
                                                <span className="text-green-100/40 text-xs">Concurso {result.numeroConcursoFinal_0_5}</span>
                                            </div>
                                            <span className="font-bold text-white text-lg">{formatCurrency(result.valorAcumuladoConcurso_0_5)}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-1">
                                            <span className="text-yellow-100/90 font-medium">Acumulado para Mega da Virada</span>
                                            <span className="font-bold text-yellow-400 text-lg">{formatCurrency(result.valorAcumuladoConcursoEspecial)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column (1/3 width) */}
                                <div className="space-y-8">
                                    {/* Prize Breakdown */}
                                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                        <h3 className="text-xl font-bold text-green-100 mb-6 flex items-center gap-2">
                                            <span>🏆</span> Premiação
                                        </h3>

                                        <div className="space-y-6">
                                            {/* 6 Hits */}
                                            <div className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
                                                <div className="font-bold text-white mb-1">6 acertos</div>
                                                {(() => {
                                                    const p = getPrizeByHits(getPrizeList(result), 6);
                                                    const winners = p ? (p.numeroDeGanhadores || p.ganhadores) : 0;
                                                    return winners > 0 ? (
                                                        <div className="text-sm text-green-200">
                                                            <span className="text-white font-semibold">{winners}</span> apostas ganhadoras <br />
                                                            <span className="text-yellow-400 font-bold text-lg">{formatCurrency(p.valorPremio || p.valorPremio)}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-green-100/60 italic">Não houve ganhadores</div>
                                                    );
                                                })()}
                                            </div>

                                            {/* 5 Hits */}
                                            <div className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
                                                <div className="font-bold text-white mb-1">5 acertos</div>
                                                {(() => {
                                                    const p = getPrizeByHits(getPrizeList(result), 5);
                                                    const winners = p ? (p.numeroDeGanhadores || p.ganhadores) : 0;
                                                    return (
                                                        <div className="text-sm text-green-200">
                                                            <span className="text-white font-semibold">{winners}</span> apostas ganhadoras <br />
                                                            <span className="text-lg">{formatCurrency(p ? (p.valorPremio || p.valorPremio) : 0)}</span>
                                                        </div>
                                                    );
                                                })()}
                                            </div>

                                            {/* 4 Hits */}
                                            <div className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
                                                <div className="font-bold text-white mb-1">4 acertos</div>
                                                {(() => {
                                                    const p = getPrizeByHits(getPrizeList(result), 4);
                                                    const winners = p ? (p.numeroDeGanhadores || p.ganhadores) : 0;
                                                    return (
                                                        <div className="text-sm text-green-200">
                                                            <span className="text-white font-semibold">{winners}</span> apostas ganhadoras <br />
                                                            <span className="text-lg">{formatCurrency(p ? (p.valorPremio || p.valorPremio) : 0)}</span>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Total Collection */}
                                    <div className="bg-black/20 rounded-2xl p-6 border border-white/5">
                                        <h3 className="text-sm font-medium text-green-100/60 mb-1 uppercase tracking-wider">Arrecadação total</h3>
                                        <div className="text-xl font-bold text-white">
                                            {formatCurrency(result.valorArrecadado)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
