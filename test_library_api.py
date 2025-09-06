#!/usr/bin/env python3
"""
Teste da API de Biblioteca de Manhwas do Usuário
Testa os endpoints implementados para gerenciamento da biblioteca
"""

import requests
import json
import time
from datetime import datetime

# Configurações
BASE_URL = "http://localhost:3000"
LIBRARY_ENDPOINT = f"{BASE_URL}/api/users/me/library"


def test_library_api():
    print("🚀 Testando API de Biblioteca de Manhwas")
    print("=" * 50)

    # Teste 1: GET - Buscar biblioteca completa
    print("\n1️⃣ Testando GET /api/users/me/library")
    try:
        response = requests.get(LIBRARY_ENDPOINT)
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Sucesso! Biblioteca carregada:")
            print(f"   📊 Estatísticas:")
            stats = data.get('stats', {})
            for key, value in stats.items():
                print(f"       {key}: {value}")
            print(f"   📚 Total de manhwas: {len(data.get('manhwas', []))}")
            
            # Mostrar alguns manhwas
            manhwas = data.get('manhwas', [])
            if manhwas:
                print(f"\n   📖 Primeiros manhwas na biblioteca:")
                for i, manhwa in enumerate(manhwas[:3], 1):
                    print(f"       {i}. {manhwa.get('title', 'N/A')} - Status: {manhwa.get('userStatus', 'N/A')}")
        else:
            print(f"   ❌ Erro: {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"   ❌ Erro de conexão: {e}")

    # Teste 2: GET com filtros - buscar manhwas que estão sendo lidos
    print("\n2️⃣ Testando GET /api/users/me/library?status=reading")
    try:
        response = requests.get(f"{LIBRARY_ENDPOINT}?status=reading")
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Sucesso! Manhwas sendo lidos:")
            manhwas = data.get('manhwas', [])
            print(f"   📖 Total lendo: {len(manhwas)}")
            
            for i, manhwa in enumerate(manhwas, 1):
                progress = 0
                if manhwa.get('totalChapters', 0) > 0:
                    progress = round((manhwa.get('currentChapter', 0) / manhwa.get('totalChapters', 1)) * 100)
                print(f"       {i}. {manhwa.get('title', 'N/A')} - Progresso: {progress}%")
        else:
            print(f"   ❌ Erro: {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"   ❌ Erro de conexão: {e}")

    # Teste 3: GET com busca - buscar por termo
    print("\n3️⃣ Testando GET /api/users/me/library?search=solo")
    try:
        response = requests.get(f"{LIBRARY_ENDPOINT}?search=solo")
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Sucesso! Busca por 'solo':")
            manhwas = data.get('manhwas', [])
            print(f"   🔍 Resultados encontrados: {len(manhwas)}")
            
            for i, manhwa in enumerate(manhwas, 1):
                print(f"       {i}. {manhwa.get('title', 'N/A')} - {manhwa.get('author', 'N/A')}")
        else:
            print(f"   ❌ Erro: {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"   ❌ Erro de conexão: {e}")

    # Teste 4: POST - Adicionar novo manhwa
    print("\n4️⃣ Testando POST /api/users/me/library (adicionar manhwa)")
    try:
        add_data = {
            "action": "add",
            "manhwaId": "new-manhwa-test",  # Este ID não existe, então deve dar erro
            "status": "plan_to_read",
            "notes": "Recomendado por um amigo"
        }

        response = requests.post(
            LIBRARY_ENDPOINT,
            json=add_data,
            headers={"Content-Type": "application/json"},
        )

        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Sucesso! Manhwa adicionado")
        else:
            print(f"   ❌ Erro esperado (manhwa não existe): {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"   ❌ Erro de conexão: {e}")

    # Teste 5: POST - Atualizar manhwa existente
    print("\n5️⃣ Testando POST /api/users/me/library (atualizar manhwa)")
    try:
        update_data = {
            "action": "update",
            "manhwaId": "solo-leveling",  # ID que sabemos que existe
            "currentChapter": 175,
            "isFavorite": True,
            "notes": "Meu manhwa favorito! História incrível."
        }

        response = requests.post(
            LIBRARY_ENDPOINT,
            json=update_data,
            headers={"Content-Type": "application/json"},
        )

        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Sucesso! Manhwa atualizado")
            print(f"   ⭐ Favoritos atualizados: {data.get('library', {}).get('stats', {}).get('favorites', 'N/A')}")
        else:
            print(f"   ❌ Erro: {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"   ❌ Erro de conexão: {e}")

    # Teste 6: GET - Verificar dados após atualizações
    print("\n6️⃣ Verificando biblioteca após atualizações")
    try:
        response = requests.get(f"{LIBRARY_ENDPOINT}?favorites=true")
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Sucesso! Favoritos:")
            manhwas = data.get('manhwas', [])
            print(f"   ❤️ Total de favoritos: {len(manhwas)}")
            
            for i, manhwa in enumerate(manhwas, 1):
                print(f"       {i}. {manhwa.get('title', 'N/A')} - Capítulo: {manhwa.get('currentChapter', 0)}/{manhwa.get('totalChapters', 'N/A')}")
                if manhwa.get('notes'):
                    print(f"          Nota: {manhwa.get('notes')[:50]}...")

            # Estatísticas finais
            stats = data.get('stats', {})
            print(f"\n   📊 Estatísticas da biblioteca:")
            for key, value in stats.items():
                if key != 'totalChaptersRead':
                    print(f"       {key}: {value}")
            print(f"       Capítulos lidos: {stats.get('totalChaptersRead', 0)}")
                
        else:
            print(f"   ❌ Erro: {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"   ❌ Erro de conexão: {e}")

    print("\n" + "=" * 50)
    print("🎉 Teste da API de Biblioteca concluído!")
    print("💡 Acesse http://localhost:3000 e faça login para ver a interface")
    print("📚 Vá para a aba 'Biblioteca' no perfil para testar a UI")


if __name__ == "__main__":
    test_library_api()