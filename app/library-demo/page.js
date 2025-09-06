'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LogoIcon } from '@/components/ui/logo';
import { 
    BookOpen, Heart, Clock, CheckCircle, 
    Star, User, Calendar, ArrowLeft, 
    TrendingUp, Tag, Search
} from 'lucide-react';

// Mock library data for demo
const mockLibraryData = {
    manhwas: [
        {
            id: 'solo-leveling',
            title: 'Solo Leveling',
            cover: '/placeholder-manhwa-cover.jpg',
            author: 'Chu-Gong',
            genres: ['Ação', 'Fantasia', 'Sobrenatural'],
            description: 'Em um mundo onde portais para dimensões monstruosas se abriram...',
            totalChapters: 200,
            rating: 4.9,
            year: 2018,
            status: 'Completo',
            userStatus: 'completed',
            currentChapter: 200,
            rating: 5,
            startedAt: '2024-01-15T00:00:00.000Z',
            completedAt: '2024-02-20T00:00:00.000Z',
            addedAt: '2024-01-10T00:00:00.000Z',
            isFavorite: true,
            notes: 'Incrível! Uma das melhores histórias que já li.'
        },
        {
            id: 'tower-of-god',
            title: 'Tower of God',
            cover: '/placeholder-manhwa-cover.jpg',
            author: 'SIU',
            genres: ['Aventura', 'Drama', 'Fantasia'],
            description: 'Siga a jornada de Bam enquanto ele escala a misteriosa Torre...',
            totalChapters: 600,
            rating: 4.7,
            year: 2010,
            status: 'Em andamento',
            userStatus: 'reading',
            currentChapter: 250,
            startedAt: '2024-01-20T00:00:00.000Z',
            addedAt: '2024-01-15T00:00:00.000Z',
            isFavorite: true,
            notes: 'Enredo complexo mas muito interessante.'
        },
        {
            id: 'beginning-after-end',
            title: 'The Beginning After The End',
            cover: '/placeholder-manhwa-cover.jpg',
            author: 'TurtleMe',
            genres: ['Fantasia', 'Ação', 'Reencarnação'],
            description: 'Um rei poderoso renasce em um mundo de magia e aventuras...',
            totalChapters: 180,
            rating: 4.8,
            year: 2018,
            status: 'Em andamento',
            userStatus: 'reading',
            currentChapter: 120,
            startedAt: '2024-02-01T00:00:00.000Z',
            addedAt: '2024-01-25T00:00:00.000Z',
            isFavorite: false
        },
        {
            id: 'noblesse',
            title: 'Noblesse',
            cover: '/placeholder-manhwa-cover.jpg',
            author: 'Son Je-Ho',
            genres: ['Ação', 'Sobrenatural', 'Escola'],
            description: 'Cadis Etrama di Raizel acorda após 820 anos de sono...',
            totalChapters: 544,
            rating: 4.6,
            year: 2007,
            status: 'Completo',
            userStatus: 'plan_to_read',
            currentChapter: 0,
            addedAt: '2024-02-10T00:00:00.000Z',
            isFavorite: false,
            notes: 'Recomendado por amigos.'
        }
    ],
    stats: {
        totalManhwas: 4,
        reading: 2,
        completed: 1,
        planToRead: 1,
        onHold: 0,
        dropped: 0,
        favorites: 2,
        totalChaptersRead: 570
    }
};

// Status labels and colors
const StatusLabels = {
    reading: 'Lendo',
    completed: 'Concluído',
    plan_to_read: 'Pretendo Ler',
    on_hold: 'Em Pausa',
    dropped: 'Abandonado'
};

const StatusColors = {
    reading: 'text-blue-600 dark:text-blue-400',
    completed: 'text-green-600 dark:text-green-400',
    plan_to_read: 'text-gray-600 dark:text-gray-400',
    on_hold: 'text-yellow-600 dark:text-yellow-400',
    dropped: 'text-red-600 dark:text-red-400'
};

