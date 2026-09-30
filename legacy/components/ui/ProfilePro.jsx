'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';

export default function ProfilePro({ onBack }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-2xl font-semibold">Perfil</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-12 text-center">
            <h2 className="text-xl font-semibold text-muted-foreground mb-4">
              Sistema de Perfil
            </h2>
            <p className="text-lg text-muted-foreground">
              Um novo sistema será criado em breve...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
