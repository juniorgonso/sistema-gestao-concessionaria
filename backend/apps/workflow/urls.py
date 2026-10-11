from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VistoriaQualidadeViewSet, ProcessoLavagemViewSet
from .views import VistoriaQualidadeViewSet, ProcessoLavagemViewSet, EvidenciaFotoViewSet 

router = DefaultRouter()
router.register(r'vistorias', VistoriaQualidadeViewSet, basename='vistoria')
router.register(r'lavagem', ProcessoLavagemViewSet, basename='lavagem')
router.register(r'evidencias', EvidenciaFotoViewSet, basename='evidencia')

urlpatterns = [
    path('', include(router.urls)),
]