// Individual manhwa card component
function ManhwaCard({ manhwa }) {
    const progressPercentage = manhwa.totalChapters > 0 
        ? Math.round((manhwa.currentChapter / manhwa.totalChapters) * 100)
        : 0;

    const getStatusIcon = (status) => {
        const icons = {
            reading: <BookOpen className="h-4 w-4" />,
            completed: <CheckCircle className="h-4 w-4" />,
            plan_to_read: <Clock className="h-4 w-4" />
        };
        return icons[status] || <BookOpen className="h-4 w-4" />;
    };

    return (
        <Card className="group hover:shadow-md transition-all duration-200 border-border/50 overflow-hidden">
            <div className="relative">
                {/* Cover placeholder */}
                <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
                
                {/* Favorite indicator */}
                {manhwa.isFavorite && (
                    <div className="absolute top-2 right-2">
                        <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                    </div>
                )}
            </div>

            <CardContent className="p-4">
                <div className="space-y-3">
                    {/* Title and Author */}
                    <div>
                        <h3 className="font-semibold text-sm leading-5 line-clamp-2">
                            {manhwa.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            <User className="inline h-3 w-3 mr-1" />
                            {manhwa.author}
                        </p>
                    </div>

                    {/* Status and Progress */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Badge 
                                variant="outline" 
                                className="text-xs"
                            >
                                {getStatusIcon(manhwa.userStatus)}
                                <span className="ml-1">{StatusLabels[manhwa.userStatus]}</span>
                            </Badge>
                            
                            {manhwa.rating && (
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                                    {manhwa.rating}
                                </div>
                            )}
                        </div>

                        {/* Progress Bar */}
                        {manhwa.userStatus === 'reading' && (
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Capítulo {manhwa.currentChapter}/{manhwa.totalChapters}</span>
                                    <span>{progressPercentage}%</span>
                                </div>
                                <Progress value={progressPercentage} className="h-1.5" />
                            </div>
                        )}
                    </div>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-1">
                        {manhwa.genres.slice(0, 2).map(genre => (
                            <Badge key={genre} variant="secondary" className="text-xs">
                                {genre}
                            </Badge>
                        ))}
                        {manhwa.genres.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                                +{manhwa.genres.length - 2}
                            </Badge>
                        )}
                    </div>

                    {/* Notes */}
                    {manhwa.notes && (
                        <p className="text-xs text-muted-foreground italic line-clamp-2">
                            "{manhwa.notes}"
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default function LibraryDemoPage() {
    const [activeTab, setActiveTab] = useState('all');

    // Filter functions
    const getFilteredManhwas = (filter) => {
        switch (filter) {
            case 'reading':
                return mockLibraryData.manhwas.filter(m => m.userStatus === 'reading');
            case 'completed':
                return mockLibraryData.manhwas.filter(m => m.userStatus === 'completed');
            case 'plan':
                return mockLibraryData.manhwas.filter(m => m.userStatus === 'plan_to_read');
            case 'favorites':
                return mockLibraryData.manhwas.filter(m => m.isFavorite);
            default:
                return mockLibraryData.manhwas;
        }
    };

    const filteredManhwas = getFilteredManhwas(activeTab);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Voltar
                        </Button>
                        <div className="flex items-center gap-2">
                            <LogoIcon />
                            <h1 className="text-xl font-bold">Biblioteca de Manhwas - Demo</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 pb-16">
                {/* Demo Banner */}
                <div className="mt-6 mb-6">
                    <Card className="border-2 border-dashed border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                                    <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                                        🎯 Demo da Biblioteca de Manhwas
                                    </h3>
                                    <p className="text-sm text-purple-700 dark:text-purple-300">
                                        Esta é uma demonstração da funcionalidade de biblioteca integrada ao sistema de perfil. 
                                        Mostra dados de exemplo sem necessidade de autenticação.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{mockLibraryData.stats.reading}</p>
                                <p className="text-xs text-muted-foreground">Lendo</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{mockLibraryData.stats.completed}</p>
                                <p className="text-xs text-muted-foreground">Concluídos</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
                                <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{mockLibraryData.stats.favorites}</p>
                                <p className="text-xs text-muted-foreground">Favoritos</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{mockLibraryData.stats.totalManhwas}</p>
                                <p className="text-xs text-muted-foreground">Total</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tab Navigation */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Minha Biblioteca</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {[
                                { key: 'all', label: `Todos (${mockLibraryData.manhwas.length})` },
                                { key: 'reading', label: `Lendo (${mockLibraryData.stats.reading})` },
                                { key: 'completed', label: `Concluídos (${mockLibraryData.stats.completed})` },
                                { key: 'plan', label: `Pretendo Ler (${mockLibraryData.stats.planToRead})` },
                                { key: 'favorites', label: `Favoritos (${mockLibraryData.stats.favorites})` }
                            ].map(tab => (
                                <Button
                                    key={tab.key}
                                    variant={activeTab === tab.key ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setActiveTab(tab.key)}
                                    className="text-xs"
                                >
                                    {tab.label}
                                </Button>
                            ))}
                        </div>

                        {/* Manhwa Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredManhwas.map(manhwa => (
                                <ManhwaCard key={manhwa.id} manhwa={manhwa} />
                            ))}
                        </div>

                        {filteredManhwas.length === 0 && (
                            <div className="text-center py-8">
                                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">Nenhum manhwa encontrado</h3>
                                <p className="text-muted-foreground">
                                    Nenhum manhwa corresponde ao filtro selecionado.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Features implemented */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Tag className="h-5 w-5" />
                            Funcionalidades Implementadas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <h4 className="font-semibold mb-2">✅ Funcionalidades do Backend:</h4>
                                <ul className="space-y-1 text-muted-foreground">
                                    <li>• API completa de biblioteca (/api/users/me/library)</li>
                                    <li>• CRUD de manhwas (adicionar, atualizar, remover)</li>
                                    <li>• Sistema de status de leitura</li>
                                    <li>• Controle de favoritos</li>
                                    <li>• Filtros avançados (status, gênero, busca)</li>
                                    <li>• Estatísticas automáticas</li>
                                    <li>• Autenticação Auth0 integrada</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">✅ Funcionalidades do Frontend:</h4>
                                <ul className="space-y-1 text-muted-foreground">
                                    <li>• Interface completa da biblioteca</li>
                                    <li>• Cards interativos de manhwa</li>
                                    <li>• Sistema de tabs e filtros</li>
                                    <li>• Indicadores de progresso</li>
                                    <li>• Hook customizado (useManhwaLibrary)</li>
                                    <li>• Estados de loading e erro</li>
                                    <li>• Integração com ProfilePro</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}