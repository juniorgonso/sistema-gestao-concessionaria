from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # A nossa API
    path('api/v1/concessionaria/', include('apps.concessionaria.urls')),

    # Módulo de Veículos
    path('api/v1/veiculos/', include('apps.veiculos.urls')),

    # Módulo de Serviços e Autorizações
    path('api/v1/ordens/', include('apps.ordens.urls')),

    # Módulo de Qualidade e Lavagem
    path('api/v1/workflow/', include('apps.workflow.urls')),
    
    # Geração do esquema OpenAPI (lido pelo sistema)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    
    # Interface Visual do Swagger (Para humanos acessarem)
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]