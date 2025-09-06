#!/usr/bin/env python3
"""
Teste da API de Perfil do Usuário
Testa os endpoints implementados para gerenciamento de perfil
"""

import requests
import json
import time
from datetime import datetime

# Configurações
BASE_URL = "http://localhost:3000"
PROFILE_ENDPOINT = f"{BASE_URL}/api/users/me/profile"

def test_profile_api():
    print("🚀 Testando API de Perfil do Usuário")
    print("=" * 50)
    
    # Teste 1: GET - Buscar dados do perfil
    print("\n1️⃣ Testando GET /api/users/me/profile")
    try:
        response = requests.get(PROFILE_ENDPOINT)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Sucesso! Dados recebidos:")
            print(f"   📊 Estatísticas: {data.get('statistics', {})}")
            print(f"   🎯 Meta mensal: {data.get('monthlyGoal', 'N/A')}")
            print(f"   🏆 Conquistas: {len(data.get('achievements', []))}")
            print(f"   📝 Atividades: {len(data.get('activities', []))}")
        else:
            print(f"   ❌ Erro: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Erro de conexão: {e}")
    
    # Teste 2: PUT - Atualizar configurações
    print("\n2️⃣ Testando PUT /api/users/me/profile")
    try:
        update_data = {
            "monthlyGoal": 30,
            "preferences": {
                "theme": "dark",
                "notifications": True,
                "lastUpdate": datetime.now().isoformat()
            }
        }
        
        response = requests.put(
            PROFILE_ENDPOINT,
            json=update_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Sucesso! Meta atualizada para: {data.get('monthlyGoal')}")
            print(f"   💾 Preferências salvas: {data.get('preferences', {})}")
        else:
            print(f"   ❌ Erro: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Erro de conexão: {e}")
    
    # Teste 3: POST - Adicionar nova atividade
    print("\n3️⃣ Testando POST /api/users/me/profile")
    try:
        activity_data = {
            "type": "read",
            "title": "Leu 'Solo Leveling' - Capítulo 150",
            "manhwaTitle": "Solo Leveling",
            "chapter": 150,
            "meta": "Ação, Fantasia"
        }
        
        response = requests.post(
            PROFILE_ENDPOINT,
            json=activity_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Sucesso! Atividade adicionada")
            print(f"   📈 Novas estatísticas: {data.get('statistics', {})}")
            print(f"   🆕 Total de atividades: {len(data.get('activities', []))}")
        else:
            print(f"   ❌ Erro: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Erro de conexão: {e}")

    # Teste 4: Verificar dados após mudanças
    print("\n4️⃣ Verificando dados após atualizações")
    try:
        response = requests.get(PROFILE_ENDPOINT)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   📊 Estatísticas finais:")
            stats = data.get('statistics', {})
            for key, value in stats.items():
                print(f"       {key}: {value}")
            
            print(f"\n   🎯 Meta atual: {data.get('monthlyGoal', 'N/A')}")
            print(f"   📝 Total de atividades registradas: {len(data.get('activities', []))}")
            
            # Mostrar as últimas 3 atividades
            activities = data.get('activities', [])
            if activities:
                print(f"\n   📋 Últimas atividades:")
                for i, activity in enumerate(activities[-3:], 1):
                    print(f"       {i}. {activity.get('title', 'N/A')} ({activity.get('timestamp', 'N/A')})")
        else:
            print(f"   ❌ Erro: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Erro de conexão: {e}")

    print("\n" + "=" * 50)
    print("🎉 Teste da API de Perfil concluído!")
    print("💡 Acesse http://localhost:3000 e faça login para ver a interface")

if __name__ == "__main__":
    test_profile_api()
