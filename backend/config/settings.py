"""
Configurações Django do Sistema de Gestão da Concessionária.
Django 5.2.17.
"""

import os
from datetime import timedelta
from pathlib import Path

import dj_database_url
from decouple import config


BASE_DIR = Path(__file__).resolve().parent.parent

# Nunca inclua a SECRET_KEY no Git. Configure-a no .env local e no Render.
SECRET_KEY = config('SECRET_KEY')

# Mantém a lógica atual: produção no Render, desenvolvimento fora dele.
DEBUG = 'RENDER' not in os.environ

ALLOWED_HOSTS = ['127.0.0.1', 'localhost']
RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')

if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

# Origens permitidas para requisições que usam proteção CSRF, como formulários.
# A API JWT usa Authorization: Bearer e precisa principalmente da configuração CORS.
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:8100',
    'https://sistema-gestao-concessionaria.onrender.com',
]
if RENDER_EXTERNAL_HOSTNAME:
    origem_render = f'https://{RENDER_EXTERNAL_HOSTNAME}'
    if origem_render not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append(origem_render)


INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    'rest_framework',
    'apps.accounts',
    'apps.concessionaria',
    'apps.veiculos',
    'apps.ordens',
    'apps.workflow',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    # Deve vir antes de middleware que possa devolver respostas à API.
    'corsheaders.middleware.CorsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Mantém a configuração atual do banco.
# No Render, DATABASE_URL deve apontar para o PostgreSQL de produção.
DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///db.sqlite3',
        conn_max_age=600,
    ),
}


STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Recife'
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'accounts.CustomUser'


# Domínios de origem autorizados a acessar a API pelo navegador/WebView.
# Android Capacitor padrão: https://localhost.
# Não habilitar CORS_ALLOW_ALL_ORIGINS em produção.
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    'http://localhost:8100',
    'http://127.0.0.1:8100',
    'http://localhost:5173',
    'https://localhost',  # APK Android com Capacitor (configuração padrão)
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]


# Uma única configuração do DRF, preservando JWT e documentação OpenAPI.
REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'API Concessionária - Equipe B',
    'DESCRIPTION': 'Documentação dos endpoints de Logística, Fornecedores, Evidências e Ocorrências.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
