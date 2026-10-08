from django.db import models
from apps.veiculos.models import Veiculo

class VistoriaQualidade(models.Model):
    ETAPA_CHOICES = [
        ('POS_OFICINA', 'Qualidade Pós-Oficina'),
        ('FINAL', 'Qualidade Final (Pós-Lavagem)'),
    ]
    
    RESULTADO_CHOICES = [
        ('APROVADO', 'Aprovado (Liberado para próxima etapa)'),
        ('REPROVADO', 'Reprovado / Gerou Nova Ocorrência'),
    ]

    veiculo = models.ForeignKey(Veiculo, on_delete=models.CASCADE, related_name='vistorias', verbose_name="Veículo")
    etapa = models.CharField(max_length=20, choices=ETAPA_CHOICES, verbose_name="Etapa da Qualidade")
    resultado = models.CharField(max_length=20, choices=RESULTADO_CHOICES, default='APROVADO', verbose_name="Resultado")
    observacoes = models.TextField(blank=True, null=True, verbose_name="Laudo / Observações")
    
    # Controle de rastreabilidade temporal
    realizado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Vistoria de Qualidade"
        verbose_name_plural = "Vistorias de Qualidade"
        ordering = ['-realizado_em']

    def __str__(self):
        return f"Vistoria {self.get_etapa_display()} - {self.veiculo.placa} [{self.resultado}]"


class ProcessoLavagem(models.Model):
    STATUS_CHOICES = [
        ('FILA', 'Na Fila de Lavagem'),
        ('EM_ANDAMENTO', 'Em Execução'),
        ('CONCLUIDO', 'Concluído'),
    ]

    veiculo = models.OneToOneField(Veiculo, on_delete=models.CASCADE, related_name='lavagem', verbose_name="Veículo")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='FILA', verbose_name="Status da Lavagem")
    responsavel = models.CharField(max_length=100, blank=True, null=True, verbose_name="Responsável pela Lavagem")
    
    iniciado_em = models.DateTimeField(null=True, blank=True)
    concluido_em = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Processo de Lavagem"
        verbose_name_plural = "Processos de Lavagem"

    def __str__(self):
        return f"Lavagem - {self.veiculo.placa} ({self.status})"