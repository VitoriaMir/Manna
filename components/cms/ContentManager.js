'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
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
  ArrowLeft,
  Archive,
  Filter,
  MoreVertical,
  X
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
  const [showPreviewDialog, setShowPreviewDialog] = useState(false)
  const [previewContent, setPreviewContent] = useState(null)
  const [editingContent, setEditingContent] = useState(null)
  const [autoSaveStatus, setAutoSaveStatus] = useState('')
  const [notification, setNotification] = useState('')

  // Form state
  const [formData, setFormData] = useState(() => {
    // Tentar carregar dados salvos do localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('manna_draft_content')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.log('Erro ao carregar rascunho salvo:', e)
        }
      }
    }
    return {
      type: 'chapter',
      title: '',
      description: '',
      manhwaId: '',
      pages: [],
      tags: [],
      genre: []
    }
  })

  // Auto-save effect - salva no localStorage quando formData muda
  useEffect(() => {
    if (typeof window !== 'undefined' && (formData.title || formData.description || formData.pages.length > 0)) {
      localStorage.setItem('manna_draft_content', JSON.stringify(formData))
      setAutoSaveStatus('Rascunho salvo automaticamente')

      // Limpar mensagem após 2 segundos
      const timer = setTimeout(() => {
        setAutoSaveStatus('')
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [formData])

  // Helper function to make authenticated requests
  const makeAuthenticatedRequest = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('manna_auth_token')
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return fetch(url, {
      credentials: 'include',
      ...options,
      headers
    })
  }, [])

  const showNotification = useCallback((message, type = 'success') => {
    setNotification(message)
    setTimeout(() => setNotification(''), 3000)
  }, [])

  const loadContent = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('status', filter)
      }

      const response = await makeAuthenticatedRequest(`/api/content?${params}`, {
        headers: {} // GET requests don't need Content-Type
      })
      const data = await response.json()

      if (data.content) {
        setContent(data.content)
      }
    } catch (error) {
      console.error('Error loading content:', error)
    } finally {
      setLoading(false)
    }
  }, [filter, makeAuthenticatedRequest])

  useEffect(() => {
    loadContent()
  }, [loadContent])

  const handleCreateContent = useCallback(async () => {
    try {
      const response = await makeAuthenticatedRequest('/api/content', {
        method: 'POST',
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
        showNotification('Conteúdo criado com sucesso!')
      } else {
        const error = await response.json()
        console.error('Error creating content:', error)
        showNotification('Erro ao criar conteúdo: ' + (error.message || 'Erro desconhecido'), 'error')
      }
    } catch (error) {
      console.error('Error creating content:', error)
    }
  }, [formData, makeAuthenticatedRequest, showNotification])

  const handleUpdateContent = useCallback(async (contentId, updates) => {
    try {
      const response = await makeAuthenticatedRequest('/api/content', {
        method: 'PUT',
        body: JSON.stringify({
          id: contentId,
          ...updates
        })
      })

      if (response.ok) {
        const updatedContent = await response.json()
        setContent(prev => prev.map(c => c.id === contentId ? updatedContent : c))

        // Mensagens específicas para cada tipo de atualização
        if (updates.status === 'review') {
          showNotification('Conteúdo enviado para revisão!')
        } else if (updates.status === 'published') {
          showNotification('Conteúdo publicado com sucesso! 🎉')
        } else if (updates.status === 'draft') {
          showNotification('Conteúdo voltou para rascunho')
        } else if (updates.status === 'archived') {
          showNotification('Conteúdo arquivado')
        } else {
          showNotification('Conteúdo atualizado com sucesso!')
        }
      } else {
        const error = await response.json()
        showNotification('Erro ao atualizar conteúdo: ' + (error.message || 'Erro desconhecido'), 'error')
      }
    } catch (error) {
      console.error('Error updating content:', error)
      showNotification('Erro ao atualizar conteúdo', 'error')
    }
  }, [makeAuthenticatedRequest, showNotification])

  const handleDeleteContent = useCallback(async (contentId) => {
    if (!confirm('Tem certeza que deseja excluir este conteúdo?')) return

    try {
      const response = await makeAuthenticatedRequest(`/api/content?id=${contentId}`, {
        method: 'DELETE',
        headers: {} // DELETE requests don't need Content-Type
      })

      if (response.ok) {
        setContent(prev => prev.filter(c => c.id !== contentId))
      }
    } catch (error) {
      console.error('Error deleting content:', error)
    }
  }, [makeAuthenticatedRequest])

  const handleFilesUploaded = useCallback((uploadedFiles) => {
    setFormData(prev => ({
      ...prev,
      pages: [...prev.pages, ...uploadedFiles]
    }))
  }, [])

  const resetForm = useCallback(() => {
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
    // Limpar rascunho salvo
    if (typeof window !== 'undefined') {
      localStorage.removeItem('manna_draft_content')
    }
  }, [])

  const handleViewContent = useCallback((content) => {
    setPreviewContent(content)
    setShowPreviewDialog(true)
  }, [])

  const handleEditContent = useCallback((content) => {
    setFormData({
      type: content.type || 'chapter',
      title: content.title || '',
      description: content.description || '',
      manhwaId: content.manhwaId || '',
      pages: content.pages || [],
      tags: content.tags || [],
      genre: content.genre || []
    })
    setEditingContent(content)
    setShowCreateDialog(true)
  }, [])

  const filteredContent = useMemo(() => {
    return content.filter(item => {
      const matchesSearch = !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesSearch
    })
  }, [content, searchQuery])

  const getStatusCounts = useMemo(() => {
    return {
      all: content.length,
      draft: content.filter(c => c.status === ContentStatus.DRAFT).length,
      review: content.filter(c => c.status === ContentStatus.REVIEW).length,
      published: content.filter(c => c.status === ContentStatus.PUBLISHED).length,
      archived: content.filter(c => c.status === ContentStatus.ARCHIVED).length
    }
  }, [content])

  const statusCounts = getStatusCounts

  return (
    <div className="space-y-6">
      {/* Notificação */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md shadow-lg flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          {notification}
        </div>
      )}

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
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Conteúdo</DialogTitle>
              <DialogDescription>
                Adicione um novo capítulo ou série à plataforma
              </DialogDescription>
              {autoSaveStatus && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md">
                  <CheckCircle className="h-4 w-4" />
                  {autoSaveStatus}
                </div>
              )}
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
                      {formData.pages.length > 20 && (
                        <p className="text-sm text-blue-600 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                          Role para baixo para ver todas as páginas
                        </p>
                      )}
                      <div className="h-[400px] w-full border rounded-md bg-gray-50/50 overflow-y-auto overflow-x-hidden scroll-smooth">
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 p-4">
                          {formData.pages.map((page, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={page.thumbnail}
                                alt={`Página ${index + 1}`}
                                className="w-full aspect-[3/4] object-cover rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 rounded-full shadow-lg"
                                onClick={() => setFormData(prev => ({
                                  ...prev,
                                  pages: prev.pages.filter((_, i) => i !== index)
                                }))}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                              <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                                {index + 1}
                              </span>
                            </div>
                          ))}
                        </div>
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

                      {item.status === ContentStatus.REVIEW && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleUpdateContent(item.id, {
                              status: ContentStatus.PUBLISHED,
                              publishedAt: new Date().toISOString()
                            })}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Publicar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateContent(item.id, { status: ContentStatus.DRAFT })}
                          >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar para Rascunho
                          </Button>
                        </>
                      )}

                      {item.status === ContentStatus.PUBLISHED && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateContent(item.id, {
                            status: ContentStatus.ARCHIVED,
                            archivedAt: new Date().toISOString()
                          })}
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          Arquivar
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewContent(item)}
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditContent(item)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteContent(item.id)}
                        title="Deletar"
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

      {/* Dialog de Preview */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Visualizar Conteúdo</DialogTitle>
            <DialogDescription>
              Preview do conteúdo selecionado
            </DialogDescription>
          </DialogHeader>

          {previewContent && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{previewContent.title}</h3>
                <p className="text-muted-foreground">{previewContent.description}</p>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <Badge className={`${StatusConfig[previewContent.status]?.color || 'bg-gray-500'} text-white`}>
                  {StatusConfig[previewContent.status]?.label || 'Desconhecido'}
                </Badge>
                <span>{previewContent.pages?.length || 0} páginas</span>
                <span>Criado em {new Date(previewContent.createdAt).toLocaleDateString()}</span>
              </div>

              {previewContent.tags && previewContent.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Tags:</h4>
                  <div className="flex gap-1 flex-wrap">
                    {previewContent.tags.map(tag => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {previewContent.pages && previewContent.pages.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Páginas ({previewContent.pages.length}):</h4>
                  <div className="h-[400px] w-full border rounded-md bg-gray-50/50 overflow-y-auto overflow-x-hidden">
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 p-4">
                      {previewContent.pages.map((page, index) => (
                        <div key={index} className="relative">
                          <img
                            src={page.thumbnail}
                            alt={`Página ${index + 1}`}
                            className="w-full aspect-[3/4] object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                          />
                          <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                            {index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}