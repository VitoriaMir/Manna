'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LogoIcon } from '@/components/ui/logo';
import { AuthStatus } from '@/components/auth/AuthButtons';
import { useAuth } from '@/components/providers/CustomAuthProvider';
import { 
  Search, 
  Play, 
  Info, 
  BookOpen, 
  Star, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Menu,
  User,
  Bell,
  Heart,
  Bookmark,
  Clock,
  Award,
  Calendar,
  Filter,
  Share2,
  Download,
  Plus,
  LogOut,
  Upload
} from 'lucide-react';

// Enhanced sample data with more realistic content
const featuredManhwas = [
  {
    id: 1,
    title: "Ser Uma Vilã Não é Muito Melhor?",
    description: "Após renascer como a vilã de um romance, ela descobre que ser má pode ter suas vantagens. Uma jornada épica de autodescoberta em um mundo de intrigas palacianas.",
    cover: "/images/manhwas/ser-uma-vila-nao-e-muito-melhor.jpg",
    // banner: "/images/manhwas/ser-uma-vila-nao-e-muito-melhor.jpg",
    author: "Mang Go Kim, Mundo & Yoleh",
    genres: ["Romance", "Drama", "Fantasia"],
    rating: 4.8,
    views: "2.5M",
    status: "Em andamento",
    isHot: true,
    chapters: 45,
    color: "from-pink-600 to-purple-800"
  },
  {
    id: 2,
    title: "Eu Me Tornei a Serva do Tirano",
    description: "Uma ex-funcionária é transportada para um romance de fantasia, onde deve navegar pelas complexidades de servir um tirano imprevisível.",
    cover: "/images/manhwas/me-tornei-serva.jpg",
    // banner: "/images/manhwas/me-tornei-serva.jpg",
    author: "Kim Soo-jin",
    genres: ["Romance", "Fantasia", "Reencarnação"],
    rating: 4.7,
    views: "1.8M",
    status: "Em andamento",
    chapters: 98,
    color: "from-red-600 to-orange-800"
  },
  {
    id: 3,
    title: "Não é uma História Típica de Reencarnação",
    description: "Nem todos os vilões são maus. Quando Suna Choi renasce, ela decide mudar o destino de todos ao seu redor de forma inesperada.",
    cover: "/images/manhwas/not-your-typical.jpg",
    // banner: "/images/manhwas/not-your-typical.jpg",
    author: "Lee Min-ho",
    genres: ["Ação", "Fantasia", "Magia"],
    rating: 4.9,
    views: "3.2M",
    status: "Completo",
    chapters: 122,
    color: "from-blue-600 to-cyan-800"
  },
  {
    id: 4,
    title: "Pelo Meu Amor Abandonado",
    description: "Uma duquesa que esconde um passado misterioso se vê envolvida em intrigas da corte que podem revelar verdades perigosas.",
    cover: "/images/manhwas/for-my-derelict-favorite.jpg",
    // banner: "/images/manhwas/for-my-derelict-favorite.jpg",
    author: "Han So-young",
    genres: ["Romance", "Drama", "Histórico"],
    rating: 4.6,
    views: "1.5M",
    status: "Em andamento",
    chapters: 38,
    color: "from-purple-600 to-indigo-800"
  },
  {
    id: 5,
    title: "Nosso contrato de casamento termina aqui",
    description: "Após anos de exílio, a princesa retorna para reclamar seu trono legítimo em uma batalha épica de poder e vingança.",
    cover: "/images/manhwas/our-contract-marriage-ends-here.jpg",
    // banner: "/images/manhwas/our-contract-marriage-ends-here.jpg",
    author: "Park Ji-min",
    genres: ["Ação", "Fantasia", "Política"],
    rating: 4.5,
    views: "1.2M",
    status: "Em andamento",
    isHot: true,
    chapters: 29,
    color: "from-emerald-600 to-teal-800"
  }
];

