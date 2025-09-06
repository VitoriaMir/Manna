'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ContentManager } from '@/components/cms/ContentManager'
import { LogoIcon } from '@/components/ui/logo'
import ProfilePro from '@/components/ui/ProfilePro'
import {
    Book,
    BookOpen,
    Eye,
    Heart,
    MessageCircle,
    ChevronLeft,
    ChevronRight,
    Home,
    Search,
    Library,
    User,
    Moon,
    Sun,
    Plus,
    Upload,
    Edit3,
    Trash2,
    Save,
    Image as ImageIcon,
    FileText,
    Calendar,
    BarChart3,
    Settings,
    X,
    Filter,
    SlidersHorizontal,
    Star
} from 'lucide-react'
import { AuthStatus } from '@/components/auth/AuthButtons'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useTheme } from 'next-themes'

export default function App() {
    const [currentView, setCurrentView] = useState('home')
    const [manhwas, setManhwas] = useState([])
    const [currentManhwa, setCurrentManhwa] = useState(null)
    const [currentChapter, setCurrentChapter] = useState(0)
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [isCreatorMode, setIsCreatorMode] = useState(false)
    const [creatorData, setCreatorData] = useState({
        name: 'Creator Demo',
        email: 'creator@manna.com',
        totalSeries: 0,
        totalViews: 0
    })

    // Creator dashboard states
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showChapterDialog, setShowChapterDialog] = useState(false)
    const [selectedSeriesForChapter, setSelectedSeriesForChapter] = useState(null)
    const [newSeries, setNewSeries] = useState({
        title: '',
        description: '',
        cover: '',
        genres: [],
        status: 'Ongoing'
    })
    const [newChapter, setNewChapter] = useState({
        title: '',
        pages: []
    })
    const [pageUrls, setPageUrls] = useState([''])

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [availableGenres, setAvailableGenres] = useState([])
    const [filters, setFilters] = useState({
        genres: [],
        status: '',
        minRating: 0,
        maxRating: 5,
        sortBy: 'views',
        sortOrder: 'desc'
    })
    const [showFilters, setShowFilters] = useState(false)

    // Authenticated navigation button
    const AuthenticatedNavButton = () => {
        const { user } = useUser()
        const userRoles = user?.['https://manna-app.com/roles'] || []
        const isCreator = userRoles.includes('creator')

        if (!user) {
            return (
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex-col gap-1"
                    onClick={() => {
                        // Try direct login, fallback to demo mode if 502 error
                        try {
                            window.location.href = '/api/auth/login'
                        } catch (error) {
                            console.log('Login redirect failed, showing demo mode')
                            alert('Modo Demo: Em um ambiente de produção real, você seria redirecionado para o Auth0. As funcionalidades de creator estão disponíveis para demonstração.')
                            setCurrentView('creator-dashboard')
                        }
                    }}
                >
                    <User className="h-4 w-4" />
                    <span className="text-xs">Login</span>
                </Button>
            )
        }

        return (
            <Button
                variant="ghost"
                size="sm"
                className="flex-col gap-1"
                onClick={() => {
                    if (isCreator) {
                        setCurrentView('creator-dashboard')
                    } else {
                        setCurrentView('profile')
                    }
                }}
            >
                {isCreator ? <Upload className="h-4 w-4" /> : <User className="h-4 w-4" />}
                <span className="text-xs">{isCreator ? 'Creator' : 'Perfil'}</span>
            </Button>
        )
    }

    // Auth wrapper component
    const AuthStatusWrapper = ({ onNavigate }) => {
        const { user } = useUser()

        const handleNavigate = (view) => {
            onNavigate(view)
        }

        return <AuthStatus onNavigate={handleNavigate} />
    }

    useEffect(() => {
        setMounted(true)
        loadManhwas()
        loadAvailableGenres()
    }, [])

    // Debounced search effect
    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (searchQuery || Object.values(filters).some(f => f && f !== '' && (Array.isArray(f) ? f.length > 0 : true))) {
                performSearch()
            } else {
                setSearchResults([])
            }
        }, 300)

        return () => clearTimeout(delayedSearch)
    }, [searchQuery, filters])

    const loadManhwas = async () => {
        try {
            const response = await fetch('/api/manhwas')
            const data = await response.json()
            // Ensure data is always an array
            const manhwaList = Array.isArray(data) ? data : sampleManhwas
            setManhwas(manhwaList)
            setCreatorData(prev => ({ ...prev, totalSeries: manhwaList.length }))
        } catch (error) {
            console.error('Error loading manhwas:', error)
            setManhwas(sampleManhwas)
        }
    }

    const loadAvailableGenres = async () => {
        try {
            const response = await fetch('/api/manhwas/genres')
            const data = await response.json()
            setAvailableGenres(data.genres || [])
        } catch (error) {
            console.error('Error loading genres:', error)
            // Fallback to extracting genres from sample data
            const allGenres = new Set()
            sampleManhwas.forEach(manhwa => {
                manhwa.genres.forEach(genre => allGenres.add(genre))
            })
            setAvailableGenres([...allGenres].sort())
        }
    }

    const performSearch = async () => {
        setIsSearching(true)
        try {
            const params = new URLSearchParams()

            if (searchQuery) params.append('q', searchQuery)
            if (filters.genres.length > 0) params.append('genres', filters.genres.join(','))
            if (filters.status) params.append('status', filters.status)
            if (filters.minRating > 0) params.append('minRating', filters.minRating.toString())
            if (filters.maxRating < 5) params.append('maxRating', filters.maxRating.toString())
            params.append('sortBy', filters.sortBy)
            params.append('sortOrder', filters.sortOrder)

            const response = await fetch(`/api/manhwas/search?${params}`)
            const data = await response.json()

            setSearchResults(data.results || [])
        } catch (error) {
            console.error('Search error:', error)
            setSearchResults([])
        } finally {
            setIsSearching(false)
        }
    }

    const updateFilter = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const toggleGenreFilter = (genre) => {
        const newGenres = filters.genres.includes(genre)
            ? filters.genres.filter(g => g !== genre)
            : [...filters.genres, genre]

        updateFilter('genres', newGenres)
    }

    const clearAllFilters = () => {
        setFilters({
            genres: [],
            status: '',
            minRating: 0,
            maxRating: 5,
            sortBy: 'views',
            sortOrder: 'desc'
        })
        setSearchQuery('')
    }

    const getActiveFilterCount = () => {
        let count = 0
        if (filters.genres.length > 0) count++
        if (filters.status) count++
        if (filters.minRating > 0 || filters.maxRating < 5) count++
        return count
    }

    // Sample manhwa data with the images from vision expert
    const sampleManhwas = [
        {
            id: "manhwa-1",
            title: "Digital Dreams",
            author: "Artista Digital",
            description: "Uma jornada através de mundos digitais e realidade virtual onde os sonhos se tornam código.",
            cover: "https://images.unsplash.com/photo-1635399860495-2a2802a6df5e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYXJ0fGVufDB8fHxwdXJwbGV8MTc1NjA5NDM5Mnww&ixlib=rb-4.1.0&q=85",
            genres: ["Ficção Científica", "Drama"],
            rating: 4.8,
            views: 125000,
            status: "Ongoing",
            chapters: [
                {
                    id: "ch-1",
                    title: "Capítulo 1: Conectando",
                    pages: [
                        "https://images.unsplash.com/photo-1635399860495-2a2802a6df5e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYXJ0fGVufDB8fHxwdXJwbGV8MTc1NjA5NDM5Mnww&ixlib=rb-4.1.0&q=85",
                        "https://images.unsplash.com/photo-1565194637906-8f45f3351a5d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxjb21pYyUyMGlsbHVzdHJhdGlvbnxlbnwwfHx8cHVycGxlfDE3NTYwOTQzNzh8MA&ixlib=rb-4.1.0&q=85",
                        "https://images.unsplash.com/photo-1560211653-def0966f4537?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwyfHxjb21pYyUyMGlsbHVzdHJhdGlvbnxlbnwwfHx8cHVycGxlfDE3NTYwOTQzNzh8MA&ixlib=rb-4.1.0&q=85"
                    ]
                },
                {
                    id: "ch-2",
                    title: "Capítulo 2: O Despertar",
                    pages: [
                        "https://images.unsplash.com/photo-1651249098063-b3a8855e2a5a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHw0fHxhbmltZXxlbnwwfHx8cHVycGxlfDE3NTYwOTQzODR8MA&ixlib=rb-4.1.0&q=85",
                        "https://images.unsplash.com/photo-1617791160588-241658c0f566?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxkaWdpdGFsJTIwYXJ0fGVufDB8fHxwdXJwbGV8MTc1NjA5NDM5Mnww&ixlib=rb-4.1.0&q=85",
                        "https://images.pexels.com/photos/7233189/pexels-photo-7233189.jpeg"
                    ]
                }
            ]
        },
        {
            id: "manhwa-2",
            title: "Asas da Liberdade",
            author: "Creator Dreams",
            description: "A história de um jovem que descobre seus poderes especiais em um mundo cheio de mistérios.",
            cover: "https://images.unsplash.com/photo-1617791160588-241658c0f566?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxkaWdpdGFsJTIwYXJ0fGVufDB8fHxwdXJwbGV8MTc1NjA5NDM5Mnww&ixlib=rb-4.1.0&q=85",
            genres: ["Fantasia", "Aventura"],
            rating: 4.6,
            views: 98000,
            status: "Completed",
            chapters: [
                {
                    id: "ch-1",
                    title: "Capítulo 1: O Início",
                    pages: [
                        "https://images.unsplash.com/photo-1617791160588-241658c0f566?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxkaWdpdGFsJTIwYXJ0fGVufDB8fHxwdXJwbGV8MTc1NjA5NDM5Mnww&ixlib=rb-4.1.0&q=85",
                        "https://images.pexels.com/photos/7233189/pexels-photo-7233189.jpeg"
                    ]
                }
            ]
        }
    ]

    // Creator functions
    const handleCreateSeries = async () => {
        try {
            const seriesData = {
                ...newSeries,
                author: creatorData.name,
                rating: 0,
                views: 0,
                chapters: []
            }

            const response = await fetch('/api/manhwas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(seriesData)
            })

            if (response.ok) {
                await loadManhwas() // Refresh the list
                setNewSeries({ title: '', description: '', cover: '', genres: [], status: 'Ongoing' })
                setShowCreateDialog(false)
            }
        } catch (error) {
            console.error('Error creating series:', error)
        }
    }

    const handleCreateChapter = async () => {
        if (!selectedSeriesForChapter) return

        try {
            const chapterData = {
                ...newChapter,
                pages: pageUrls.filter(url => url.trim() !== '')
            }

            // For MVP, we'll update the local data
            const updatedManhwas = Array.isArray(manhwas) ? manhwas.map(manhwa => {
                if (manhwa.id === selectedSeriesForChapter.id) {
                    return {
                        ...manhwa,
                        chapters: [...manhwa.chapters, {
                            ...chapterData,
                            id: `ch-${manhwa.chapters.length + 1}`
                        }]
                    }
                }
                return manhwa
            }) : []

            setManhwas(updatedManhwas)
            setNewChapter({ title: '', pages: [] })
            setPageUrls([''])
            setShowChapterDialog(false)
        } catch (error) {
            console.error('Error creating chapter:', error)
        }
    }

    const addPageUrl = () => {
        setPageUrls([...pageUrls, ''])
    }

    const updatePageUrl = (index, url) => {
        const newUrls = [...pageUrls]
        newUrls[index] = url
        setPageUrls(newUrls)
    }

    const removePageUrl = (index) => {
        const newUrls = pageUrls.filter((_, i) => i !== index)
        setPageUrls(newUrls.length > 0 ? newUrls : [''])
    }

    const WebtoonReader = ({ manhwa, chapterIndex }) => {
        const chapter = manhwa.chapters[chapterIndex]
        const [currentPageIndex, setCurrentPageIndex] = useState(0)

        return (
            <div className="min-h-screen bg-background">
                {/* Reader Header */}
                <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
                    <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentView(isCreatorMode ? 'creator-dashboard' : 'home')}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Voltar
                            </Button>
                            <div>
                                <h1 className="font-semibold">{manhwa.title}</h1>
                                <p className="text-sm text-muted-foreground">{chapter.title}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {currentPageIndex + 1} / {chapter.pages.length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Reader Content - Vertical Scroll */}
                <ScrollArea className="h-[calc(100vh-80px)]">
                    <div className="container mx-auto px-4 py-6 max-w-3xl">
                        <div className="space-y-2">
                            {chapter.pages.map((page, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={page}
                                        alt={`Página ${index + 1}`}
                                        className="w-full rounded-lg shadow-lg"
                                        loading={index < 3 ? "eager" : "lazy"}
                                        onLoad={() => {
                                            if (index === currentPageIndex) {
                                                setCurrentPageIndex(index)
                                            }
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Chapter Navigation */}
                        <div className="flex justify-between items-center mt-8 pt-6 border-t">
                            <Button
                                variant="outline"
                                disabled={chapterIndex === 0}
                                onClick={() => setCurrentChapter(chapterIndex - 1)}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Capítulo Anterior
                            </Button>

                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="sm">
                                    <Heart className="h-4 w-4 mr-2" />
                                    Curtir
                                </Button>
                                <Button variant="ghost" size="sm">
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Comentários
                                </Button>
                            </div>

                            <Button
                                variant="outline"
                                disabled={chapterIndex >= manhwa.chapters.length - 1}
                                onClick={() => setCurrentChapter(chapterIndex + 1)}
                            >
                                Próximo Capítulo
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </ScrollArea>
            </div>
        )
    }

    const ProfilePage = () => {
        const { user, isLoading } = useUser()

        if (isLoading) {
            return (
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            )
        }

        const userRoles = user?.['https://manna-app.com/roles'] || []

        return (
            <div className="min-h-screen bg-background">
                <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
                    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentView('home')}
                            >
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

                <div className="container mx-auto px-4 py-8">
                    <Card className="max-w-2xl mx-auto">
                        <CardHeader>
                            <div className="flex items-center space-x-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={user?.picture} alt={user?.name} />
                                    <AvatarFallback className="text-2xl">
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-2xl">{user?.name}</CardTitle>
                                    <p className="text-muted-foreground">{user?.email}</p>
                                    <div className="flex gap-2 mt-2">
                                        {userRoles.map(role => (
                                            <Badge key={role} variant={role === 'creator' ? 'default' : 'secondary'}>
                                                {role === 'creator' ? 'Criador' : 'Leitor'}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold mb-2">Informações da Conta</h3>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Email:</strong> {user?.email}</p>
                                    <p><strong>Nome:</strong> {user?.name}</p>
                                    <p><strong>Último login:</strong> {user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}</p>
                                    <p><strong>Roles:</strong> {userRoles.join(', ') || 'Nenhuma'}</p>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="font-semibold mb-2">Estatísticas</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <Card>
                                        <CardContent className="p-4 text-center">
                                            <BookOpen className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                                            <p className="text-2xl font-bold">0</p>
                                            <p className="text-sm text-muted-foreground">Manhwas Lidos</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4 text-center">
                                            <Heart className="h-8 w-8 mx-auto mb-2 text-red-600" />
                                            <p className="text-2xl font-bold">0</p>
                                            <p className="text-sm text-muted-foreground">Favoritos</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {userRoles.includes('creator') && (
                                <>
                                    <Separator />
                                    <div>
                                        <h3 className="font-semibold mb-4">Ferramentas do Criador</h3>
                                        <Button
                                            className="w-full"
                                            onClick={() => setCurrentView('creator-dashboard')}
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Ir para Creator Studio
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    const CreatorDashboard = () => (
        <RoleGuard requiredRoles={['creator']}>
            <CreatorDashboardContent />
        </RoleGuard>
    )

    const CreatorDashboardContent = () => {
        const { user } = useUser()
        const [activeTab, setActiveTab] = useState('overview')

        return (
            <div className="min-h-screen bg-background">
                {/* Creator Header */}
                <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
                    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <LogoIcon />
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
                                    Manna Creator Studio
                                </h1>
                                <p className="text-sm text-muted-foreground">Sistema de Gerenciamento de Conteúdo</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setIsCreatorMode(false)
                                    setCurrentView('home')
                                }}
                            >
                                Ver Site
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            >
                                {mounted && theme === 'dark' ?
                                    <Sun className="h-4 w-4" /> :
                                    <Moon className="h-4 w-4" />
                                }
                            </Button>
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.picture} alt={user?.name} />
                                <AvatarFallback>
                                    {user?.name?.charAt(0).toUpperCase() || 'C'}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </header>

                <div className="container mx-auto px-4 py-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                            <TabsTrigger value="content">Gerenciar Conteúdo</TabsTrigger>
                            <TabsTrigger value="analytics">Análises</TabsTrigger>
                            <TabsTrigger value="settings">Configurações</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview">
                            <div className="space-y-6">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Total de Séries</CardTitle>
                                            <Book className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{manhwas.length}</div>
                                            <p className="text-xs text-muted-foreground">
                                                +2 desde o mês passado
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Total de Visualizações</CardTitle>
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {manhwas.reduce((total, manhwa) => total + manhwa.views, 0).toLocaleString()}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                +15% desde o mês passado
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Capítulos Publicados</CardTitle>
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {manhwas.reduce((total, manhwa) => total + manhwa.chapters.length, 0)}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                +3 esta semana
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
                                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {manhwas.length > 0 ?
                                                    (manhwas.reduce((total, manhwa) => total + manhwa.rating, 0) / manhwas.length).toFixed(1)
                                                    : '0.0'
                                                }
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                ⭐ Excelente
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Recent Activity */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Suas Séries Ativas</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {manhwas.slice(0, 3).map((manhwa) => (
                                                <div key={manhwa.id} className="flex items-center gap-4 p-4 border rounded-lg">
                                                    <img
                                                        src={manhwa.cover}
                                                        alt={manhwa.title}
                                                        className="w-16 h-20 object-cover rounded"
                                                    />
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold">{manhwa.title}</h3>
                                                        <p className="text-sm text-muted-foreground">{manhwa.description}</p>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <span className="text-sm">{manhwa.chapters.length} capítulos</span>
                                                            <span className="text-sm">{manhwa.views.toLocaleString()} visualizações</span>
                                                            <Badge variant={manhwa.status === 'Ongoing' ? 'default' : 'secondary'}>
                                                                {manhwa.status === 'Ongoing' ? 'Em Andamento' : 'Completa'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline">
                                                            <Edit3 className="h-4 w-4 mr-2" />
                                                            Editar
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setCurrentManhwa(manhwa)
                                                                setCurrentChapter(0)
                                                                setCurrentView('reader')
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Visualizar
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}

                                            {manhwas.length === 0 && (
                                                <div className="text-center py-8">
                                                    <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                    <h3 className="font-semibold mb-2">Nenhuma série criada ainda</h3>
                                                    <p className="text-muted-foreground mb-4">
                                                        Use a aba "Gerenciar Conteúdo" para criar sua primeira série!
                                                    </p>
                                                    <Button onClick={() => setActiveTab('content')}>
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Criar Primeira Série
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Content Management Tab */}
                        <TabsContent value="content">
                            <ContentManager user={user} />
                        </TabsContent>

                        {/* Analytics Tab */}
                        <TabsContent value="analytics">
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Análises de Performance</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-8">
                                            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="font-semibold mb-2">Análises Detalhadas</h3>
                                            <p className="text-muted-foreground">
                                                Funcionalidade em desenvolvimento. Em breve você terá acesso a:
                                            </p>
                                            <ul className="text-sm text-muted-foreground mt-4 space-y-1">
                                                <li>• Métricas de visualização por capítulo</li>
                                                <li>• Análise de engajamento dos leitores</li>
                                                <li>• Estatísticas de retenção</li>
                                                <li>• Relatórios de receita</li>
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Settings Tab */}
                        <TabsContent value="settings">
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Configurações do Creator</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-8">
                                            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="font-semibold mb-2">Configurações</h3>
                                            <p className="text-muted-foreground">
                                                Funcionalidade em desenvolvimento. Em breve você poderá configurar:
                                            </p>
                                            <ul className="text-sm text-muted-foreground mt-4 space-y-1">
                                                <li>• Perfil público do criador</li>
                                                <li>• Configurações de monetização</li>
                                                <li>• Notificações e alertas</li>
                                                <li>• Privacidade e segurança</li>
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        )
    }

    const SearchPage = () => {
        const displayResults = searchQuery || getActiveFilterCount() > 0 ? searchResults : manhwas

        return (
            <div className="min-h-screen bg-background">
                {/* Search Header */}
                <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center gap-3 mb-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentView('home')}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Voltar
                            </Button>
                            <div className="flex items-center gap-2">
                                <LogoIcon />
                                <h1 className="text-xl font-bold">Buscar Manhwas</h1>
                            </div>
                        </div>

                        {/* Search Input */}
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Busque por título, autor ou descrição..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Sheet open={showFilters} onOpenChange={setShowFilters}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="relative">
                                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                                        Filtros
                                        {getActiveFilterCount() > 0 && (
                                            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-purple-600">
                                                {getActiveFilterCount()}
                                            </Badge>
                                        )}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>Filtros</SheetTitle>
                                        <SheetDescription>
                                            Refine sua busca usando os filtros abaixo
                                        </SheetDescription>
                                    </SheetHeader>

                                    <div className="space-y-6 mt-6">
                                        {/* Sort Options */}
                                        <div>
                                            <Label className="text-sm font-medium">Ordenar por</Label>
                                            <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                                                <SelectTrigger className="mt-2">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="views">Mais Visualizados</SelectItem>
                                                    <SelectItem value="rating">Melhor Avaliados</SelectItem>
                                                    <SelectItem value="title">Ordem Alfabética</SelectItem>
                                                    <SelectItem value="createdAt">Mais Recentes</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Status Filter */}
                                        <div>
                                            <Label className="text-sm font-medium">Status</Label>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {['', 'Ongoing', 'Completed', 'Hiatus'].map((status) => (
                                                    <Button
                                                        key={status}
                                                        variant={filters.status === status ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => updateFilter('status', status)}
                                                    >
                                                        {status === '' ? 'Todos' :
                                                            status === 'Ongoing' ? 'Em Andamento' :
                                                                status === 'Completed' ? 'Completo' : 'Hiato'}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Rating Filter */}
                                        <div>
                                            <Label className="text-sm font-medium">
                                                Avaliação: {filters.minRating.toFixed(1)} - {filters.maxRating.toFixed(1)} ⭐
                                            </Label>
                                            <div className="space-y-3 mt-2">
                                                <div>
                                                    <Label className="text-xs">Mínima</Label>
                                                    <Slider
                                                        value={[filters.minRating]}
                                                        onValueChange={([value]) => updateFilter('minRating', value)}
                                                        max={5}
                                                        step={0.1}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Máxima</Label>
                                                    <Slider
                                                        value={[filters.maxRating]}
                                                        onValueChange={([value]) => updateFilter('maxRating', value)}
                                                        max={5}
                                                        step={0.1}
                                                        className="mt-1"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Genre Filter */}
                                        <div>
                                            <Label className="text-sm font-medium">Gêneros</Label>
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                {availableGenres.map((genre) => (
                                                    <div key={genre} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={genre}
                                                            checked={filters.genres.includes(genre)}
                                                            onCheckedChange={() => toggleGenreFilter(genre)}
                                                        />
                                                        <Label htmlFor={genre} className="text-sm">
                                                            {genre}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Clear Filters */}
                                        <Button
                                            variant="outline"
                                            onClick={clearAllFilters}
                                            className="w-full"
                                            disabled={getActiveFilterCount() === 0 && !searchQuery}
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Limpar Filtros
                                        </Button>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>

                        {/* Active Filters */}
                        {(searchQuery || getActiveFilterCount() > 0) && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {searchQuery && (
                                    <Badge variant="secondary" className="gap-1">
                                        Busca: "{searchQuery}"
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => setSearchQuery('')}
                                        />
                                    </Badge>
                                )}
                                {filters.genres.map(genre => (
                                    <Badge key={genre} variant="secondary" className="gap-1">
                                        {genre}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => toggleGenreFilter(genre)}
                                        />
                                    </Badge>
                                ))}
                                {filters.status && (
                                    <Badge variant="secondary" className="gap-1">
                                        Status: {filters.status === 'Ongoing' ? 'Em Andamento' :
                                            filters.status === 'Completed' ? 'Completo' : filters.status}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => updateFilter('status', '')}
                                        />
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                {/* Search Results */}
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold">
                                {searchQuery || getActiveFilterCount() > 0 ? 'Resultados da Busca' : 'Todos os Manhwas'}
                            </h2>
                            {isSearching && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600" />
                            )}
                        </div>
                        <p className="text-muted-foreground">
                            {displayResults.length} {displayResults.length === 1 ? 'resultado' : 'resultados'}
                        </p>
                    </div>

                    {displayResults.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {displayResults.map((manhwa) => (
                                <Card
                                    key={manhwa.id}
                                    className="cursor-pointer hover:shadow-lg transition-shadow group"
                                    onClick={() => {
                                        setCurrentManhwa(manhwa)
                                        setCurrentChapter(0)
                                        setCurrentView('reader')
                                    }}
                                >
                                    <CardContent className="p-0">
                                        <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
                                            <img
                                                src={manhwa.cover}
                                                alt={manhwa.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute top-2 right-2">
                                                <Badge variant={manhwa.status === 'Ongoing' ? 'default' : 'secondary'}>
                                                    {manhwa.status === 'Ongoing' ? 'Em Andamento' :
                                                        manhwa.status === 'Completed' ? 'Completo' : manhwa.status}
                                                </Badge>
                                            </div>
                                            <div className="absolute top-2 left-2">
                                                <Badge className="bg-black/70 text-white">
                                                    ⭐ {manhwa.rating}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <h3 className="font-semibold text-lg mb-2 group-hover:text-purple-600 transition-colors line-clamp-1">
                                                {manhwa.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                por {manhwa.author}
                                            </p>
                                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                {manhwa.description}
                                            </p>

                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {manhwa.genres.slice(0, 2).map((genre) => (
                                                    <Badge key={genre} variant="outline" className="text-xs">
                                                        {genre}
                                                    </Badge>
                                                ))}
                                                {manhwa.genres.length > 2 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{manhwa.genres.length - 2}
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Eye className="h-3 w-3" />
                                                    {manhwa.views.toLocaleString()}
                                                </span>
                                                <span>{manhwa.chapters.length} capítulos</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="font-semibold mb-2">Nenhum resultado encontrado</h3>
                            <p className="text-muted-foreground mb-4">
                                Tente ajustar seus filtros ou usar palavras-chave diferentes
                            </p>
                            <Button onClick={clearAllFilters} variant="outline">
                                Limpar Filtros
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const HomePage = () => (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <LogoIcon />
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
                            Manna
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        >
                            {mounted && theme === 'dark' ?
                                <Sun className="h-4 w-4" /> :
                                <Moon className="h-4 w-4" />
                            }
                        </Button>
                        <AuthStatusWrapper onNavigate={setCurrentView} />
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative py-16 px-4">
                <div className="container mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                        Leia, publique e descubra manhwas
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Experiência de leitura contínua em formato webtoon. Descubra histórias incríveis e apoie seus criadores favoritos.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600">
                            <Book className="h-5 w-5 mr-2" />
                            Começar a Ler
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => setCurrentView('search')}
                        >
                            <Search className="h-5 w-5 mr-2" />
                            Descobrir Manhwas
                        </Button>
                    </div>
                </div>
            </section>

            {/* Featured Manhwas */}
            <section className="py-16 px-4">
                <div className="container mx-auto">
                    <h2 className="text-3xl font-bold mb-8">Manhwas em Destaque</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {manhwas && Array.isArray(manhwas) ? manhwas.map((manhwa) => (
                            <Card
                                key={manhwa.id}
                                className="cursor-pointer hover:shadow-lg transition-shadow group"
                                onClick={() => {
                                    setCurrentManhwa(manhwa)
                                    setCurrentChapter(0)
                                    setCurrentView('reader')
                                }}
                            >
                                <CardContent className="p-0">
                                    <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
                                        <img
                                            src={manhwa.cover}
                                            alt={manhwa.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-2 right-2">
                                            <Badge variant={manhwa.status === 'Ongoing' ? 'default' : 'secondary'}>
                                                {manhwa.status === 'Ongoing' ? 'Em Andamento' : 'Completo'}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="font-semibold text-lg mb-2 group-hover:text-purple-600 transition-colors">
                                            {manhwa.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            por {manhwa.author}
                                        </p>
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                            {manhwa.description}
                                        </p>

                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {manhwa.genres.map((genre) => (
                                                <Badge key={genre} variant="outline" className="text-xs">
                                                    {genre}
                                                </Badge>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <div className="flex items-center gap-4">
                                                <span className="flex items-center gap-1">
                                                    <Eye className="h-3 w-3" />
                                                    {manhwa.views.toLocaleString()}
                                                </span>
                                                <span>⭐ {manhwa.rating}</span>
                                            </div>
                                            <span>{manhwa.chapters.length} capítulos</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )) : (
                            <div className="col-span-full text-center py-8">
                                <p className="text-muted-foreground">Carregando manhwas...</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-around">
                        <Button variant="ghost" size="sm" className="flex-col gap-1">
                            <Home className="h-4 w-4" />
                            <span className="text-xs">Início</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex-col gap-1"
                            onClick={() => setCurrentView('search')}
                        >
                            <Search className="h-4 w-4" />
                            <span className="text-xs">Buscar</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex-col gap-1"
                            onClick={() => setCurrentView('library')}
                        >
                            <Library className="h-4 w-4" />
                            <span className="text-xs">Biblioteca</span>
                        </Button>
                        <AuthenticatedNavButton />
                    </div>
                </div>
            </nav>
        </div>
    )

    if (currentView === 'reader' && currentManhwa) {
        return <WebtoonReader manhwa={currentManhwa} chapterIndex={currentChapter} />
    }

    if (currentView === 'creator-dashboard') {
        return <CreatorDashboard />
    }

    if (currentView === 'search') {
        return <SearchPage />
    }

    if (currentView === 'profile') {
        return (
            <RoleGuard requiredRoles={['creator', 'reader']} fallback={<ProfilePro onBack={() => setCurrentView('home')} />}>
                <ProfilePro onBack={() => setCurrentView('home')} />
            </RoleGuard>
        )
    }

    if (currentView === 'library') {
        return (
            <RoleGuard requiredRoles={['creator', 'reader']}>
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <Card className="max-w-md">
                        <CardContent className="p-8 text-center">
                            <BookOpen className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                            <h2 className="text-xl font-semibold mb-2">Minha Biblioteca</h2>
                            <p className="text-muted-foreground">
                                Funcionalidade em desenvolvimento. Em breve você poderá gerenciar seus manhwas favoritos aqui!
                            </p>
                            <Button className="mt-4" onClick={() => setCurrentView('home')}>
                                Voltar ao Início
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </RoleGuard>
        )
    }

    return <HomePage />
}