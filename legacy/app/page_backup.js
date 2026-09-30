'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
import { LogoIcon } from '@/components/ui/logo'
import ProfilePro from '@/components/ui/ProfilePro'
import { ProfileApiDemo } from '@/components/ui/ProfileApiDemo'
import { UserSettings } from '@/components/ui/UserSettings'
import { ManhwaHomePage } from '@/components/ui/ManhwaHomePage'
import { AuthPage } from '@/components/auth/AuthPage'
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
    Star,
    LogOut,
    Award,
    Users,
    DollarSign,
    Bell,
    Shield,
    RotateCcw,
    TrendingUp
} from 'lucide-react'
import { AuthStatus } from '@/components/auth/AuthButtons'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { useUser } from '@/components/providers/CustomAuthProvider'
import { useAuth } from '@/components/providers/CustomAuthProvider'
import { useTheme } from 'next-themes'

export default function App() {
    const router = useRouter()
    const { user, isLoading } = useUser()
    const { logout } = useAuth()
    const [currentView, setCurrentView] = useState('home')
    const [showNewHomePage, setShowNewHomePage] = useState(true) // Nova home page por padrão
    const [manhwas, setManhwas] = useState([])
    const [loadingManhwas, setLoadingManhwas] = useState(true)
    const [currentManhwa, setCurrentManhwa] = useState(null)
    const [currentChapter, setCurrentChapter] = useState(0)
    const [selectedManhwaForDetails, setSelectedManhwaForDetails] = useState(null) // New state for manhwa details
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
        const userRoles = user?.roles || []
        const isCreator = userRoles.includes('creator')

        if (!user) {
            return (
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex-col gap-1"
                    onClick={() => {
                        // Navigate to our custom auth page
                        setCurrentView('auth')
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

    // Define loadManhwas before useEffect to avoid initialization errors
    const loadManhwas = useCallback(async () => {
        console.log('[LOAD_MANHWAS] Function called - start')
        setLoadingManhwas(true)
        try {
            // Try to load published content from public API first
            console.log('[LOAD_MANHWAS] Loading published content from public API...')

            const response = await fetch('/api/content/public?limit=10', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            console.log('[LOAD_MANHWAS] Public API response status:', response.status)

            if (response.ok) {
                const data = await response.json()
                console.log('[LOAD_MANHWAS] Loaded published content:', data)

                if (data.success && data.content?.length > 0) {
                    // Transform content data to manhwa format for dashboard compatibility
                    const transformedManhwas = data.content.map(content => ({
                        id: content._id,
                        title: content.title,
                        author: content.author || 'Autor Desconhecido',
                        description: content.description || 'Sem descrição disponível',
                        cover: content.coverImage || '/images/manhwas/default-cover.jpg',
                        genres: content.genres || ['Geral'],
                        rating: 4.5, // Default rating
                        views: content.views || 0,
                        status: content.status === 'published' ? 'Ongoing' : 'Draft',
                        chapters: [{
                            id: `${content._id}-ch1`,
                            title: 'Capítulo 1',
                            pages: content.pages || []
                        }]
                    }))

                    console.log('[LOAD_MANHWAS] Setting manhwas state:', transformedManhwas.length, 'items')
                    setManhwas(transformedManhwas)
                    console.log('[LOAD_MANHWAS] Setting creator data')
                    setCreatorData(prev => ({
                        ...prev,
                        totalSeries: transformedManhwas.length,
                        totalViews: transformedManhwas.reduce((sum, manhwa) => sum + manhwa.views, 0)
                    }))
                    console.log('[LOAD_MANHWAS] Dashboard updated with published content:', transformedManhwas)
                    return // Successfully loaded real data
                } else {
                    console.log('[LOAD_MANHWAS] No published content found, using sample data')
                }
            } else {
                const errorText = await response.text()
                console.error('[LOAD_MANHWAS] Failed to load published content:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText
                })
            }

            // Fallback to sample data
            console.log('[LOAD_MANHWAS] Using sample data as fallback')
            setManhwas(sampleManhwas)
            setCreatorData(prev => ({
                ...prev,
                totalSeries: sampleManhwas.length,
                totalViews: sampleManhwas.reduce((sum, manhwa) => sum + manhwa.views, 0)
            }))
        } catch (error) {
            console.error('[LOAD_MANHWAS] Error loading content:', error)
            // Fallback to sample data on error
            setManhwas(sampleManhwas)
        } finally {
            console.log('[LOAD_MANHWAS] Setting loading to false')
            setLoadingManhwas(false)
            console.log('[LOAD_MANHWAS] Function completed')
        }
    }, []) // No dependencies needed since we use public API

    useEffect(() => {
        console.log('[MOUNT_EFFECT] useEffect triggered - component mounting')
        setMounted(true)
        loadAvailableGenres()
        loadManhwas()

        // Check URL parameters for view
        const urlParams = new URLSearchParams(window.location.search)
        const viewParam = urlParams.get('view')
        if (viewParam && ['library', 'search', 'profile', 'creator-dashboard'].includes(viewParam)) {
            setCurrentView(viewParam)
        }

        console.log('[MOUNT_EFFECT] useEffect completed')
    }, []) // Empty dependency array to run only once

    // Remove the second useEffect that was causing the loop

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

    const LibraryPage = () => {
        const [libraryManhwas, setLibraryManhwas] = useState([])
        const [loadingLibrary, setLoadingLibrary] = useState(true)
        const [librarySearchQuery, setLibrarySearchQuery] = useState('')
        const [libraryFilters, setLibraryFilters] = useState({
            genres: [],
            status: '',
            sortBy: 'views',
            sortOrder: 'desc'
        })
        const [filteredManhwas, setFilteredManhwas] = useState([])

        // Load library manhwas
        useEffect(() => {
            const loadLibraryManhwas = async () => {
                setLoadingLibrary(true)
                try {
                    const response = await fetch('/api/content/public?limit=50')
                    if (response.ok) {
                        const data = await response.json()
                        if (data.success && data.content?.length > 0) {
                            const transformedManhwas = data.content.map(content => ({
                                id: content._id,
                                title: content.title,
                                author: content.author || 'Autor Desconhecido',
                                description: content.description || 'Sem descrição disponível',
                                cover: content.coverImage || '/images/manhwas/default-cover.jpg',
                                genres: content.genres || ['Geral'],
                                rating: 4.5, // Default rating
                                views: content.views || 0,
                                status: content.status === 'published' ? 'Ongoing' : 'Draft',
                                chapters: [{
                                    id: `${content._id}-ch1`,
                                    title: 'Capítulo 1',
                                    pages: content.pages || []
                                }]
                            }))
                            setLibraryManhwas(transformedManhwas)
                            setFilteredManhwas(transformedManhwas)
                        } else {
                            // Fallback to sample data if no published content
                            setLibraryManhwas(sampleManhwas)
                            setFilteredManhwas(sampleManhwas)
                        }
                    }
                } catch (error) {
                    console.error('Error loading library:', error)
                    setLibraryManhwas(sampleManhwas)
                    setFilteredManhwas(sampleManhwas)
                } finally {
                    setLoadingLibrary(false)
                }
            }
            loadLibraryManhwas()
        }, [])

        // Filter and search manhwas
        useEffect(() => {
            let filtered = [...libraryManhwas]

            // Apply search
            if (librarySearchQuery) {
                filtered = filtered.filter(manhwa =>
                    manhwa.title.toLowerCase().includes(librarySearchQuery.toLowerCase()) ||
                    manhwa.author.toLowerCase().includes(librarySearchQuery.toLowerCase()) ||
                    manhwa.description.toLowerCase().includes(librarySearchQuery.toLowerCase())
                )
            }

            // Apply genre filter
            if (libraryFilters.genres.length > 0) {
                filtered = filtered.filter(manhwa =>
                    manhwa.genres.some(genre => libraryFilters.genres.includes(genre))
                )
            }

            // Apply status filter
            if (libraryFilters.status) {
                filtered = filtered.filter(manhwa => manhwa.status === libraryFilters.status)
            }

            // Apply sorting
            filtered.sort((a, b) => {
                const order = libraryFilters.sortOrder === 'asc' ? 1 : -1
                switch (libraryFilters.sortBy) {
                    case 'title':
                        return a.title.localeCompare(b.title) * order
                    case 'rating':
                        return (a.rating - b.rating) * order
                    case 'views':
                    default:
                        return (a.views - b.views) * order
                }
            })

            setFilteredManhwas(filtered)
        }, [libraryManhwas, librarySearchQuery, libraryFilters])

        const handleManhwaClick = (manhwa) => {
            setSelectedManhwaForDetails(manhwa)
            setCurrentView('manhwa-details')
        }

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                {/* Background Effects */}
                <div className="fixed inset-0 z-0">
                    <div className="absolute top-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                {/* Header */}
                <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-amber-500/20">
                    <div className="container mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCurrentView('home')}
                                    className="text-white hover:text-amber-400"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Voltar
                                </Button>
                                <div className="flex items-center space-x-3">
                                    <LogoIcon className="text-amber-400 h-8 w-8" />
                                    <div>
                                        <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                                            Biblioteca
                                        </h1>
                                        <p className="text-slate-400 text-sm">Descubra novos manhwas</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="relative z-10 container mx-auto px-6 py-8">
                    {/* Search and Filters */}
                    <div className="mb-8 space-y-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar manhwas..."
                                        value={librarySearchQuery}
                                        onChange={(e) => setLibrarySearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-black/40 backdrop-blur-sm border border-amber-500/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={libraryFilters.sortBy}
                                    onChange={(e) => setLibraryFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                                    className="px-4 py-3 bg-black/40 backdrop-blur-sm border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
                                >
                                    <option value="views">Mais Vistos</option>
                                    <option value="rating">Melhor Avaliados</option>
                                    <option value="title">A-Z</option>
                                </select>
                                <select
                                    value={libraryFilters.status}
                                    onChange={(e) => setLibraryFilters(prev => ({ ...prev, status: e.target.value }))}
                                    className="px-4 py-3 bg-black/40 backdrop-blur-sm border border-amber-500/20 rounded-xl text-white focus:outline-none focus:border-amber-500"
                                >
                                    <option value="">Todos os Status</option>
                                    <option value="Ongoing">Em Andamento</option>
                                    <option value="Completed">Completo</option>
                                </select>
                            </div>
                        </div>

                        {/* Genre Filter Pills */}
                        <div className="flex flex-wrap gap-2">
                            {availableGenres.map(genre => (
                                <button
                                    key={genre}
                                    onClick={() => {
                                        const newGenres = libraryFilters.genres.includes(genre)
                                            ? libraryFilters.genres.filter(g => g !== genre)
                                            : [...libraryFilters.genres, genre]
                                        setLibraryFilters(prev => ({ ...prev, genres: newGenres }))
                                    }}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${libraryFilters.genres.includes(genre)
                                            ? 'bg-amber-500 text-black'
                                            : 'bg-black/40 text-slate-300 hover:bg-amber-500/20 hover:text-amber-300'
                                        }`}
                                >
                                    {genre}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mb-6">
                        <p className="text-slate-400">
                            {loadingLibrary ? 'Carregando...' : `${filteredManhwas.length} manhwa(s) encontrado(s)`}
                        </p>
                    </div>

                    {/* Manhwa Grid */}
                    {loadingLibrary ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex items-center gap-3 text-amber-400">
                                <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                                <span>Carregando biblioteca...</span>
                            </div>
                        </div>
                    ) : filteredManhwas.length === 0 ? (
                        <div className="text-center py-12">
                            <BookOpen className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">Nenhum manhwa encontrado</h3>
                            <p className="text-slate-400">Tente ajustar seus filtros de busca</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {filteredManhwas.map((manhwa) => (
                                <div
                                    key={manhwa.id}
                                    onClick={() => handleManhwaClick(manhwa)}
                                    className="bg-black/40 backdrop-blur-sm border border-amber-500/20 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 cursor-pointer group"
                                >
                                    <div className="aspect-[3/4] relative overflow-hidden">
                                        <img
                                            src={manhwa.cover}
                                            alt={manhwa.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                e.target.src = '/images/manhwas/default-cover.jpg'
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="flex items-center gap-2 text-xs text-white">
                                                <span className="flex items-center gap-1">
                                                    <Eye className="h-3 w-3" />
                                                    {manhwa.views.toLocaleString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Star className="h-3 w-3 fill-current text-yellow-400" />
                                                    {manhwa.rating}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                                            {manhwa.title}
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{manhwa.author}</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {manhwa.genres.slice(0, 2).map(genre => (
                                                <span
                                                    key={genre}
                                                    className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded-md"
                                                >
                                                    {genre}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <Badge
                                                variant={manhwa.status === 'Ongoing' ? 'default' : 'secondary'}
                                                className={manhwa.status === 'Ongoing'
                                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                    : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                                }
                                            >
                                                {manhwa.status === 'Ongoing' ? 'Em Andamento' : 'Completo'}
                                            </Badge>
                                            <span className="text-xs text-slate-400">
                                                {manhwa.chapters?.length || 0} cap.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const ManhwaDetailsPage = ({ manhwa, onBack, onReadChapter }) => {
        const [isLoadingChapters, setIsLoadingChapters] = useState(false)
        const [chapters, setChapters] = useState([])

        // Load chapters for this manhwa
        useEffect(() => {
            const loadChapters = async () => {
                setIsLoadingChapters(true)
                try {
                    // For now, we'll use the existing chapters from the manhwa data
                    // In a real application, you'd fetch chapters from an API
                    if (manhwa.chapters) {
                        setChapters(manhwa.chapters)
                    } else {
                        // Generate sample chapters if none exist
                        const sampleChapters = Array.from({ length: 15 }, (_, i) => ({
                            id: `ch-${i + 1}`,
                            title: `Capítulo ${i + 1}`,
                            number: i + 1,
                            publishedAt: new Date(Date.now() - (14 - i) * 24 * 60 * 60 * 1000),
                            pages: manhwa.chapters?.[0]?.pages || []
                        }))
                        setChapters(sampleChapters)
                    }
                } catch (error) {
                    console.error('Error loading chapters:', error)
                } finally {
                    setIsLoadingChapters(false)
                }
            }

            if (manhwa) {
                loadChapters()
            }
        }, [manhwa])

        if (!manhwa) {
            return null
        }

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                {/* Background Effects */}
                <div className="fixed inset-0 z-0">
                    <div className="absolute top-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                {/* Header */}
                <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-amber-500/20">
                    <div className="container mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onBack}
                                    className="text-white hover:text-amber-400"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Voltar
                                </Button>
                                <div className="flex items-center space-x-3">
                                    <LogoIcon className="text-amber-400 h-8 w-8" />
                                    <div>
                                        <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                                            {manhwa.title}
                                        </h1>
                                        <p className="text-slate-400 text-sm">Detalhes do Manhwa</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="relative z-10 container mx-auto px-6 py-8">
                    {/* Manhwa Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Cover and Basic Info */}
                        <div className="lg:col-span-1">
                            <div className="bg-black/40 backdrop-blur-sm border border-amber-500/20 rounded-xl overflow-hidden">
                                <div className="aspect-[3/4] relative">
                                    <img
                                        src={manhwa.cover}
                                        alt={manhwa.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = '/images/manhwas/default-cover.jpg'
                                        }}
                                    />
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-2">{manhwa.title}</h2>
                                        <p className="text-slate-400">{manhwa.author}</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Status:</span>
                                            <Badge
                                                variant={manhwa.status === 'Ongoing' ? 'default' : 'secondary'}
                                                className={manhwa.status === 'Ongoing'
                                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                    : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                                }
                                            >
                                                {manhwa.status === 'Ongoing' ? 'Em Andamento' : 'Completo'}
                                            </Badge>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Avaliação:</span>
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 fill-current text-yellow-400" />
                                                <span className="text-white">{manhwa.rating}</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Visualizações:</span>
                                            <span className="text-white">{manhwa.views.toLocaleString()}</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Tipo:</span>
                                            <span className="text-slate-300">Manhwa</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Capítulos:</span>
                                            <span className="text-white">{chapters.length}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-slate-300 mb-2">Gêneros</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {manhwa.genres.map(genre => (
                                                <span
                                                    key={genre}
                                                    className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded-md"
                                                >
                                                    {genre}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Button
                                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold"
                                            onClick={() => onReadChapter(manhwa, 0)}
                                        >
                                            <BookOpen className="h-4 w-4 mr-2" />
                                            Ler Primeiro
                                        </Button>

                                        <Button
                                            variant="outline"
                                            className="w-full text-amber-400 border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/10"
                                            onClick={() => onReadChapter(manhwa, chapters.length - 1)}
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            Ler Último
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description and Details */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="bg-black/40 backdrop-blur-sm border border-amber-500/20">
                                <CardHeader>
                                    <CardTitle className="text-white">Sinopse</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-300 leading-relaxed">
                                        {manhwa.description}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-black/40 backdrop-blur-sm border border-amber-500/20">
                                <CardHeader>
                                    <CardTitle className="text-white">Estatísticas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-amber-400">{manhwa.views.toLocaleString()}</div>
                                            <div className="text-sm text-slate-400">Visualizações</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-emerald-400">{chapters.length}</div>
                                            <div className="text-sm text-slate-400">Capítulos</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-yellow-400">{manhwa.rating}</div>
                                            <div className="text-sm text-slate-400">Avaliação</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-400">0</div>
                                            <div className="text-sm text-slate-400">Comentários</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Chapters List */}
                    <Card className="bg-black/40 backdrop-blur-sm border border-amber-500/20">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <FileText className="h-5 w-5 text-amber-400" />
                                Últimos Lançamentos de Capítulos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoadingChapters ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="flex items-center gap-3 text-amber-400">
                                        <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                                        <span>Carregando capítulos...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {chapters.slice(0, 18).map((chapter, index) => (
                                        <div
                                            key={chapter.id}
                                            onClick={() => onReadChapter(manhwa, index)}
                                            className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-white group-hover:text-amber-300 transition-colors">
                                                        {chapter.title}
                                                    </h3>
                                                    <p className="text-sm text-slate-400">
                                                        {chapter.publishedAt ? new Date(chapter.publishedAt).toLocaleDateString('pt-BR') : '31 de outubro de 2024'}
                                                    </p>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {chapters.length > 18 && (
                                <div className="flex justify-center mt-6">
                                    <Button
                                        variant="outline"
                                        className="text-amber-400 border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/10"
                                    >
                                        Mostrar mais
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Comments Section Placeholder */}
                    <Card className="bg-black/40 backdrop-blur-sm border border-amber-500/20 mt-8">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <MessageCircle className="h-5 w-5 text-amber-400" />
                                Comentários
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-white mb-2">Sistema de comentários em breve</h3>
                                <p className="text-slate-400">
                                    Em breve você poderá comentar e interagir com outros leitores!
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
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

        const userRoles = user?.roles || []

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
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                {/* Background Effects */}
                <div className="fixed inset-0 z-0">
                    <div className="absolute top-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
                </div>

                {/* Enhanced Creator Header */}
                <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-amber-500/20 shadow-2xl">
                    <div className="container mx-auto px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-3 group">
                                    <div className="relative">
                                        <LogoIcon className="text-amber-400 group-hover:text-amber-300 transition-colors duration-300 transform group-hover:scale-110 h-10 w-10" />
                                        <div className="absolute -inset-2 bg-amber-400/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                                            Manna Creator Studio
                                        </h1>
                                        <p className="text-slate-400 text-sm font-medium">Sistema de Gerenciamento de Conteúdo</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setIsCreatorMode(false)
                                        setCurrentView('home')
                                    }}
                                    className="text-white hover:text-amber-400 border-white/30 hover:border-amber-400 bg-transparent hover:bg-amber-500/10 transition-all duration-300"
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver Site
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="relative z-10 container mx-auto px-6 py-8">
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-lg text-gray-400">
                                Um novo sistema será criado em breve...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const SearchPage = () => {
                            <TabsTrigger
                                value="overview"
                                className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-black font-medium transition-all duration-300"
                            >
                                Visão Geral
                            </TabsTrigger>
                            <TabsTrigger
                                value="content"
                                className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-black font-medium transition-all duration-300"
                            >
                                Gerenciar Conteúdo
                            </TabsTrigger>
                            <TabsTrigger
                                value="analytics"
                                className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-black font-medium transition-all duration-300"
                            >
                                Análises
                            </TabsTrigger>
                            <TabsTrigger
                                value="settings"
                                className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-black font-medium transition-all duration-300"
                            >
                                Configurações
                            </TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview">
                            <div className="space-y-8">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <Card className="bg-black/40 backdrop-blur-sm border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 group">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                            <CardTitle className="text-sm font-medium text-white">Total de Séries</CardTitle>
                                            <Book className="h-5 w-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold text-white">{manhwas.length}</div>
                                            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                                                <span className="text-emerald-400">↗</span>
                                                +2 desde o mês passado
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-black/40 backdrop-blur-sm border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 group">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                            <CardTitle className="text-sm font-medium text-white">Total de Visualizações</CardTitle>
                                            <Eye className="h-5 w-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold text-white">
                                                {manhwas.reduce((total, manhwa) => total + manhwa.views, 0).toLocaleString()}
                                            </div>
                                            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                                                <span className="text-emerald-400">↗</span>
                                                +15% desde o mês passado
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-black/40 backdrop-blur-sm border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 group">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                            <CardTitle className="text-sm font-medium text-white">Capítulos Publicados</CardTitle>
                                            <FileText className="h-5 w-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold text-white">
                                                {manhwas.reduce((total, manhwa) => total + manhwa.chapters.length, 0)}
                                            </div>
                                            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                                                <span className="text-emerald-400">↗</span>
                                                +3 esta semana
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-black/40 backdrop-blur-sm border border-amber-500/20 hover:border-amber-500/40 transition-all duration-300 group">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                            <CardTitle className="text-sm font-medium text-white">Avaliação Média</CardTitle>
                                            <BarChart3 className="h-5 w-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-3xl font-bold text-white">
                                                {manhwas.length > 0 ?
                                                    (manhwas.reduce((total, manhwa) => total + manhwa.rating, 0) / manhwas.length).toFixed(1)
                                                    : '0.0'
                                                }
                                            </div>
                                            <p className="text-xs text-amber-400 flex items-center gap-1 mt-2">
                                                <span>⭐</span>
                                                Excelente performance
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Recent Activity */}
                                <Card className="bg-black/40 backdrop-blur-sm border border-amber-500/20">
                                    <CardHeader className="border-b border-amber-500/20">
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <Award className="h-5 w-5 text-amber-400" />
                                            Suas Séries Ativas
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            {loadingManhwas ? (
                                                // Loading state
                                                <div className="flex items-center justify-center py-8">
                                                    <div className="flex items-center gap-3 text-amber-400">
                                                        <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                                                        <span>Carregando suas séries...</span>
                                                    </div>
                                                </div>
                                            ) : manhwas.length === 0 ? (
                                                // Empty state
                                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                                    <FileText className="h-12 w-12 text-amber-400/50 mb-3" />
                                                    <h3 className="text-white font-medium mb-2">Nenhuma série publicada ainda</h3>
                                                    <p className="text-slate-400 text-sm mb-4">
                                                        Suas séries publicadas aparecerão aqui
                                                    </p>
                                                    <Button
                                                        size="sm"
                                                        className="bg-amber-500 hover:bg-amber-400 text-black"
                                                        onClick={() => setCurrentView('creator-dashboard')}
                                                    >
                                                        Criar Nova Série
                                                    </Button>
                                                </div>
                                            ) : (
                                                // Display published series
                                                manhwas.slice(0, 3).map((manhwa) => (
                                                    <div key={manhwa.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                                                        <img
                                                            src={manhwa.cover}
                                                            alt={manhwa.title}
                                                            className="w-16 h-20 object-cover rounded-lg ring-2 ring-amber-500/30 group-hover:ring-amber-500/50 transition-all"
                                                            onError={(e) => {
                                                                e.target.src = '/images/manhwas/default-cover.jpg'
                                                            }}
                                                        />
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-white group-hover:text-amber-300 transition-colors">{manhwa.title}</h3>
                                                            <p className="text-sm text-slate-400 line-clamp-2">{manhwa.description}</p>
                                                            <div className="flex items-center gap-4 mt-3">
                                                                <span className="text-sm text-amber-400 flex items-center gap-1">
                                                                    <FileText className="h-3 w-3" />
                                                                    {manhwa.chapters?.length || 0} capítulos
                                                                </span>
                                                                <span className="text-sm text-emerald-400 flex items-center gap-1">
                                                                    <Eye className="h-3 w-3" />
                                                                    {(manhwa.views || 0).toLocaleString()} visualizações
                                                                </span>
                                                                <Badge
                                                                    variant={manhwa.status === 'Ongoing' ? 'default' : 'secondary'}
                                                                    className={manhwa.status === 'Ongoing'
                                                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                                        : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                                                    }
                                                                >
                                                                    {manhwa.status === 'Ongoing' ? 'Em Andamento' : 'Completa'}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-white border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/10 transition-all duration-300"
                                                                onClick={() => {
                                                                    // Navigate to content manager for this specific content
                                                                    setCurrentView('creator-dashboard')
                                                                }}
                                                            >
                                                                <Edit3 className="h-4 w-4 mr-2" />
                                                                Editar
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-white border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all duration-300"
                                                            >
                                                                <TrendingUp className="h-4 w-4 mr-2" />
                                                                Stats
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}

                                            {/* Reload button for debugging */}
                                            {!loadingManhwas && (
                                                <div className="flex justify-center pt-4">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                                                        onClick={loadManhwas}
                                                    >
                                                        <RotateCcw className="h-4 w-4 mr-2" />
                                                        Atualizar Séries
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
                            <div className="min-h-screen flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-lg text-gray-400">
                                        Um novo sistema será criado em breve...
                                    </p>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Analytics Tab */}
                        <TabsContent value="analytics">
                            <div className="space-y-8">
                                <Card className="bg-black/40 backdrop-blur-sm border border-amber-500/20">
                                    <CardHeader className="border-b border-amber-500/20">
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5 text-amber-400" />
                                            Análises de Performance
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8">
                                        <div className="text-center py-12">
                                            <div className="relative mb-6">
                                                <BarChart3 className="h-20 w-20 text-amber-400/50 mx-auto" />
                                                <div className="absolute -inset-4 bg-amber-400/10 rounded-full blur opacity-50"></div>
                                            </div>
                                            <h3 className="font-semibold mb-3 text-white text-2xl">Análises Detalhadas em Breve</h3>
                                            <p className="text-slate-400 mb-8 max-w-lg mx-auto text-lg">
                                                Estamos desenvolvendo um sistema completo de analytics para creators. Em breve você terá acesso a:
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Eye className="h-5 w-5 text-amber-400" />
                                                        <span className="font-medium text-white">Métricas de Visualização</span>
                                                    </div>
                                                    <p className="text-sm text-slate-400">Análise detalhada por capítulo e série</p>
                                                </div>
                                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Heart className="h-5 w-5 text-amber-400" />
                                                        <span className="font-medium text-white">Engajamento dos Leitores</span>
                                                    </div>
                                                    <p className="text-sm text-slate-400">Curtidas, comentários e interações</p>
                                                </div>
                                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Users className="h-5 w-5 text-amber-400" />
                                                        <span className="font-medium text-white">Retenção de Audiência</span>
                                                    </div>
                                                    <p className="text-sm text-slate-400">Taxa de leitores que retornam</p>
                                                </div>
                                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <DollarSign className="h-5 w-5 text-amber-400" />
                                                        <span className="font-medium text-white">Relatórios de Receita</span>
                                                    </div>
                                                    <p className="text-sm text-slate-400">Earnings e estatísticas financeiras</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Settings Tab */}
                        <TabsContent value="settings">
                            <div className="space-y-8">
                                <Card className="bg-black/40 backdrop-blur-sm border border-amber-500/20">
                                    <CardHeader className="border-b border-amber-500/20">
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <Settings className="h-5 w-5 text-amber-400" />
                                            Configurações do Creator
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8">
                                        <div className="text-center py-12">
                                            <div className="relative mb-6">
                                                <Settings className="h-20 w-20 text-amber-400/50 mx-auto" />
                                                <div className="absolute -inset-4 bg-amber-400/10 rounded-full blur opacity-50"></div>
                                            </div>
                                            <h3 className="font-semibold mb-3 text-white text-2xl">Configurações Avançadas</h3>
                                            <p className="text-slate-400 mb-8 max-w-lg mx-auto text-lg">
                                                Personalize sua experiência como creator. Em breve você poderá configurar:
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <User className="h-5 w-5 text-amber-400" />
                                                        <span className="font-medium text-white">Perfil Público</span>
                                                    </div>
                                                    <p className="text-sm text-slate-400">Bio, redes sociais e portfólio</p>
                                                </div>
                                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <DollarSign className="h-5 w-5 text-amber-400" />
                                                        <span className="font-medium text-white">Monetização</span>
                                                    </div>
                                                    <p className="text-sm text-slate-400">PayPal, Pix e configurações de pagamento</p>
                                                </div>
                                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Bell className="h-5 w-5 text-amber-400" />
                                                        <span className="font-medium text-white">Notificações</span>
                                                    </div>
                                                    <p className="text-sm text-slate-400">Alertas de novos leitores e comentários</p>
                                                </div>
                                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Shield className="h-5 w-5 text-amber-400" />
                                                        <span className="font-medium text-white">Privacidade</span>
                                                    </div>
                                                    <p className="text-sm text-slate-400">Controle de acesso e segurança</p>
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
                            variant="outline"
                            size="sm"
                            onClick={() => setShowNewHomePage(!showNewHomePage)}
                        >
                            {showNewHomePage ? 'Home Clássica' : 'Nova Home'}
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                console.log('Logout button clicked', user);
                                if (confirm('Deseja realmente sair?')) {
                                    logout();
                                }
                            }}
                        >
                            Sair
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

            {/* Debug Section - Remove this after testing */}
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

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando...</p>
                </div>
            </div>
        )
    }

    if (currentView === 'reader' && currentManhwa) {
        return <WebtoonReader manhwa={currentManhwa} chapterIndex={currentChapter} />
    }

    if (currentView === 'auth') {
        return (
            <AuthPage
                onNavigate={(view) => setCurrentView(view)}
                onLogin={(userData) => {
                    console.log('User logged in:', userData);
                    setCurrentView('home');
                }}
                onRegister={(userData) => {
                    console.log('User registered:', userData);
                    setCurrentView('auth'); // Keep on auth page for login
                }}
            />
        );
    }

    if (currentView === 'auth-creator') {
        return (
            <AuthPage
                creatorMode={true}
                onNavigate={(view) => setCurrentView(view)}
                onLogin={(userData) => {
                    console.log('Creator logged in:', userData);
                    setCurrentView('creator-dashboard');
                }}
                onRegister={(userData) => {
                    console.log('Creator registered:', userData);
                    setCurrentView('auth-creator'); // Keep on auth page for login
                }}
            />
        );
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
                <div className="min-h-screen bg-background">
                    <ProfilePro onBack={() => setCurrentView('home')} />
                    <div className="container mx-auto px-4 pb-8">
                        <ProfileApiDemo />
                    </div>
                </div>
            </RoleGuard>
        )
    }

    if (currentView === 'manhwa-details' && selectedManhwaForDetails) {
        return (
            <ManhwaDetailsPage
                manhwa={selectedManhwaForDetails}
                onBack={() => setCurrentView('library')}
                onReadChapter={(manhwa, chapterIndex) => {
                    setCurrentManhwa(manhwa)
                    setCurrentChapter(chapterIndex)
                    setCurrentView('reader')
                }}
            />
        )
    }

    if (currentView === 'library') {
        return <LibraryPage />
    }

    // Mostrar nova home page se habilitada
    if (showNewHomePage && currentView === 'home') {
        return (
            <ManhwaHomePage
                onNavigate={(view, data) => {
                    // Navegação para páginas específicas
                    if (view === 'home') {
                        setCurrentView('home');
                    } else if (view === 'biblioteca') {
                        setCurrentView('library');
                    } else if (view === 'ultimos-lancamentos') {
                        setCurrentView('home'); // Por enquanto redireciona para home
                    } else if (view === 'reader' && data) {
                        setCurrentManhwa(data);
                        setCurrentChapter(0);
                        setCurrentView('reader');
                    } else {
                        setCurrentView(view);
                    }
                }}
                onShowProfile={() => setCurrentView('profile')}
                currentUser={user}
            />
        );
    }

    return <HomePage />
}