'use client';

import { useState, useRef } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Camera, 
  Lock, 
  Mail, 
  Phone, 
  Save, 
  Upload, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

export function UserSettings({ onBack }) {
  const { user, isLoading } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const fileInputRef = useRef(null);

  // Estados para os formulários
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    nickname: user?.nickname || '',
    bio: user?.user_metadata?.bio || '',
    location: user?.user_metadata?.location || '',
    website: user?.user_metadata?.website || '',
    phone: user?.user_metadata?.phone_number || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [emailForm, setEmailForm] = useState({
    newEmail: user?.email || '',
    password: ''
  });

  // Handlers para upload de imagem
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo e tamanho do arquivo
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setUploadError('A imagem deve ter no máximo 5MB.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/users/me/avatar', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Falha ao fazer upload da imagem');
      }

      const result = await response.json();
      setSaveMessage('Imagem atualizada com sucesso!');
      
      // Recarregar a página para atualizar o avatar
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      setUploadError('Erro ao fazer upload da imagem: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Handler para salvar perfil
  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch('/api/users/me/profile-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileForm)
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar perfil');
      }

      setSaveMessage('Perfil atualizado com sucesso!');
      
    } catch (error) {
      setSaveMessage('Erro ao atualizar perfil: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handler para alterar senha
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSaveMessage('As senhas não coincidem');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setSaveMessage('A nova senha deve ter pelo menos 8 caracteres');
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch('/api/users/me/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Falha ao alterar senha');
      }

      setSaveMessage('Senha alterada com sucesso!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error) {
      setSaveMessage('Erro ao alterar senha: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handler para alterar email
  const handleChangeEmail = async () => {
    if (!emailForm.newEmail || !emailForm.password) {
      setSaveMessage('Por favor, preencha todos os campos');
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch('/api/users/me/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newEmail: emailForm.newEmail,
          password: emailForm.password
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Falha ao alterar email');
      }

      setSaveMessage('Solicitação de alteração de email enviada! Verifique seu email.');
      setEmailForm({
        newEmail: user?.email || '',
        password: ''
      });
      
    } catch (error) {
      setSaveMessage('Erro ao alterar email: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Configurações da Conta</h1>
            <p className="text-muted-foreground">Gerencie suas informações pessoais e preferências</p>
          </div>
        </div>

        {/* Mensagem de status */}
        {saveMessage && (
          <Alert className={`mb-6 ${saveMessage.includes('sucesso') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            {saveMessage.includes('sucesso') ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={saveMessage.includes('sucesso') ? 'text-green-800' : 'text-red-800'}>
              {saveMessage}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="avatar" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Avatar
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Conta
            </TabsTrigger>
          </TabsList>

          {/* Aba Perfil */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nickname">Nome de usuário</Label>
                    <Input
                      id="nickname"
                      value={profileForm.nickname}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, nickname: e.target.value }))}
                      placeholder="Seu nome de usuário"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Conte um pouco sobre você..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Cidade, Estado"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={profileForm.website}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://seusite.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full md:w-auto">
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Avatar */}
          <TabsContent value="avatar">
            <Card>
              <CardHeader>
                <CardTitle>Foto do Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={user?.picture} alt={user?.name} />
                    <AvatarFallback className="text-2xl">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      Escolha uma nova foto para seu perfil. Recomendamos imagens quadradas de pelo menos 400x400 pixels.
                    </p>
                    
                    {uploadError && (
                      <Alert className="mb-4 border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          {uploadError}
                        </AlertDescription>
                      </Alert>
                    )}

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      variant="outline"
                    >
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      {isUploading ? 'Enviando...' : 'Enviar Nova Foto'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Segurança */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha atual</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Digite sua senha atual"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova senha</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Digite sua nova senha (mín. 8 caracteres)"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirme sua nova senha"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button onClick={handleChangePassword} disabled={isSaving} className="w-full md:w-auto">
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Lock className="h-4 w-4 mr-2" />
                  )}
                  Alterar Senha
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Conta */}
          <TabsContent value="account">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Alterar Email</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="currentEmail">Email atual</Label>
                    <Input
                      id="currentEmail"
                      value={user?.email}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newEmail">Novo email</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      value={emailForm.newEmail}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
                      placeholder="Digite seu novo email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailPassword">Senha para confirmação</Label>
                    <Input
                      id="emailPassword"
                      type="password"
                      value={emailForm.password}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Digite sua senha atual"
                    />
                  </div>

                  <Button onClick={handleChangeEmail} disabled={isSaving} className="w-full md:w-auto">
                    {isSaving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Mail className="h-4 w-4 mr-2" />
                    )}
                    Alterar Email
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informações da Conta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">ID do usuário:</span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {user?.sub}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Última atualização:</span>
                      <span className="text-sm text-muted-foreground">
                        {user?.updated_at ? new Date(user.updated_at).toLocaleDateString('pt-BR') : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Email verificado:</span>
                      <Badge variant={user?.email_verified ? 'default' : 'destructive'}>
                        {user?.email_verified ? 'Verificado' : 'Não verificado'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
