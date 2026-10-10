from rest_framework import serializers
from .models import Veiculo, CicloVeiculo

class CicloVeiculoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CicloVeiculo
        fields = '__all__'

class VeiculoSerializer(serializers.ModelSerializer):
    loja_display = serializers.CharField(source='get_loja_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    # Genialidade aqui: Quando o mobile puxar o veículo, já puxa os ciclos associados!
    ciclos = CicloVeiculoSerializer(many=True, read_only=True) 

    class Meta:
        model = Veiculo
        fields = '__all__'