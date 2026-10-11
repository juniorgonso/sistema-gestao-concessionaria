from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import VistoriaQualidade, ProcessoLavagem, HistoricoEvento
from .serializers import VistoriaQualidadeSerializer, ProcessoLavagemSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from .models import EvidenciaFoto
from .serializers import EvidenciaFotoSerializer
from .permissions import IsLavagem, IsQualidade # 🔒 Importando os crachás

class VistoriaQualidadeViewSet(viewsets.ModelViewSet):
    queryset = VistoriaQualidade.objects.all()
    serializer_class = VistoriaQualidadeSerializer
    permission_classes = [IsQualidade]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['etapa', 'resultado', 'veiculo', 'ciclo']

    # O "Olho que Tudo Vê" para a Criação
    def perform_create(self, serializer):
        vistoria = serializer.save() # Guarda a vistoria primeiro
        
        # Gera a auditoria automaticamente, sem o frontend saber
        HistoricoEvento.objects.create(
            veiculo=vistoria.veiculo,
            ciclo=vistoria.ciclo,
            tipo_evento="VISTORIA_REGISTRADA",
            descricao=f"Vistoria {vistoria.get_etapa_display()} finalizada com resultado: {vistoria.get_resultado_display()}.",
            autor=self.request.user # Puxa o utilizador direto do Token JWT
        )

    # O "Olho que Tudo Vê" para a Atualização
    def perform_update(self, serializer):
        vistoria = serializer.save()
        
        HistoricoEvento.objects.create(
            veiculo=vistoria.veiculo,
            ciclo=vistoria.ciclo,
            tipo_evento="VISTORIA_ATUALIZADA",
            descricao=f"Vistoria {vistoria.get_etapa_display()} reavaliada para: {vistoria.get_resultado_display()}.",
            autor=self.request.user
        )

class ProcessoLavagemViewSet(viewsets.ModelViewSet):
    queryset = ProcessoLavagem.objects.select_related(
        'ciclo',
        'ciclo__veiculo'
    ).all()
    serializer_class = ProcessoLavagemSerializer
    permission_classes = [IsLavagem]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'ciclo']

    def perform_create(self, serializer):
        lavagem = serializer.save()
        
        HistoricoEvento.objects.create(
            veiculo=lavagem.ciclo.veiculo, # Navega do ciclo até ao veículo com segurança
            ciclo=lavagem.ciclo,
            tipo_evento="LAVAGEM_CRIADA",
            descricao="Veículo inserido na fila de lavagem.",
            autor=self.request.user
        )

    def perform_update(self, serializer):
        lavagem = serializer.save()
        
        HistoricoEvento.objects.create(
            veiculo=lavagem.ciclo.veiculo,
            ciclo=lavagem.ciclo,
            tipo_evento="LAVAGEM_STATUS_ALTERADO",
            descricao=f"Status da lavagem alterado para: {lavagem.get_status_display()}.",
            autor=self.request.user
        )

class EvidenciaFotoViewSet(viewsets.ModelViewSet):
    queryset = EvidenciaFoto.objects.all()
    serializer_class = EvidenciaFotoSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    # O SEGREDO ESTÁ AQUI: Ensina o Django a receber ficheiros pesados em vez de texto!
    parser_classes = (MultiPartParser, FormParser)
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['ciclo']

    def perform_create(self, serializer):
        # 1. Salva a foto com o utilizador
        foto = serializer.save(enviado_por=self.request.user)
        
        # 2. Salva o histórico com o utilizador
        HistoricoEvento.objects.create(
            veiculo=foto.ciclo.veiculo,
            ciclo=foto.ciclo,
            tipo_evento="EVIDENCIA_FOTOGRAFICA_ANEXADA",
            descricao=f"Foto anexada: {foto.descricao}.",
            autor=self.request.user
        )
