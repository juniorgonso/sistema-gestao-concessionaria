
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import VeiculoViewSet, CicloVeiculoViewSet

router = DefaultRouter()

router.register(
    r'lista',
    VeiculoViewSet,
    basename='veiculo'
)

router.register(
    r'ciclos',
    CicloVeiculoViewSet,
    basename='ciclo'
)

urlpatterns = [
    # Endpoint da oficina utilizado pelo mobile
    path(
        'minha-oficina/',
        VeiculoViewSet.as_view({'get': 'minha_oficina'}),
        name='minha-oficina'
    ),

    # Mantém as rotas existentes
    path('', include(router.urls)),
]
