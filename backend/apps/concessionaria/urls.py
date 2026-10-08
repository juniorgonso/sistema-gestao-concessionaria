from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FornecedorViewSet, DemandaExternaViewSet, EvidenciaFotoViewSet, OcorrenciaViewSet

router = DefaultRouter()
router.register(r'fornecedores', FornecedorViewSet)
router.register(r'demandas-externas', DemandaExternaViewSet)
router.register(r'evidencias', EvidenciaFotoViewSet)
router.register(r'ocorrencias', OcorrenciaViewSet) # Nova rota adicionada

urlpatterns = [
    path('', include(router.urls)),
]