const newSeries = [
  {
    id: 6,
    title: "My Fake Crush",
    cover: "/images/manhwas/my-fake-crush.jpg",
    category: "Slice Of Life",
    genres: ["Shoujo"],
    badge: "NOVO",
    rating: 4.3
  },
  {
    id: 7,
    title: "Desejos Bestiais",
    cover: "/images/manhwas/desejos-bestiais.jpg",
    category: "Sobrenatural",
    genres: ["Romance"],
    badge: "NOVO",
    rating: 4.1
  },
  {
    id: 8,
    title: "Por Trás da Fachada Alegre da Princesa Sobrevivente",
    cover: "/images/manhwas/por-tras-da-fachada.jpg",
    category: "Romance",
    genres: ["Fantasia"],
    badge: "NOVO",
    rating: 4.5
  },
  {
    id: 9,
    title: "Como Fazer Meu Marido Ficar Do Meu Lado",
    cover: "/images/manhwas/how-send-husband.jpg",
    category: "Romance",
    genres: ["Drama"],
    badge: "HOT",
    rating: 4.7
  },
  {
    id: 10,
    title: "Lágrimas em uma Flor Murcha",
    cover: "/images/manhwas/tear-on-a-flowers.jpg",
    category: "Shoujo",
    genres: ["Fantasia"],
    badge: "NOVO",
    rating: 4.2
  },
  {
    id: 11,
    title: "Criando o Filho do Segundo Protagonista Masculino",
    cover: "/images/manhwas/segundo-filho.jpg",
    category: "Shoujo",
    genres: ["Romance"],
    badge: "COMPLETO",
    rating: 4.6
  }
];

const ultimosLancamentos = [
  {
    id: 12,
    title: "O Amanhecer que Virá",
    cover: "/images/manhwas/the-dawn-to-come.jpg",
    chapter: "Capítulo 07",
    timeAgo: "2 min"
  },
  {
    id: 13,
    title: "Desejos Bestiais",
    cover: "/images/manhwas/desejos-bestiais.jpg", 
    chapter: "Capítulo 21",
    timeAgo: "3h"
  },
  {
    id: 14,
    title: "É só um negócio",
    cover: "/images/manhwas/its-just-business.jpg",
    chapter: "Capítulo 42.5",
    timeAgo: "5h"
  },
  {
    id: 15,
    title: "Amigos não fazem isso",
    cover: "/images/manhwas/operation-true-love.jpg",
    chapter: "Capítulo 71",
    timeAgo: "11h"
  },
  {
    id: 16,
    title: "Eu me tornei a Amiga do Protagonista",
    cover: "/images/manhwas/cant-get-enough-of-you.jpg",
    chapter: "Capítulo 92",
    timeAgo: "1d"
  },
  {
    id: 17,
    title: "Lágrimas em uma Flor Murcha",
    cover: "/images/manhwas/tear-on-a-flowers.jpg",
    chapter: "Capítulo 68", 
    timeAgo: "1d"
  }
];

// Custom Hook for Intersection Observer
const useInView = (options = {}) => {
  const [inView, setInView] = useState(false);
  const [ref, setRef] = useState(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1, ...options }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, options]);

  return [setRef, inView];
};

