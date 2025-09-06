'use client';

import { useState } from 'react';
import { 
    useManhwaLibrary, 
    ReadingStatus, 
    StatusLabels, 
    StatusColors 
} from '@/hooks/use-manhwa-library';
import {
    Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    BookOpen, Heart, Clock, CheckCircle, Pause,
    XCircle, Search, Filter, MoreVertical, Star,
    Calendar, User, Tag, TrendingUp
} from 'lucide-react';

// Componente para exibir um manhwa individual
function ManhwaCard({ manhwa, onUpdate, onRemove }) {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusChange = async (newStatus) => {
        setIsUpdating(true);
        try {
            await onUpdate(manhwa.id, { userStatus: newStatus });
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleFavoriteToggle = async () => {
        setIsUpdating(true);
        try {
            await onUpdate(manhwa.id, { isFavorite: !manhwa.isFavorite });
        } catch (error) {
            console.error('Erro ao atualizar favorito:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusIcon = (status) => {
        const icons = {
            [ReadingStatus.READING]: <BookOpen className="h-4 w-4" />,
            [ReadingStatus.COMPLETED]: <CheckCircle className="h-4 w-4" />,
            [ReadingStatus.PLAN_TO_READ]: <Clock className="h-4 w-4" />,
            [ReadingStatus.ON_HOLD]: <Pause className="h-4 w-4" />,
            [ReadingStatus.DROPPED]: <XCircle className="h-4 w-4" />
        };
        return icons[status] || <BookOpen className="h-4 w-4" />;
    };

    const progressPercentage = manhwa.totalChapters > 0 
        ? Math.round((manhwa.currentChapter / manhwa.totalChapters) * 100)
        : 0;

    return (
        <Card className="group hover:shadow-md transition-all duration-200 border-border/50 overflow-hidden">
            <div className="relative">
                {/* Cover placeholder */}
                <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                </div>
                
                {/* Favorite button */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleFavoriteToggle}
                    disabled={isUpdating}
                >
                    <Heart 
                        className={`h-4 w-4 ${manhwa.isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
                    />
                </Button>
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
                        {manhwa.userStatus === ReadingStatus.READING && (
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

                    {/* Actions Menu */}
                    <div className="flex items-center justify-between pt-2">
                        <Select 
                            value={manhwa.userStatus} 
                            onValueChange={handleStatusChange}
                            disabled={isUpdating}
                        >
                            <SelectTrigger className="h-8 text-xs flex-1 mr-2">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(StatusLabels).map(([status, label]) => (
                                    <SelectItem key={status} value={status} className="text-xs">
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleFavoriteToggle}>
                                    {manhwa.isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => onRemove(manhwa.id)}
                                    className="text-destructive"
                                >
                                    Remover da Biblioteca
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Componente principal da biblioteca
export default function ManhwaLibrary() {
    const {
        library,
        isLoading,
        isUpdating,
        error,
        updateManhwa,
        removeManhwa,
        fetchLibrary,
        getManhwasByStatus,
        getFavoriteManhwas
    } = useManhwaLibrary();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    // Filtrar manhwas baseado nos filtros ativos
    const getFilteredManhwas = (manhwas = []) => {
        return manhwas.filter(manhwa => {
            const matchesSearch = searchTerm === '' || 
                manhwa.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                manhwa.author.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesGenre = selectedGenre === '' || 
                manhwa.genres.some(genre => genre.toLowerCase().includes(selectedGenre.toLowerCase()));
            
            const matchesFavorites = !showFavoritesOnly || manhwa.isFavorite;

            return matchesSearch && matchesGenre && matchesFavorites;
        });
    };

    // Obter todos os gêneros únicos
    const getAllGenres = () => {
        if (!library?.manhwas) return [];
        
        const genres = new Set();
        library.manhwas.forEach(manhwa => {
            manhwa.genres.forEach(genre => genres.add(genre));
        });
        
        return Array.from(genres).sort();
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-20 rounded-lg" />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="h-80 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <p className="text-destructive mb-4">Erro ao carregar biblioteca: {error}</p>
                    <Button onClick={() => fetchLibrary()}>Tentar Novamente</Button>
                </CardContent>
            </Card>
        );
    }

    if (!library?.manhwas?.length) {
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Biblioteca vazia</h3>
                    <p className="text-muted-foreground mb-4">
                        Você ainda não adicionou nenhum manhwa à sua biblioteca.
                    </p>
                    <Button>Descobrir Manhwas</Button>
                </CardContent>
            </Card>
        );
    }

    const allManhwas = library.manhwas || [];
    const readingManhwas = getManhwasByStatus(ReadingStatus.READING);
    const completedManhwas = getManhwasByStatus(ReadingStatus.COMPLETED);
    const planToReadManhwas = getManhwasByStatus(ReadingStatus.PLAN_TO_READ);
    const favoriteManhwas = getFavoriteManhwas();

    return (
        <div className="space-y-6">
            {/* Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{library.stats?.reading || 0}</p>
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
                            <p className="text-2xl font-bold">{library.stats?.completed || 0}</p>
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
                            <p className="text-2xl font-bold">{library.stats?.favorites || 0}</p>
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
                            <p className="text-2xl font-bold">{library.stats?.totalManhwas || 0}</p>
                            <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Minha Biblioteca</span>
                        <Button
                            variant="outline" 
                            size="sm"
                            onClick={showFavoritesOnly ? () => setShowFavoritesOnly(false) : () => setShowFavoritesOnly(true)}
                        >
                            <Heart className={`h-4 w-4 mr-2 ${showFavoritesOnly ? 'fill-current text-red-500' : ''}`} />
                            {showFavoritesOnly ? 'Todos' : 'Favoritos'}
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por título ou autor..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        
                        <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Filtrar por gênero" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Todos os gêneros</SelectItem>
                                {getAllGenres().map(genre => (
                                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Conteúdo das abas */}
            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">Todos ({allManhwas.length})</TabsTrigger>
                    <TabsTrigger value="reading">Lendo ({readingManhwas.length})</TabsTrigger>
                    <TabsTrigger value="completed">Concluídos ({completedManhwas.length})</TabsTrigger>
                    <TabsTrigger value="plan">Pretendo Ler ({planToReadManhwas.length})</TabsTrigger>
                    <TabsTrigger value="favorites">Favoritos ({favoriteManhwas.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {getFilteredManhwas(allManhwas).map(manhwa => (
                            <ManhwaCard 
                                key={manhwa.id} 
                                manhwa={manhwa} 
                                onUpdate={updateManhwa}
                                onRemove={removeManhwa}
                            />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="reading" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {getFilteredManhwas(readingManhwas).map(manhwa => (
                            <ManhwaCard 
                                key={manhwa.id} 
                                manhwa={manhwa} 
                                onUpdate={updateManhwa}
                                onRemove={removeManhwa}
                            />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="completed" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {getFilteredManhwas(completedManhwas).map(manhwa => (
                            <ManhwaCard 
                                key={manhwa.id} 
                                manhwa={manhwa} 
                                onUpdate={updateManhwa}
                                onRemove={removeManhwa}
                            />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="plan" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {getFilteredManhwas(planToReadManhwas).map(manhwa => (
                            <ManhwaCard 
                                key={manhwa.id} 
                                manhwa={manhwa} 
                                onUpdate={updateManhwa}
                                onRemove={removeManhwa}
                            />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="favorites" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {getFilteredManhwas(favoriteManhwas).map(manhwa => (
                            <ManhwaCard 
                                key={manhwa.id} 
                                manhwa={manhwa} 
                                onUpdate={updateManhwa}
                                onRemove={removeManhwa}
                            />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}