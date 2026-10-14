from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# 🚀 1. As nossas classes customizadas têm de ficar AQUI EM CIMA, antes das rotas
class CustomTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Injeta os grupos do utilizador dentro do JWT
        token['grupos'] = list(user.groups.values_list('name', flat=True))
        return token

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer


schema_view = get_schema_view(
    openapi.Info(
        title="API Sistema de Gestão",
        default_version='v1',
        description="Documentação da API do Sistema de Gestão de Concessionárias",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # 🚀 2. AQUI ESTÁ A MUDANÇA: Trocámos para a nossa View Customizada!
    path('api/v1/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Rotas da API V1
    path('api/v1/concessionaria/', include('apps.concessionaria.urls')),
    path('api/v1/veiculos/', include('apps.veiculos.urls')),
    path('api/v1/ordens/', include('apps.ordens.urls')),
    path('api/v1/workflow/', include('apps.workflow.urls')),

    # Documentação Swagger
    path('api/schema/', schema_view.without_ui(cache_timeout=0), name='schema'),
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='swagger-ui'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)