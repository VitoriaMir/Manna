'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileUploader } from './FileUploader'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Upload, 
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react'

const ContentStatus = {
  DRAFT: 'draft',
  REVIEW: 'review',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
}

const StatusConfig = {
  [ContentStatus.DRAFT]: {
    label: 'Rascunho',
    color: 'bg-gray-500',
    icon: FileText
  },
  [ContentStatus.REVIEW]: {
    label: 'Em Revisão',
    color: 'bg-yellow-500',
    icon: Clock
  },
  [ContentStatus.PUBLISHED]: {
    label: 'Publicado',
    color: 'bg-green-500',
    icon: CheckCircle
  },
  [ContentStatus.ARCHIVED]: {
    label: 'Arquivado',
    color: 'bg-red-500',
    icon: XCircle
  }
}

export function ContentManager({ user }) {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingContent, setEditingContent] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    type: 'chapter',
    title: '',
    description: '',
    manhwaId: '',
    pages: [],
    tags: [],
    genre: []
  })

  useEffect(() => {
    loadContent()
  }, [filter])

  const loadContent = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('status', filter)
      }

      const response = await fetch(`/api/content?${params}`)
      const data = await response.json()
      
      if (data.content) {
        setContent(data.content)
      }
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateContent = async () => {
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          metadata: {
            tags: formData.tags,
            genre: formData.genre
          }
        })
      })

      if (response.ok) {
        const newContent = await response.json()
        setContent(prev => [newContent, ...prev])
        setShowCreateDialog(false)
        resetForm()
      } else {
        const error = await response.json()
        console.error('Error creating content:', error)
      }
    } catch (error) {
      console.error('Error creating content:', error)
    }
  }

  const handleUpdateContent = async (contentId, updates) => {
    try {
      const response = await fetch('/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: contentId,
          ...updates
        })
      })

      if (response.ok) {
        const updatedContent = await response.json()
        setContent(prev => prev.map(c => c.id === contentId ? updatedContent : c))
      }
    } catch (error) {
      console.error('Error updating content:', error)
    }
  }

  const handleDeleteContent = async (contentId) => {
    if (!confirm('Tem certeza que deseja excluir este conteúdo?')) return

    try {
      const response = await fetch(`/api/content?id=${contentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setContent(prev => prev.filter(c => c.id !== contentId))
      }
    } catch (error) {
      console.error('Error deleting content:', error)
    }
  }

  const handleFilesUploaded = (uploadedFiles) => {
    setFormData(prev => ({
      ...prev,
      pages: [...prev.pages, ...uploadedFiles]
    }))
  }

  const resetForm = () => {
    setFormData({
      type: 'chapter',
      title: '',
      description: '',
      manhwaId: '',
      pages: [],
      tags: [],
      genre: []
    })
    setEditingContent(null)
  }

  const filteredContent = content.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  const getStatusCounts = () => {
    return {
      all: content.length,
      draft: content.filter(c => c.status === ContentStatus.DRAFT).length,
      review: content.filter(c => c.status === ContentStatus.REVIEW).length,
      published: content.filter(c => c.status === ContentStatus.PUBLISHED).length,
      archived: content.filter(c => c.status === ContentStatus.ARCHIVED).length
    }
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gerenciar Conteúdo</h1>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Conteúdo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Conteúdo</DialogTitle>
              <DialogDescription>
                Adicione um novo capítulo ou série à plataforma
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="info" className="space-y-4">
              <TabsList>
                <TabsTrigger value="info">Informações</TabsTrigger>
                <TabsTrigger value="pages">Páginas</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Tipo de Conteúdo</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manhwa">Nova Série</SelectItem>
                        <SelectItem value="chapter">Capítulo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Nome do capítulo ou série"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o conteúdo..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tags (separadas por vírgula)</Label>
                    <Input
                      value={formData.tags.join(', ')}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                      }))}
                      placeholder="ação, aventura, romance"
                    />
                  </div>

                  <div>
                    <Label>Gêneros (separados por vírgula)</Label>
                    <Input
                      value={formData.genre.join(', ')}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        genre: e.target.value.split(',').map(g => g.trim()).filter(g => g)
                      }))}
                      placeholder="manhwa, webtoon, drama"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pages">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Upload de Páginas</h3>
                  <FileUploader onFilesUploaded={handleFilesUploaded} />
                  
                  {formData.pages.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Páginas Adicionadas ({formData.pages.length})</h4>
                      <div className="grid grid-cols-6 gap-2">
                        {formData.pages.map((page, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={page.thumbnail}
                              alt={`Página ${index + 1}`}
                              className="w-full aspect-[3/4] object-cover rounded border"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                pages: prev.pages.filter((_, i) => i !== index)
                              }))}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <span className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                              {index + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="preview">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Preview do Conteúdo</h3>
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-lg">{formData.title || 'Título do conteúdo'}</h4>
                      <p className="text-muted-foreground mb-2">{formData.description || 'Descrição do conteúdo'}</p>
                      
                      {formData.tags.length > 0 && (
                        <div className="flex gap-1 mb-2">
                          {formData.tags.map(tag => (
                            <Badge key={tag} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-sm text-muted-foreground">
                        {formData.pages.length} páginas • Status: Rascunho
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateContent}
                disabled={!formData.title || formData.pages.length === 0}
              >
                Criar Conteúdo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todos ({statusCounts.all})
          </Button>
          <Button
            variant={filter === 'draft' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('draft')}
          >
            Rascunhos ({statusCounts.draft})
          </Button>
          <Button
            variant={filter === 'review' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('review')}
          >
            Em Revisão ({statusCounts.review})
          </Button>
          <Button
            variant={filter === 'published' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('published')}
          >
            Publicados ({statusCounts.published})
          </Button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conteúdo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Carregando conteúdo...</p>
          </div>
        ) : filteredContent.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Nenhum conteúdo encontrado</h3>
              <p className="text-muted-foreground">
                {content.length === 0 
                  ? 'Comece criando seu primeiro conteúdo' 
                  : 'Tente ajustar os filtros ou criar novo conteúdo'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredContent.map((item) => {
            const statusConfig = StatusConfig[item.status] || StatusConfig.draft
            const StatusIcon = statusConfig.icon

            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <Badge className={`${statusConfig.color} text-white`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground">{item.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{item.pages?.length || 0} páginas</span>
                        <span>Criado em {new Date(item.createdAt).toLocaleDateString()}</span>
                        {item.publishedAt && (
                          <span>Publicado em {new Date(item.publishedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                      
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex gap-1">
                          {item.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === ContentStatus.DRAFT && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateContent(item.id, { status: ContentStatus.REVIEW })}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Enviar para Revisão
                        </Button>
                      )}
                      
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDeleteContent(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}