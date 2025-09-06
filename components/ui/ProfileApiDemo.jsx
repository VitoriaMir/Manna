import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useUserProfile } from '@/hooks/use-user-profile';
import { BookOpen, Heart, Star, Play, CheckCircle, Plus } from 'lucide-react';

export function ProfileApiDemo() {
  const { addActivity, updateProfile, isUpdating } = useUserProfile();
  const [newGoal, setNewGoal] = useState('');
  const [isAddingActivity, setIsAddingActivity] = useState(false);

  const handleUpdateGoal = async () => {
    if (!newGoal || isNaN(newGoal)) return;
    
    try {
      await updateProfile({ 
        monthlyGoal: parseInt(newGoal),
        preferences: { 
          lastGoalUpdate: new Date().toISOString() 
        }
      });
      setNewGoal('');
      alert('Meta atualizada com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar meta: ' + error.message);
    }
  };

  const addDemoActivity = async (type, manhwaTitle, extraData = {}) => {
    setIsAddingActivity(true);
    try {
      const activityTitles = {
        read: `Leu "${manhwaTitle}" - Capítulo ${extraData.chapter || Math.floor(Math.random() * 100) + 1}`,
        favorite: `Adicionou "${manhwaTitle}" aos favoritos`,
        start: `Começou a ler "${manhwaTitle}"`,
        finish: `Terminou de ler "${manhwaTitle}"`,
        review: `Avaliou "${manhwaTitle}" com ${extraData.rating || 5} estrelas`
      };

      await addActivity({
        type,
        title: activityTitles[type],
        manhwaTitle,
        ...extraData
      });

      alert('Atividade adicionada com sucesso!');
    } catch (error) {
      alert('Erro ao adicionar atividade: ' + error.message);
    } finally {
      setIsAddingActivity(false);
    }
  };

  const demoManhwas = [
    { title: 'Solo Leveling', genre: 'Ação, Fantasia' },
    { title: 'Tower of God', genre: 'Aventura, Mistério' },
    { title: 'The Beginning After The End', genre: 'Fantasia, Reencarnação' },
    { title: 'Noblesse', genre: 'Sobrenatural, Comédia' },
    { title: 'God of High School', genre: 'Ação, Artes Marciais' },
    { title: 'Demon Slayer', genre: 'Ação, Supernatural' },
    { title: 'Attack on Titan', genre: 'Ação, Drama' },
    { title: 'One Piece', genre: 'Aventura, Comédia' }
  ];

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          API Demo - Teste as Funcionalidades
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seção de Meta Mensal */}
        <div>
          <h4 className="font-medium mb-3">Atualizar Meta Mensal</h4>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="goal">Nova meta (número de manhwas)</Label>
              <Input
                id="goal"
                type="number"
                placeholder="Ex: 25"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                min="1"
                max="100"
              />
            </div>
            <Button 
              onClick={handleUpdateGoal} 
              disabled={!newGoal || isUpdating}
              className="self-end"
            >
              {isUpdating ? 'Atualizando...' : 'Atualizar Meta'}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Seção de Atividades */}
        <div>
          <h4 className="font-medium mb-3">Adicionar Atividades de Demonstração</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Clique nos botões abaixo para simular diferentes tipos de atividades. 
            As estatísticas serão atualizadas automaticamente!
          </p>
          
          <div className="space-y-4">
            {demoManhwas.slice(0, 4).map((manhwa, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h5 className="font-medium">{manhwa.title}</h5>
                    <p className="text-sm text-muted-foreground">{manhwa.genre}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => addDemoActivity('read', manhwa.title, { 
                      chapter: Math.floor(Math.random() * 50) + 1,
                      meta: manhwa.genre 
                    })}
                    disabled={isAddingActivity}
                  >
                    <BookOpen className="h-3 w-3 mr-1" />
                    Ler Capítulo
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => addDemoActivity('favorite', manhwa.title, { 
                      meta: manhwa.genre 
                    })}
                    disabled={isAddingActivity}
                  >
                    <Heart className="h-3 w-3 mr-1" />
                    Favoritar
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => addDemoActivity('start', manhwa.title, { 
                      meta: manhwa.genre 
                    })}
                    disabled={isAddingActivity}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Começar
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => addDemoActivity('finish', manhwa.title, { 
                      meta: manhwa.genre 
                    })}
                    disabled={isAddingActivity}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Terminar
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => addDemoActivity('review', manhwa.title, { 
                      rating: Math.floor(Math.random() * 2) + 4, // 4 ou 5 estrelas
                      meta: manhwa.genre 
                    })}
                    disabled={isAddingActivity}
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Avaliar
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {isAddingActivity && (
            <div className="text-center py-4">
              <Badge variant="secondary">Adicionando atividade...</Badge>
            </div>
          )}
        </div>

        <Separator />

        {/* Informações da API */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-medium mb-2">🚀 API Endpoints Implementados:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li><code>GET /api/users/me/profile</code> - Buscar dados do perfil</li>
            <li><code>PUT /api/users/me/profile</code> - Atualizar configurações</li>
            <li><code>POST /api/users/me/profile</code> - Adicionar nova atividade</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
