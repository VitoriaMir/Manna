'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LogoIcon } from '@/components/ui/logo';
import { AuthStatus } from '@/components/auth/AuthButtons';
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
  Clock
} from 'lucide-react';



// Dados de exemplo baseados na imagem e HTML
const featuredManhwas = [
  {
    id: 1,
    title: "Ser Uma Vilã Não é Muito Melhor?",
    description: "A vida de uma vilã pode ser surpreendentemente melhor do que ser a heroína...",
    cover: "/images/manhwas/ser-uma-vila-nao-e-muito-melhor.webp",
    banner: "/images/manhwas/ser-uma-vila-nao-e-muito-melhor.webp",
    author: "Mang Go Kim, Mundo & Yoleh",
    genres: ["Romance", "Drama", "Fantasia"],
    rating: 4.8,
    views: "2.5M",
    status: "Em andamento",
    isHot: true,
    chapters: 45
  },
  {
    id: 2,
    title: "Eu Me Tornei a Serva do Tirano",
    description: "Uma ex-funcionária de call center é transportada para um romance de fantasia, onde se torna a “serva” do protagonista ...",
    cover: "/images/manhwas/me-tornei-serva.jpg",
    banner: "/images/manhwas/me-tornei-serva.jpg",
    author: "Kim Soo-jin",
    genres: ["Romance", "Fantasia", "Reencarnação"],
    rating: 4.7,
    views: "1.8M",
    status: "Em andamento"
  },
  {
    id: 3,
    title: "Não é uma história típica de reencarnação",
    description: "Nem todos os vilões são maus. Quando Suna Choi...",
    cover: "/images/manhwas/not-your-typical.jpg",
    banner: "/images/manhwas/not-your-typical.jpg",
    author: "Lee Min-ho",
    genres: ["Ação", "Fantasia", "Magia"],
    rating: 4.9,
    views: "3.2M",
    status: "Completo"
  }
];

const newSeries = [
  {
    id: 4,
    title: "My Fake Crush",
    cover: "/images/manhwas/my-fake-crush.jpg",
    category: "Slice Of Life",
    genres: ["Shoujo"],
    badge: "NOVO"
  },
  {
    id: 5,
    title: "Desejos Bestiais",
    cover: "/images/manhwas/desejos-bestiais.jpg",
    category: "Sobrenatural",
    genres: ["Romance"],
    badge: "NOVO"
  },
  {
    id: 6,
    title: "Por Trás da Fachada Alegre da Princesa Sobrevivente",
    cover: "/images/manhwas/por-tras-da-fachada.jpg",
    category: "Romance",
    genres: ["Fantasia"],
    badge: "NOVO"
  },
  {
    id: 7,
    title: "Como Enviar Seu Marido para o Inferno",
    cover: "/images/manhwas/how-send-husband.jpg",
    category: "Romance",
    genres: ["Drama"],
    badge: "NOVO"
  },
  {
    id: 8,
    title: "Lágrimas em uma flor murcha",
    cover: "/images/manhwas/tear-on-a-flowers.jpg",
    category: "Shoujo",
    genres: ["Fantasia"],
    badge: "NOVO"
  },
  {
    id: 9,
    title: "Criando o Filho do Segundo Protagonista Masculino",
    cover: "/images/manhwas/segundo-filho.jpg",
    category: "Shoujo",
    genres: ["Romance"],
    badge: "NOVO"
  }
];

