from rest_framework import serializers
from .models import Fornecedor, DemandaExterna, EvidenciaFoto, Ocorrencia

class FornecedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fornecedor
        fields = '__all__'

class EvidenciaFotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvidenciaFoto
        fields = '__all__'
        read_only_fields = ['autor', 'criado_em']

class DemandaExternaSerializer(serializers.ModelSerializer):
    solicitante_nome = serializers.CharField(source='solicitante.username', read_only=True)
    responsavel_nome = serializers.CharField(source='responsavel.username', read_only=True)
    
    class Meta:
        model = DemandaExterna
        fields = '__all__'
        read_only_fields = ['criado_em', 'solicitante']

class OcorrenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ocorrencia
        fields = '__all__'