// Enhanced Card Component
const ManhwaCard = React.memo(({ manhwa, onClick, variant = 'default', index = 0 }) => {
  const [imageRef, imageInView] = useInView();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    onClick?.('reader', manhwa);
  }, [onClick, manhwa]);

  const getBadgeStyles = (badge) => {
    const styles = {
      NOVO: 'bg-emerald-500 border-emerald-400 text-emerald-50',
      HOT: 'bg-red-500 border-red-400 text-red-50 animate-pulse',
      COMPLETO: 'bg-blue-500 border-blue-400 text-blue-50'
    };
    return styles[badge] || 'bg-yellow-500 border-yellow-400 text-yellow-50';
  };

  if (variant === 'trending') {
    return (
      <div
        className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/50 to-slate-900/80 border border-slate-700/50 hover:border-amber-400/50 transition-all duration-700 cursor-pointer transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-400/20"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Image with Parallax Effect */}
        <div className="absolute inset-0">
          <img
            src={manhwa.cover}
            alt={manhwa.title}
            className={`w-full h-full object-cover transition-all duration-1000 ${
              isHovered ? 'scale-110 blur-sm' : 'scale-105'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/40"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 h-80 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-black font-bold text-sm shadow-lg">
                #{index + 1}
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-amber-400 fill-current drop-shadow-sm" />
                <span className="text-amber-400 font-bold text-sm">{manhwa.rating}</span>
              </div>
            </div>
            
            {/* Removed trending badge for cleaner design */}
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-amber-400 transition-colors duration-300 leading-tight">
            {manhwa.title}
          </h3>
          
          {/* Description */}
          <p className="text-slate-300 text-sm mb-4 line-clamp-2 flex-grow leading-relaxed">
            {manhwa.description}
          </p>
          
          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-4">
            {manhwa.genres.slice(0, 2).map((genre) => (
              <Badge 
                key={genre} 
                className="text-xs bg-white/10 text-white border-white/20 hover:bg-amber-400/20 hover:text-amber-400 hover:border-amber-400/40 transition-all duration-300 backdrop-blur-sm"
              >
                {genre}
              </Badge>
            ))}
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-slate-400">
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{manhwa.views}</span>
              </div>
              {manhwa.chapters && (
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-3 w-3" />
                  <span>{manhwa.chapters}</span>
                </div>
              )}
            </div>
            
            <div className={`flex items-center space-x-2 transition-all duration-300 ${
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            }`}>
              <Button 
                size="sm" 
                variant="ghost" 
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLoginRequired('favorite');
                }}
                title="Faça login para favoritar"
              >
                <Heart className="h-3 w-3" />
              </Button>
              <Button 
                size="sm" 
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-4 h-8 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <Play className="h-3 w-3 mr-1" />
                Ler
              </Button>
            </div>
          </div>
        </div>
        
        {/* Animated Border */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-400/20 via-transparent to-amber-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      </div>
    );
  }

  return (
    <div 
      ref={imageRef}
      className="group relative overflow-hidden rounded-2xl border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-[1.03] bg-gradient-to-br from-slate-800/30 to-slate-900/50 backdrop-blur-sm"
      onClick={handleClick}
      style={{
        animation: imageInView ? `slideInUp 0.6s ease-out ${index * 0.1}s both` : 'none'
      }}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={manhwa.cover}
          alt={manhwa.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent group-hover:from-black/85 transition-all duration-500"></div>
        
        {/* Floating Badge */}
        {manhwa.badge && (
          <div className="absolute top-4 -left-1 z-20">
            <div className={`text-white rounded-r-lg px-4 py-2 text-xs font-bold shadow-xl relative transform transition-all duration-300 group-hover:scale-110 ${getBadgeStyles(manhwa.badge)}`}>
              {manhwa.badge}
              <div className="absolute -left-2 top-0 w-0 h-0 border-t-[20px] border-b-[20px] border-r-[8px] border-transparent border-r-slate-900"></div>
            </div>
          </div>
        )}
        
        {/* Chapter Badge for Recent Releases */}
        {manhwa.chapter && (
          <div className="absolute top-4 -left-1 z-20">
            <div className="bg-amber-500 text-black rounded-r-lg px-4 py-2 text-xs font-bold shadow-xl relative transform transition-all duration-300 group-hover:scale-110">
              {manhwa.chapter}
              <div className="absolute -left-2 top-0 w-0 h-0 border-t-[20px] border-b-[20px] border-r-[8px] border-transparent border-r-amber-600"></div>
            </div>
          </div>
        )}
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
          <h3 className="font-bold text-base leading-tight text-white drop-shadow-lg line-clamp-2 group-hover:text-amber-400 transition-colors duration-300">
            {manhwa.title}
          </h3>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              {manhwa.category && (
                <span className="bg-black/60 backdrop-blur-sm text-slate-300 px-3 py-1 rounded-full border border-slate-600/50">
                  {manhwa.category}
                </span>
              )}
              {manhwa.timeAgo && (
                <div className="flex items-center space-x-1 text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{manhwa.timeAgo}</span>
                </div>
              )}
            </div>
            {manhwa.rating && (
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-amber-400 fill-current" />
                <span className="text-amber-400 font-semibold">{manhwa.rating}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          <div className="flex space-x-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <Button 
              size="sm" 
              variant="secondary" 
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                handleLoginRequired('favorite');
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="secondary" 
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                handleLoginRequired('bookmark');
              }}
            >
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              className="bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <Play className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 via-transparent to-amber-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10 blur"></div>
    </div>
  );
});

export function ManhwaHomePage({ onNavigate, onShowProfile, currentUser }) {
  const { logout } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Função para lidar com ações que exigem login
  const handleLoginRequired = (action) => {
    if (!currentUser) {
      setShowLoginModal(true);
      return false;
    }
    // Se estiver logado, executa a ação
    switch(action) {
      case 'favorite':
        console.log('Favoritado!');
        break;
      case 'bookmark':
        console.log('Salvo na biblioteca!');
        break;
      case 'comment':
        console.log('Redirecionando para comentários...');
        break;
      default:
        break;
    }
    return true;
  };

  // Auto-slide with pause on hover
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredManhwas.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const currentManhwa = useMemo(() => featuredManhwas[currentSlide], [currentSlide]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate?.('search');
    }
  }, [searchQuery, onNavigate]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % featuredManhwas.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + featuredManhwas.length) % featuredManhwas.length);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Enhanced Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/20 shadow-2xl' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3 group">
                <div className="relative">
                  <LogoIcon className="text-amber-400 group-hover:text-amber-300 transition-colors duration-300 transform group-hover:scale-110" />
                  <div className="absolute -inset-2 bg-amber-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                  MANNA
                </span>
              </div>
              
              <nav className="hidden md:flex items-center space-x-6">
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-amber-400 hover:bg-white/10 transition-all duration-300 font-medium"
                  onClick={() => onNavigate?.('home')}
                >
                  Página Inicial
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-amber-400 hover:bg-white/10 transition-all duration-300 font-medium"
                  onClick={() => onNavigate?.('biblioteca')}
                >
                  📚 Biblioteca
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-amber-400 hover:bg-white/10 transition-all duration-300 font-medium"
                  onClick={() => onNavigate?.('ultimos-lancamentos')}
                >
                  Capítulos
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-amber-400 hover:bg-white/10 transition-all duration-300 font-medium"
                  onClick={() => window.open('https://t.me/+vETXhLcv_70wOGMx', '_blank')}
                >
                  Telegram
                </Button>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <form onSubmit={handleSearch} className="hidden md:block">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-amber-400 transition-colors" />
                  <Input
                    type="text"
                    placeholder="Buscar manhwas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-3 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/10 focus:border-amber-400/50 rounded-2xl backdrop-blur-sm transition-all duration-300 w-64"
                  />
                </div>
              </form>
              
              {currentUser ? (
                <div className="flex items-center space-x-3">
                  {/* Mostrar botão Creator apenas se o usuário for creator */}
                  {currentUser?.roles?.includes('creator') && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onNavigate?.('creator-dashboard')}
                      className="text-white hover:text-amber-400 hover:bg-white/10 transition-all duration-300 font-medium flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Creator
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-white hover:text-amber-400 hover:bg-white/10 p-3 rounded-xl transition-all duration-300">
                    <Bell className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onShowProfile} className="text-white hover:text-amber-400 hover:bg-white/10 p-3 rounded-xl transition-all duration-300">
                    <User className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowLogoutModal(true)}
                    className="text-white hover:text-red-400 border-white/30 hover:border-red-400 bg-transparent hover:bg-red-500/10 p-3 rounded-xl transition-all duration-300 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button 
                    onClick={() => onNavigate?.('auth-creator')}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Criar Creator
                  </Button>
                  <AuthStatus onNavigate={onNavigate} />
                </div>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="md:hidden text-white hover:text-amber-400 hover:bg-white/10 p-3 rounded-xl transition-all duration-300" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Carousel */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Dynamic Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
          style={{ 
            backgroundImage: `url(${currentManhwa.banner})`,
          }}
        />
        
        {/* Enhanced Overlays */}
        <div className={`absolute inset-0 bg-gradient-to-r transition-all duration-1000 ${currentManhwa.color} opacity-40`}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/30 to-black/70"></div>
        
        {/* Navigation */}
        <Button
          variant="ghost"
          size="sm"
          onClick={prevSlide}
          className="absolute left-8 top-1/2 transform -translate-y-1/2 z-30 text-white hover:bg-amber-400/20 hover:text-amber-400 transition-all duration-300 w-14 h-14 rounded-full border-2 border-white/20 backdrop-blur-sm hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-400/25"
        >
          <ChevronLeft className="h-7 w-7" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={nextSlide}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 z-30 text-white hover:bg-amber-400/20 hover:text-amber-400 transition-all duration-300 w-14 h-14 rounded-full border-2 border-white/20 backdrop-blur-sm hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-400/25"
        >
          <ChevronRight className="h-7 w-7" />
        </Button>

        {/* Hero Content */}
        <div className="relative z-20 min-h-screen flex items-center">
          <div className="container mx-auto px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              {/* Main Content */}
              <div className="lg:col-span-7 space-y-8">
                {/* Title */}
                <div className="space-y-6">
                  <h1 className="text-5xl md:text-6xl xl:text-7xl font-black leading-[0.9] animate-slideInLeft">
                    <span className="bg-gradient-to-r from-white via-amber-100 to-amber-200 bg-clip-text text-transparent drop-shadow-2xl">
                      {currentManhwa.title}
                    </span>
                  </h1>
                  
                  <p className="text-xl md:text-2xl text-slate-300 font-medium animate-slideInLeft" style={{animationDelay: '0.2s'}}>
                    Por <span className="text-amber-400 font-bold">{currentManhwa.author}</span>
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-4 animate-slideInLeft" style={{animationDelay: '0.4s'}}>
                  <p className="text-slate-200 text-lg md:text-xl leading-relaxed max-w-2xl">
                    {currentManhwa.description}
                  </p>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-3 animate-slideInLeft" style={{animationDelay: '0.6s'}}>
                  {currentManhwa.genres.map((genre) => (
                    <div 
                      key={genre}
                      className="px-6 py-3 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-full text-white font-semibold hover:bg-amber-400/20 hover:border-amber-400/50 hover:text-amber-400 transition-all duration-300 cursor-pointer transform hover:scale-105"
                    >
                      {genre}
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-6 animate-slideInLeft" style={{animationDelay: '0.8s'}}>
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold px-10 py-5 rounded-2xl text-lg shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                  >
                    <Play className="h-6 w-6 mr-3" />
                    Começar Leitura
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 px-8 py-5 rounded-2xl font-bold backdrop-blur-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                  >
                    <Info className="h-6 w-6 mr-3" />
                    Detalhes
                  </Button>
                  
                  <div className="flex items-center space-x-3">
                    <Button 
                      variant="ghost" 
                      size="lg"
                      onClick={() => handleLoginRequired('favorite')}
                      className="text-white hover:bg-red-500/20 hover:text-red-400 p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 border-2 border-transparent hover:border-red-400/50"
                    >
                      <Heart className="h-6 w-6" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="lg"
                      onClick={() => handleLoginRequired('bookmark')}
                      className="text-white hover:bg-blue-500/20 hover:text-blue-400 p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 border-2 border-transparent hover:border-blue-400/50"
                    >
                      <Bookmark className="h-6 w-6" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="lg"
                      className="text-white hover:bg-green-500/20 hover:text-green-400 p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 border-2 border-transparent hover:border-green-400/50"
                    >
                      <Share2 className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Cover Preview */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div className="relative group animate-slideInRight">
                  {/* Multiple Glow Layers */}
                  <div className="absolute -inset-8 bg-gradient-to-r from-amber-400/30 via-orange-500/30 to-red-500/30 rounded-3xl blur-3xl opacity-75 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="absolute -inset-6 bg-gradient-to-r from-purple-400/20 via-pink-500/20 to-red-500/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-700"></div>
                  
                  {/* Main Cover */}
                  <div className="relative">
                    <img
                      src={currentManhwa.cover}
                      alt={currentManhwa.title}
                      className="relative w-80 h-[480px] object-cover rounded-3xl shadow-2xl border-4 border-white/30 group-hover:border-amber-400/50 group-hover:scale-105 transition-all duration-700 z-10"
                    />
                    
                    {/* Overlay Effects */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-3xl z-20"></div>
                    
                    {/* Status Badges */}
                    <div className="absolute top-6 right-6 z-30 space-y-3">
                      {/* Removed trending badge for cleaner design */}
                      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl border-2 border-green-400">
                        {currentManhwa.status}
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="absolute bottom-6 left-6 right-6 z-30">
                      <div className="bg-black/80 backdrop-blur-xl text-white p-4 rounded-2xl border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold">Ação Rápida</div>
                          <div className="flex space-x-2">
                            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-bold">
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4 z-30">
          {featuredManhwas.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`relative transition-all duration-500 ${
                index === currentSlide 
                  ? 'w-12 h-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-lg shadow-amber-400/50' 
                  : 'w-3 h-3 bg-white/30 hover:bg-white/50 rounded-full'
              }`}
            >
              {index === currentSlide && (
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full blur-md opacity-75"></div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Enhanced New Series Section */}
      <section className="py-20 px-6 relative">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-4">
              <div className="w-1 h-12 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-white">Novas Séries</h2>
                <p className="text-slate-400">Séries recentemente adicionadas</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 hover:border-amber-400/50 hover:text-amber-400 transition-all duration-300 px-6 py-3 rounded-2xl font-semibold">
                Ver Todos
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {newSeries.map((manhwa, index) => (
              <ManhwaCard 
                key={manhwa.id} 
                manhwa={manhwa} 
                onClick={onNavigate}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Trending Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-purple-500/5"></div>
        <div className="container mx-auto relative z-10">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-4">
              <div className="w-1 h-12 bg-gradient-to-b from-red-400 to-orange-500 rounded-full"></div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-white flex items-center space-x-3">
                  <span>Em Alta</span>
                  <Award className="h-8 w-8 text-amber-400" />
                </h2>
                <p className="text-slate-400">Os mais populares da semana</p>
              </div>
            </div>
            <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 hover:border-red-400/50 hover:text-red-400 transition-all duration-300 px-6 py-3 rounded-2xl font-semibold">
              Ver Ranking Completo
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {featuredManhwas.slice(0, 5).map((manhwa, index) => (
              <ManhwaCard 
                key={manhwa.id} 
                manhwa={manhwa} 
                onClick={onNavigate}
                variant="trending"
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Latest Releases */}
      <section className="py-20 px-6 relative">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-4">
              <div className="w-1 h-12 bg-gradient-to-b from-green-400 to-blue-500 rounded-full"></div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-white flex items-center space-x-3">
                  <span>Últimos Lançamentos</span>
                  <Calendar className="h-8 w-8 text-green-400" />
                </h2>
                <p className="text-slate-400">Atualizações mais recentes</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 hover:border-green-400/50 hover:text-green-400 transition-all duration-300 px-6 py-3 rounded-2xl font-semibold">
                Ver Todos
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {ultimosLancamentos.map((manhwa, index) => (
              <ManhwaCard 
                key={manhwa.id} 
                manhwa={manhwa} 
                onClick={onNavigate}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-black/60 to-slate-900/60 border-t border-white/10 py-12 backdrop-blur-xl">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <LogoIcon className="text-amber-400 group-hover:text-amber-300 transition-colors duration-300 transform group-hover:scale-110" />
                <div className="absolute -inset-2 bg-amber-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                MANNA
              </span>
            </div>
            
            <p className="text-center text-slate-400 max-w-md">
              Sua plataforma favorita para descobrir e ler os melhores manhwas com a melhor experiência de leitura.
            </p>
            
            <div className="flex items-center space-x-6 text-slate-500">
              <span className="text-sm">© 2024 MANNA</span>
              <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
              <span className="text-sm">Todos os direitos reservados</span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out forwards;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.8s ease-out forwards;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.8s ease-out forwards;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      {/* Modal de Logout Personalizado */}
      <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <LogOut className="h-8 w-8 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Confirmar Logout
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Tem certeza que deseja sair da sua conta? Você precisará fazer login novamente para acessar o sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowLogoutModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                logout();
                setShowLogoutModal(false);
              }}
            >
              Sair
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Login Necessário */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-amber-600" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Login Necessário
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Para favoritar, salvar ou comentar manhwas, você precisa estar logado. Faça login para ter acesso a todas as funcionalidades!
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowLoginModal(false)}
            >
              Continuar Navegando
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
              onClick={() => {
                setShowLoginModal(false);
                onNavigate?.('auth');
              }}
            >
              Fazer Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}