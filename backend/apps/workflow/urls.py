from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VistoriaQualidadeViewSet, ProcessoLavagemViewSet

router = DefaultRouter()
router.register(r'vistorias', VistoriaQualidadeViewSet, basename='vistoria')
router.register(r'lavagem', ProcessoLavagemViewSet, basename='lavagem')

urlpatterns = [
    path('', include(router.urls)),
]