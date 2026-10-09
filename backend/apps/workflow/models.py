from django.db import models
from apps.veiculos.models import Veiculo, CicloVeiculo

class HistoricoEvento(models.Model):
    veiculo = models.ForeignKey(Veiculo, on_delete=models.CASCADE, related_name='historico', verbose_name="Veículo")
    ciclo = models.ForeignKey(CicloVeiculo, on_delete=models.CASCADE, related_name='eventos', null=True, blank=True, verbose_name="Ciclo")
    tipo_evento = models.CharField(max_length=100, verbose_name="Tipo de Evento (Ex: MUDANCA_ETAPA, OCORRENCIA_CRIADA)")
    descricao = models.TextField(verbose_name="Detalhe da Movimentação")
    autor = models.CharField(max_length=150, blank=True, null=True, verbose_name="Responsável / Sistema")
    registrado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Histórico e Auditoria"
        verbose_name_plural = "Históricos e Auditorias"
        ordering = ['-registrado_em']

    def __str__(self):
        return f"[{self.tipo_evento}] {self.veiculo.placa} em {self.registrado_em}"


class VistoriaQualidade(models.Model):
    ETAPA_CHOICES = [
        ('POS_OFICINA', 'Qualidade Pós-Oficina'),
        ('FINAL', 'Qualidade Final'),
    ]
    RESULTADO_CHOICES = [
        ('APROVADO', 'Aprovado'),
        ('REPROVADO', 'Reprovado / Gerou Nova Ocorrência'),
    ]

    veiculo = models.ForeignKey(Veiculo, on_delete=models.CASCADE, related_name='vistorias')
    etapa = models.CharField(max_length=20, choices=ETAPA_CHOICES)
    resultado = models.CharField(max_length=20, choices=RESULTADO_CHOICES)
    observacoes = models.TextField(blank=True, null=True)
    realizado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Vistoria {self.etapa} - {self.veiculo.placa} [{self.resultado}]"


class ProcessoLavagem(models.Model):
    STATUS_CHOICES = [
        ('FILA', 'Na Fila'),
        ('EM_ANDAMENTO', 'Em Andamento'),
        ('CONCLUIDO', 'Concluído'),
    ]

    veiculo = models.OneToOneField(Veiculo, on_delete=models.CASCADE, related_name='lavagem')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='FILA')
    responsavel = models.CharField(max_length=100, blank=True, null=True)
    iniciado_em = models.DateTimeField(blank=True, null=True)
    concluido_em = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Lavagem {self.veiculo.placa} - {self.status}"