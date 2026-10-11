from rest_framework import serializers
from .models import VistoriaQualidade, ProcessoLavagem
from .models import EvidenciaFoto

class VistoriaQualidadeSerializer(serializers.ModelSerializer):
    veiculo_placa = serializers.CharField(source='veiculo.placa', read_only=True)
    etapa_display = serializers.CharField(source='get_etapa_display', read_only=True)
    resultado_display = serializers.CharField(source='get_resultado_display', read_only=True)

    class Meta:
        model = VistoriaQualidade
        fields = '__all__'


class ProcessoLavagemSerializer(serializers.ModelSerializer):
    veiculo_placa = serializers.CharField(
        source='ciclo.veiculo.placa',
        read_only=True
    )

    ciclo_numero = serializers.IntegerField(
        source='ciclo.numero_ciclo',
        read_only=True
    )

    class Meta:
        model = ProcessoLavagem
        fields = '__all__'


class EvidenciaFotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvidenciaFoto
        fields = '__all__'
        read_only_fields = ['enviado_por', 'enviado_em']