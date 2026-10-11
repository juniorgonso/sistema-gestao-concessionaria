from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VeiculoViewSet, CicloVeiculoViewSet # 🔒 Importação adicionada

router = DefaultRouter()
router.register(r'lista', VeiculoViewSet, basename='veiculo')
router.register(r'ciclos', CicloVeiculoViewSet, basename='ciclo') # 🔒 Rota exposta com sucesso

urlpatterns = [
    path('', include(router.urls)),
]