export function ManhwaHomePage({ onNavigate, onShowProfile, currentUser }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  // Auto-slide do carrossel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredManhwas.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentManhwa = featuredManhwas[currentSlide];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('search');
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredManhwas.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredManhwas.length) % featuredManhwas.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10 transition-all duration-300">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo e Navegação */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <LogoIcon className="text-yellow-400" />
                <span className="text-xl font-bold text-white">MANNA</span>
              </div>
              
              <nav className="hidden md:flex items-center space-x-6 text-sm">
                <Button variant="ghost" className="text-white hover:text-yellow-400">
                  Página Inicial
                </Button>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" className="text-white hover:text-yellow-400">
                    📚 Biblioteca
                  </Button>
                </div>
                <Button variant="ghost" className="text-white hover:text-yellow-400">
                  Capítulos
                </Button>
                <Button variant="ghost" className="text-white hover:text-yellow-400">
                  Telegram
                </Button>
              </nav>
            </div>

            {/* Busca e User Actions */}
            <div className="flex items-center space-x-4">
              <form onSubmit={handleSearch} className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Buscar manhwas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/20"
                  />
                </div>
              </form>
              
              {currentUser ? (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-white">
                    <Bell className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onShowProfile} className="text-white">
                    <User className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <AuthStatus />
              )}
              
              <Button variant="ghost" size="sm" className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Carousel */}
      <section className="relative min-h-[70vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
          style={{ 
            backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.4)), url(${currentManhwa.banner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center'
          }}
        />
        
        {/* Navegação do Carousel */}
        <Button
          variant="ghost"
          size="sm"
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        {/* Conteúdo do Hero */}
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center pt-16">
          <div className="max-w-2xl text-white space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              {currentManhwa.title}
            </h1>
            
            <div className="flex items-center space-x-4 text-sm">
              <span>A {currentManhwa.author}</span>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span>{currentManhwa.rating}</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{currentManhwa.views}</span>
              </div>
            </div>
            
            <p className="text-lg text-gray-200 max-w-lg">
              {currentManhwa.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {currentManhwa.genres.map((genre) => (
                <Badge key={genre} variant="secondary" className="bg-white/20 text-white">
                  {genre}
                </Badge>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8">
                <Play className="h-4 w-4 mr-2" />
                Ler Agora
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Info className="h-4 w-4 mr-2" />
                Informações
              </Button>
            </div>
          </div>
        </div>

        {/* Indicadores do Carousel */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {featuredManhwas.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-yellow-400' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </section>



      {/* Novas Séries */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-6 w-6 text-yellow-400" />
              <h2 className="text-3xl font-bold text-white">Novas séries</h2>
            </div>
            <p className="text-gray-400 text-sm">Séries recentemente adicionadas</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {newSeries.map((manhwa) => (
              <div 
                key={manhwa.id} 
                className="bg-card text-card-foreground group relative overflow-hidden rounded-xl border border-white/10 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => onNavigate('reader', manhwa)}
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden">
                  <img
                    src={manhwa.cover}
                    alt={manhwa.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  
                  {/* Gradiente overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
                  
                  {/* Badge estilo novo */}
                  {manhwa.badge && (
                    <div className="absolute top-3 left-0">
                      <div className={`text-white rounded-r-md px-3 py-1 text-xs font-bold shadow-md relative ${
                        manhwa.badge === 'NOVO' ? 'bg-green-600' : 
                        manhwa.badge === 'HOT' ? 'bg-red-600' :
                        manhwa.badge === 'COMPLETO' ? 'bg-blue-600' :
                        'bg-yellow-600'
                      }`}>
                        {manhwa.badge}
                        <div className={`absolute -left-1 top-0 w-0 h-0 border-t-[14px] border-b-[14px] border-r-[4px] border-transparent ${
                          manhwa.badge === 'NOVO' ? 'border-r-green-700' : 
                          manhwa.badge === 'HOT' ? 'border-r-red-700' :
                          manhwa.badge === 'COMPLETO' ? 'border-r-blue-700' :
                          'border-r-yellow-700'
                        }`}></div>
                      </div>
                    </div>
                  )}
                  

                  
                  {/* Título na parte inferior */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
                    <h3 className="font-extrabold text-sm leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] line-clamp-2">
                      {manhwa.title}
                    </h3>
                    
                    {/* Informações adicionais */}
                    <div className="flex items-center justify-between text-xs text-gray-300">
                      <span className="bg-black/40 px-2 py-1 rounded-md">{manhwa.category}</span>
                      {manhwa.rating && (
                        <span className="text-green-400 font-semibold">{manhwa.rating}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Overlay de hover com ações */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Adicionar aos favoritos
                        }}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Adicionar à biblioteca
                        }}
                      >
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção Em Alta */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-8 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></div>
                <h2 className="text-3xl font-bold text-white">Em Alta</h2>
              </div>
            </div>
            <Button variant="outline" className="text-white border-white/30 hover:bg-white/10">
              Ver Todos
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredManhwas.slice(0, 3).map((manhwa, index) => (
              <Card 
                key={manhwa.id} 
                className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group overflow-hidden"
                onClick={() => onNavigate('reader', manhwa)}
              >
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="relative w-32 h-45 flex-shrink-0 overflow-hidden rounded-l-lg">
                      <img
                        src={manhwa.cover}
                        alt={manhwa.title}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-red-600 text-white text-xs font-bold">
                          #{index + 1}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex-1 p-4">
                      <h3 className="font-bold text-white text-lg mb-2 group-hover:text-yellow-400 transition-colors">
                        {manhwa.title}
                      </h3>
                      
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                        {manhwa.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span>{manhwa.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{manhwa.views}</span>
                        </div>
                        {manhwa.chapters && (
                          <div className="flex items-center space-x-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{manhwa.chapters} caps</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {manhwa.genres.slice(0, 2).map((genre) => (
                          <Badge 
                            key={genre} 
                            variant="secondary"
                            className="text-xs bg-white/20 text-white"
                          >
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/30 border-t border-white/10 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center text-center text-gray-400">
            <div className="flex items-center space-x-2">
              <LogoIcon className="text-yellow-400" />
              <span className="font-semibold">MANNA</span>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            Sua plataforma favorita para ler manhwas
          </p>
        </div>
      </footer>
    </div>
  );
}
