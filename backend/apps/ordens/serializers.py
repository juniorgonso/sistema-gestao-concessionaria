from rest_framework import serializers
from .models import Servico, Autorizacao

class AutorizacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Autorizacao
        fields = '__all__'

class ServicoSerializer(serializers.ModelSerializer):
    veiculo_placa = serializers.CharField(source='veiculo.placa', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    autorizacao = AutorizacaoSerializer(read_only=True)

    class Meta:
        model = Servico
        fields = '__all__'
        