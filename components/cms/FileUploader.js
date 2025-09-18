'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  X,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Eye,
  Trash2
} from 'lucide-react'

export function FileUploader({ onFilesUploaded, maxFiles = 10, accept = 'image/*' }) {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending', // pending, uploading, success, error
      progress: 0,
      error: null,
      result: null
    }))

    setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles))
  }, [maxFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      [accept]: []
    },
    maxFiles: maxFiles - files.length,
    disabled: uploading
  })

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const uploadFiles = async () => {
    if (files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      files.forEach(({ file }) => {
        formData.append('files', file)
      })

      // Update files status to uploading
      setFiles(prev => prev.map(f => ({ ...f, status: 'uploading' })))

      // Get auth token for request
      const token = localStorage.getItem('manna_auth_token')
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include cookies for authentication
        headers
      })

      console.log('Upload response status:', response.status)
      console.log('Upload response headers:', [...response.headers.entries()])

      const result = await response.json()
      console.log('Upload result:', result)

      if (result.success) {
        // Update files with results
        setFiles(prev => prev.map((f, index) => {
          const uploadResult = result.files[index]
          return {
            ...f,
            status: uploadResult.error ? 'error' : 'success',
            error: uploadResult.error || null,
            result: uploadResult.error ? null : uploadResult
          }
        }))

        // Call callback with successful uploads
        const successfulUploads = result.files.filter(f => !f.error)
        if (onFilesUploaded) {
          onFilesUploaded(successfulUploads)
        }
      } else {
        throw new Error(result.error || 'Upload failed')
      }

    } catch (error) {
      console.error('Upload error:', error)
      setFiles(prev => prev.map(f => ({
        ...f,
        status: 'error',
        error: error.message
      })))
    } finally {
      setUploading(false)
      setUploadProgress(100)
    }
  }

  const clearAll = () => {
    setFiles([])
    setUploadProgress(0)
  }

  const hasSuccessfulUploads = files.some(f => f.status === 'success')
  const hasErrors = files.some(f => f.status === 'error')

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card className={`border-2 border-dashed transition-colors ${isDragActive ? 'border-purple-500 bg-purple-50 dark:bg-purple-950' :
        'border-gray-300 hover:border-purple-400'
        }`}>
        <CardContent className="p-6">
          <div {...getRootProps()} className="cursor-pointer text-center">
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Upload className="h-8 w-8 text-gray-600" />
              </div>

              <div>
                <p className="text-lg font-medium">
                  {isDragActive ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Suporta imagens PNG, JPG, WebP (máx. 10MB cada)
                </p>
                <p className="text-xs text-muted-foreground">
                  Máximo de {maxFiles} arquivos • {files.length}/{maxFiles} selecionados
                </p>
              </div>

              <Button variant="outline" disabled={uploading}>
                <ImageIcon className="h-4 w-4 mr-2" />
                Selecionar Imagens
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Arquivos Selecionados</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={uploadFiles}
                    disabled={uploading || files.every(f => f.status === 'success')}
                  >
                    {uploading ? 'Enviando...' : 'Enviar Arquivos'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} />
                  <p className="text-sm text-muted-foreground">Processando imagens...</p>
                </div>
              )}

              <div className="grid gap-3">
                {files.map((fileItem) => (
                  <div key={fileItem.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    {/* Preview */}
                    <div className="relative w-16 h-16 rounded overflow-hidden bg-gray-100">
                      <img
                        src={fileItem.preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{fileItem.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>

                      {fileItem.error && (
                        <p className="text-sm text-red-600">{fileItem.error}</p>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      {fileItem.status === 'pending' && (
                        <Badge variant="secondary">Pendente</Badge>
                      )}
                      {fileItem.status === 'uploading' && (
                        <Badge>Enviando...</Badge>
                      )}
                      {fileItem.status === 'success' && (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <Badge variant="default">Sucesso</Badge>
                        </>
                      )}
                      {fileItem.status === 'error' && (
                        <>
                          <AlertCircle className="h-5 w-5 text-red-600" />
                          <Badge variant="destructive">Erro</Badge>
                        </>
                      )}

                      {fileItem.status !== 'uploading' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(fileItem.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              {(hasSuccessfulUploads || hasErrors) && (
                <div className="pt-3 border-t space-y-2">
                  {hasSuccessfulUploads && (
                    <p className="text-sm text-green-600">
                      ✓ {files.filter(f => f.status === 'success').length} arquivo(s) enviado(s) com sucesso
                    </p>
                  )}
                  {hasErrors && (
                    <p className="text-sm text-red-600">
                      ✗ {files.filter(f => f.status === 'error').length} arquivo(s) falharam
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}