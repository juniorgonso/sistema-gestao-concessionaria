from rest_framework import serializers
from .models import Concessionaria, Unidade, Setor, Fornecedor, Ocorrencia, DemandaExterna, EvidenciaFoto

class ConcessionariaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Concessionaria
        fields = '__all__'

class UnidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unidade
        fields = '__all__'

class SetorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setor
        fields = '__all__'

class FornecedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fornecedor
        fields = '__all__'

class OcorrenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ocorrencia
        fields = '__all__'

class DemandaExternaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DemandaExterna
        fields = '__all__'

class EvidenciaFotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvidenciaFoto
        fields = '__all__'