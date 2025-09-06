'use client';

import { useState } from 'react';
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
import { useUser } from '@auth0/nextjs-auth0/client';
import { LogoIcon } from '@/components/ui/logo';
import {
  ChevronLeft, Mail, Shield, Calendar,
  BookOpen, Heart, Bookmark, Flame, Pencil,
  Settings, Activity
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
  const { user, isLoading } = useUser();
  const [loadingProfile] = useState(false); // Para futuro uso com SWR

  const userRoles = user?.['https://manna-app.com/roles'] || ['reader'];

  // Dados de fallback enquanto não há backend
  const profileData = {
    name: user?.name ?? 'Usuário',
    email: user?.email ?? 'email@exemplo.com',
    avatarUrl: user?.picture ?? undefined,
    lastLoginISO: user?.updated_at ?? new Date().toISOString(),
    roles: userRoles,
    stats: {
      readCount: 12,
      favoritesCount: 8,
      inProgressCount: 3,
      readingStreakDays: 7,
      monthlyGoalPercent: 65
    },
    achievements: [
      { id: '1', label: 'Primeiro Manhwa', description: 'Leu seu primeiro manhwa' },
      { id: '2', label: 'Leitor Dedicado', description: 'Leu por 7 dias seguidos' },
      { id: '3', label: 'Colecionador', description: 'Favoritou 5+ manhwas' }
    ],
    recentActivity: [
      {
        id: '1',
        type: 'read',
        title: 'Leu "Solo Leveling" - Capítulo 25',
        whenISO: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        meta: 'Ação, Fantasia'
      },
      {
        id: '2',
        type: 'favorite',
        title: 'Adicionou "Tower of God" aos favoritos',
        whenISO: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        type: 'start',
        title: 'Começou a ler "The Beginning After The End"',
        whenISO: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  };

  const loading = isLoading || loadingProfile;

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
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_80%_at_50%_0%,_rgba(120,119,198,0.25)_0%,_rgba(0,0,0,0)_60%)]" />
        <div className="container mx-auto px-4 pt-8">
          <Card className="border border-border/60 overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-purple-600/20 via-fuchsia-600/20 to-indigo-600/20" />
            <div className="-mt-10 px-6 md:px-8">
              <div className="flex flex-col md:flex-row md:items-end gap-6 pb-6">
                {loading ? (
                  <Skeleton className="h-24 w-24 rounded-full border" />
                ) : (
                  <Avatar className="h-24 w-24 ring-4 ring-background -mt-2">
                    <AvatarImage src={profileData.avatarUrl} alt={profileData.name} />
                    <AvatarFallback className="text-2xl">{profileData.name?.[0]?.toUpperCase() ?? 'U'}</AvatarFallback>
                  </Avatar>
                )}

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                        {loading ? <Skeleton className="h-8 w-64" /> : profileData.name}
                      </h2>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        {loading ? (
                          <Skeleton className="h-4 w-40" />
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {profileData.email}
                          </span>
                        )}
                        <Separator orientation="vertical" className="hidden md:block h-4" />
                        {loading ? (
                          <Skeleton className="h-4 w-32" />
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Último login: {formatDate(profileData.lastLoginISO ?? Date.now())}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {loading ? (
                          <>
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-20" />
                          </>
                        ) : (
                          profileData.roles?.map((role) => (
                            <Badge
                              key={role}
                              variant={getRoleVariant(role)}
                              className="capitalize"
                            >
                              <Shield className="h-3.5 w-3.5 mr-1" />
                              {getRoleLabel(role)}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="secondary">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurações
                      </Button>
                      <Button>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar Perfil
                      </Button>
                    </div>
                  </div>
                </div>
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
                  <StatCard icon={BookOpen} label="Manhwas Lidos" value={profileData.stats.readCount} />
                  <StatCard icon={Heart} label="Favoritos" value={profileData.stats.favoritesCount} color="text-red-500" />
                  <StatCard icon={Bookmark} label="Em Andamento" value={profileData.stats.inProgressCount} color="text-blue-500" />
                  <StatCard icon={Flame} label="Streak (dias)" value={profileData.stats.readingStreakDays} color="text-orange-500" />
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
                      <span className="font-medium">{profileData.stats.monthlyGoalPercent}%</span>
                    </div>
                    <Progress value={profileData.stats.monthlyGoalPercent} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      Meta: Ler 20 manhwas este mês
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
                  ) : profileData.recentActivity?.length ? (
                    profileData.recentActivity.map((activity) => (
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
                    ) : profileData.achievements?.length ? (
                      profileData.achievements.map((achievement) => (
                        <div key={achievement.id} className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                            <span className="text-sm">🏆</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{achievement.label}</p>
                            {achievement.description && (
                              <p className="text-xs text-muted-foreground">{achievement.description}</p>
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
                ) : profileData.recentActivity?.length ? (
                  profileData.recentActivity.map((activity) => (
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
                      <p className="text-muted-foreground">{profileData.name}</p>
                    </div>
                    <div>
                      <p className="font-medium">Email:</p>
                      <p className="text-muted-foreground">{profileData.email}</p>
                    </div>
                    <div>
                      <p className="font-medium">Último login:</p>
                      <p className="text-muted-foreground">{formatDate(profileData.lastLoginISO ?? Date.now())}</p>
                    </div>
                    <div>
                      <p className="font-medium">Tipo de conta:</p>
                      <div className="flex gap-1">
                        {profileData.roles.map((role) => (
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
