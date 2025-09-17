'use client';

import { useState, useEffect } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/components/providers/CustomAuthProvider';
import { LogoIcon } from '@/components/ui/logo';
import { useUserProfile } from '@/hooks/use-user-profile';
import { UserSettings } from '@/components/ui/UserSettings';
import {
  ChevronLeft, Mail, Shield, Calendar,
  BookOpen, Heart, Bookmark, Flame, Pencil,
  Settings, Activity, RefreshCw
} from 'lucide-react';

// Fetcher function para SWR (futuro)
const fetcher = (url) => fetch(url).then((r) => {
  if (!r.ok) throw new Error('Falha ao buscar perfil');
  return r.json();
});

function StatCard({ icon: Icon, label, value, color = "text-primary" }) {
  return (
    <Card className="bg-card/60 backdrop-blur border-border/50 hover:shadow-md transition-shadow">
      <CardContent className="p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-2xl bg-primary/10 ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProfilePro({ onBack }) {
  const { user, isLoading: loading } = useUser();
  const { 
    profileData, 
    isLoading, 
    error, 
    updateProfile, 
    addActivity, 
    revalidate,
    isUpdating 
  } = useUserProfile();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBackgroundUpload, setShowBackgroundUpload] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Função para recarregar dados
  const handleRefresh = async () => {
    setIsRefreshing(true);
    revalidate();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Função para simular adição de atividade (para demonstração)
  const handleAddDemoActivity = async () => {
    try {
      await addActivity({
        type: 'read',
        title: 'Leu "Demon Slayer" - Capítulo 15',
        manhwaTitle: 'Demon Slayer',
        chapter: 15,
        meta: 'Ação, Supernatural'
      });
    } catch (error) {
      console.error('Erro ao adicionar atividade:', error);
    }
  };

  // Função para lidar com seleção de arquivo
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.');
        return;
      }
      
      setSelectedImage(file);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Função para fazer upload da imagem de fundo
  const handleUploadBackground = async () => {
    if (!selectedImage) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('background', selectedImage);
      
      const response = await fetch('/api/users/me/background', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('manna_auth_token')}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        // Atualizar o perfil com a nova imagem
        await updateProfile({ backgroundImage: data.imageUrl });
        setShowBackgroundUpload(false);
        setSelectedImage(null);
        setImagePreview(null);
        // Disparar evento para atualizar outras partes da UI
        window.dispatchEvent(new CustomEvent('background-updated'));
      } else {
        throw new Error('Erro ao fazer upload da imagem');
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  // Abrir modal de upload
  const handleOpenBackgroundUpload = () => {
    setShowBackgroundUpload(true);
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Fechar modal e limpar estados
  const handleCloseBackgroundUpload = () => {
    setShowBackgroundUpload(false);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleLabel = (role) => {
    const labels = {
      'creator': 'Criador',
      'reader': 'Leitor',
      'admin': 'Admin',
      'premium': 'Premium'
    };
    return labels[role] || role;
  };

  const getRoleVariant = (role) => {
    return (role === 'premium' || role === 'creator') ? 'default' : 'secondary';
  };

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Você precisa estar logado para ver o perfil.</p>
            <Button onClick={onBack}>Voltar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando perfil...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">Erro ao carregar perfil: {error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={onBack} variant="outline">Voltar</Button>
              <Button onClick={revalidate}>Tentar Novamente</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar componente de configurações se solicitado
  if (showSettings) {
    return <UserSettings onBack={() => setShowSettings(false)} />;
  }

  // Mostrar modal de upload de background se solicitado
  if (showBackgroundUpload) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-lg mx-auto">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCloseBackgroundUpload}
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Button>
              <CardTitle>Upload de Imagem de Fundo</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Área de Upload */}
            <div className="space-y-4">
              <label htmlFor="background-upload" className="block">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
                  <div className="space-y-2">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      📷
                    </div>
                    <div>
                      <p className="text-sm font-medium">Clique para selecionar uma imagem</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, JPEG até 5MB</p>
                    </div>
                  </div>
                </div>
              </label>
              <input
                id="background-upload"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {/* Preview da Imagem */}
            {imagePreview && (
              <div className="space-y-3">
                <h4 className="font-medium">Preview da Imagem:</h4>
                <div className="relative h-32 rounded-lg overflow-hidden border">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Nome: {selectedImage?.name}</p>
                  <p>Tamanho: {(selectedImage?.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={handleCloseBackgroundUpload}
                disabled={isUploading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleUploadBackground}
                disabled={!selectedImage || isUploading}
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Fundo'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-red-500 mb-4">Erro ao carregar perfil: {error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Tentar Novamente
              </Button>
              <Button variant="outline" onClick={onBack}>Voltar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              <LogoIcon />
              <h1 className="text-xl font-bold">Perfil do Usuário</h1>
            </div>
          </div>
          <div></div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_80%_at_50%_0%,_rgba(120,119,198,0.25)_0%,_rgba(0,0,0,0)_60%)]" />
        <div className="container mx-auto px-4 pt-8">
          <Card className="border border-border/60 overflow-hidden">
            {/* Background Image Section */}
            <div className="relative h-64 md:h-72">
              {/* Background Image */}
              {profileData?.backgroundImage ? (
                <img
                  src={profileData.backgroundImage}
                  alt="Background do perfil"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-fuchsia-600/20 to-indigo-600/20" />
              )}
              
              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-black/40" />

              {/* Edit Background Button - Top Right */}
              <Button 
                onClick={handleOpenBackgroundUpload} 
                disabled={isUpdating}
                title="Alterar imagem de fundo"
                className="absolute top-4 right-4 bg-white/70 hover:bg-white p-2 rounded-full shadow-lg border-0 h-auto"
                variant="ghost"
              >
                ✏️
              </Button>

              {/* Profile Info Overlay - Bottom Left */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex flex-col md:flex-row md:items-end gap-6">
                  {/* Avatar */}
                  {loading ? (
                    <Skeleton className="h-24 w-24 rounded-full border-4 border-white" />
                  ) : (
                    <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
                      <AvatarImage 
                        src={profileData?.avatarUrl} 
                        alt={profileData?.name || 'Avatar'} 
                        onLoad={() => console.log('Avatar loaded:', profileData?.avatarUrl)}
                        onError={() => console.log('Avatar failed to load:', profileData?.avatarUrl)}
                      />
                      <AvatarFallback className="text-2xl">{profileData?.name?.[0]?.toUpperCase() ?? 'U'}</AvatarFallback>
                    </Avatar>
                  )}

                  {/* User Info */}
                  <div className="flex-1 text-white">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight drop-shadow-lg">
                      {loading ? <Skeleton className="h-8 w-64 bg-white/20" /> : (profileData?.name || 'Nome não disponível')}
                    </h2>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/90">
                      {loading ? (
                        <Skeleton className="h-4 w-40 bg-white/20" />
                      ) : (
                        <span className="inline-flex items-center gap-1 drop-shadow">
                          <Mail className="h-4 w-4" />
                          {profileData?.email || 'Email não disponível'}
                        </span>
                      )}
                      <Separator orientation="vertical" className="hidden md:block h-4 bg-white/50" />
                      {loading ? (
                        <Skeleton className="h-4 w-32 bg-white/20" />
                      ) : (
                        <span className="inline-flex items-center gap-1 drop-shadow">
                          <Calendar className="h-4 w-4" />
                          Último login: {formatDate(profileData?.lastLoginISO ?? Date.now())}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {loading ? (
                        <>
                          <Skeleton className="h-6 w-16 bg-white/20" />
                          <Skeleton className="h-6 w-20 bg-white/20" />
                        </>
                      ) : (
                        profileData?.roles?.map((role) => (
                          <Badge
                            key={role}
                            variant="secondary"
                            className="capitalize bg-white/20 text-white border-white/30 backdrop-blur-sm"
                          >
                            <Shield className="h-3.5 w-3.5 mr-1" />
                            {getRoleLabel(role)}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Section - Below the background */}
            <div className="px-6 py-4 bg-card">
              <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                <Button 
                  variant="secondary" 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Atualizando...' : 'Atualizar'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowSettings(true)}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Editar Perfil
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-16">
        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="library">Biblioteca</TabsTrigger>
            <TabsTrigger value="activity">Atividade</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {loading ? (
                [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
              ) : (
                <>
                  <StatCard icon={BookOpen} label="Manhwas Lidos" value={profileData?.stats?.readCount || 0} />
                  <StatCard icon={Heart} label="Favoritos" value={profileData?.stats?.favoritesCount || 0} color="text-red-500" />
                  <StatCard icon={Bookmark} label="Em Andamento" value={profileData?.stats?.inProgressCount || 0} color="text-blue-500" />
                  <StatCard icon={Flame} label="Streak (dias)" value={profileData?.stats?.readingStreakDays || 0} color="text-orange-500" />
                </>
              )}
            </div>

            {/* Monthly Goal */}
            <Card>
              <CardHeader>
                <CardTitle>Meta do mês</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-3 w-full" />
                ) : (
                  <>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progresso de leitura</span>
                      <span className="font-medium">{profileData?.stats?.monthlyGoalPercent || 0}%</span>
                    </div>
                    <Progress value={profileData?.stats?.monthlyGoalPercent || 0} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      Meta: Ler {profileData?.stats?.monthlyGoal || 20} manhwas este mês ({profileData?.stats?.monthlyRead || 0} lidos)
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Activity and Achievements */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Atividade Recente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {loading ? (
                    [...Array(4)].map((_, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <Skeleton className="h-2 w-2 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                      </div>
                    ))
                  ) : profileData?.recentActivity?.length ? (
                    profileData?.recentActivity?.map((activity) => (
                      <div key={activity.id} className="flex gap-3">
                        <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                        <div className="flex-1">
                          <p className="text-sm leading-5">
                            <span className="font-medium">{activity.title}</span>
                            {activity.meta ? <span className="text-muted-foreground"> — {activity.meta}</span> : null}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDateTime(activity.whenISO)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Sem atividades ainda.</p>
                  )}
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle>Conquistas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {loading ? (
                      [...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      ))
                    ) : profileData?.achievements?.length ? (
                      profileData?.achievements?.map((achievement) => (
                        <div key={achievement.id} className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                            <span className="text-sm">{achievement.icon || '🏆'}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{achievement.label}</p>
                            {achievement.description && (
                              <p className="text-xs text-muted-foreground">{achievement.description}</p>
                            )}
                            {achievement.unlockedAt && (
                              <p className="text-xs text-green-600">
                                Desbloqueado em {formatDate(achievement.unlockedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Você ainda não tem conquistas. Continue lendo! 📚
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Library Tab */}
          <TabsContent value="library" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Minha Biblioteca</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Em breve: manhwas em andamento, fila de leitura e recomendações personalizadas.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico Completo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  [...Array(6)].map((_, i) => <Skeleton key={i} className="h-5 w-full" />)
                ) : profileData?.recentActivity?.length ? (
                  profileData?.recentActivity?.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <span className="text-sm font-medium">{activity.title}</span>
                        {activity.meta && (
                          <p className="text-xs text-muted-foreground">{activity.meta}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(activity.whenISO)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Sem histórico para mostrar.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preferências da Conta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Gerencie suas preferências de privacidade, notificações e aparência.
                  </div>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações Avançadas
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dados da Conta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Nome:</p>
                      <p className="text-muted-foreground">{profileData?.name || 'Nome não disponível'}</p>
                    </div>
                    <div>
                      <p className="font-medium">Email:</p>
                      <p className="text-muted-foreground">{profileData?.email || 'Email não disponível'}</p>
                    </div>
                    <div>
                      <p className="font-medium">Último login:</p>
                      <p className="text-muted-foreground">{formatDate(profileData?.lastLoginISO ?? Date.now())}</p>
                    </div>
                    <div>
                      <p className="font-medium">Tipo de conta:</p>
                      <div className="flex gap-1">
                        {(profileData?.roles || ['reader']).map((role) => (
                          <Badge key={role} variant="secondary" className="text-xs">
                            {getRoleLabel(role)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
