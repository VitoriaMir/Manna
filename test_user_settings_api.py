#!/usr/bin/env python3
"""
Teste das APIs de configurações de usuário
"""

import requests
import json
from datetime import datetime

# Configurações
BASE_URL = "http://localhost:3000"
HEADERS = {"Content-Type": "application/json", "User-Agent": "Manna-Test-Suite/1.0"}


def test_profile_settings_api():
    """Testa a API de configurações do perfil"""
    print("🔧 Testando API de Configurações do Perfil")
    print("=" * 50)

    url = f"{BASE_URL}/api/users/me/profile-settings"

    # Dados de teste
    profile_data = {
        "name": "João Silva Teste",
        "nickname": "joao_teste",
        "bio": "Desenvolvedor apaixonado por manhwas",
        "location": "São Paulo, SP",
        "phone": "(11) 99999-9999",
    }

    try:
        response = requests.put(url, json=profile_data, headers=HEADERS)
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Sucesso: {data.get('message', 'OK')}")
            print(f"   📝 Campos atualizados: {data.get('updatedFields', [])}")
        elif response.status_code == 401:
            print(
                f"   🔐 Não autorizado: {response.json().get('error', 'Erro de autenticação')}"
            )
        else:
            print(f"   ❌ Erro: {response.json().get('error', 'Erro desconhecido')}")

    except requests.exceptions.ConnectionError:
        print("   ❌ Erro de conexão: Servidor não está rodando")
    except Exception as e:
        print(f"   ❌ Erro inesperado: {str(e)}")


def test_avatar_upload_api():
    """Testa a API de upload de avatar"""
    print("\n📷 Testando API de Upload de Avatar")
    print("=" * 50)

    url = f"{BASE_URL}/api/users/me/avatar"

    try:
        # Criar um arquivo de teste simples
        test_data = b"fake_image_data"
        files = {"image": ("test_avatar.jpg", test_data, "image/jpeg")}

        response = requests.post(url, files=files)
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Sucesso: {data.get('message', 'OK')}")
            print(f"   🖼️  URL da imagem: {data.get('imageUrl', 'N/A')}")
        elif response.status_code == 401:
            print(
                f"   🔐 Não autorizado: {response.json().get('error', 'Erro de autenticação')}"
            )
        else:
            print(f"   ❌ Erro: {response.json().get('error', 'Erro desconhecido')}")

    except requests.exceptions.ConnectionError:
        print("   ❌ Erro de conexão: Servidor não está rodando")
    except Exception as e:
        print(f"   ❌ Erro inesperado: {str(e)}")


def test_change_password_api():
    """Testa a API de alteração de senha"""
    print("\n🔒 Testando API de Alteração de Senha")
    print("=" * 50)

    url = f"{BASE_URL}/api/users/me/change-password"

    # Dados de teste
    password_data = {"currentPassword": "senhaAtual123", "newPassword": "NovaSenha456!"}

    try:
        response = requests.post(url, json=password_data, headers=HEADERS)
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Sucesso: {data.get('message', 'OK')}")
        elif response.status_code == 401:
            print(
                f"   🔐 Não autorizado: {response.json().get('error', 'Erro de autenticação')}"
            )
        else:
            print(f"   ❌ Erro: {response.json().get('error', 'Erro desconhecido')}")

    except requests.exceptions.ConnectionError:
        print("   ❌ Erro de conexão: Servidor não está rodando")
    except Exception as e:
        print(f"   ❌ Erro inesperado: {str(e)}")


def test_change_email_api():
    """Testa a API de alteração de email"""
    print("\n📧 Testando API de Alteração de Email")
    print("=" * 50)

    url = f"{BASE_URL}/api/users/me/change-email"

    # Dados de teste
    email_data = {"newEmail": "novoemail@exemplo.com", "password": "minhasenha123"}

    try:
        response = requests.post(url, json=email_data, headers=HEADERS)
        print(f"   Status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Sucesso: {data.get('message', 'OK')}")
            details = data.get("details", {})
            if details:
                print(f"   📧 Email anterior: {details.get('oldEmail', 'N/A')}")
                print(f"   📧 Novo email: {details.get('newEmail', 'N/A')}")
                print(
                    f"   ✉️  Requer verificação: {details.get('requiresVerification', 'N/A')}"
                )
        elif response.status_code == 401:
            print(
                f"   🔐 Não autorizado: {response.json().get('error', 'Erro de autenticação')}"
            )
        else:
            print(f"   ❌ Erro: {response.json().get('error', 'Erro desconhecido')}")

    except requests.exceptions.ConnectionError:
        print("   ❌ Erro de conexão: Servidor não está rodando")
    except Exception as e:
        print(f"   ❌ Erro inesperado: {str(e)}")


if __name__ == "__main__":
    print("🚀 Testando APIs de Configurações do Usuário")
    print(f"🕐 Horário: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # Executar todos os testes
    test_profile_settings_api()
    test_avatar_upload_api()
    test_change_password_api()
    test_change_email_api()

    print("\n" + "=" * 60)
    print("🎉 Teste das APIs de Configurações concluído!")
    print("💡 Acesse http://localhost:3000 e faça login para testar a interface")
