from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServicoViewSet, AutorizacaoViewSet

router = DefaultRouter()
router.register(r'servicos', ServicoViewSet, basename='servico')
router.register(r'autorizacoes', AutorizacaoViewSet, basename='autorizacao')

urlpatterns = [
    path('', include(router.urls)),
]