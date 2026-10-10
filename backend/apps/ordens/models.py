from django.db import models
from apps.veiculos.models import Veiculo, CicloVeiculo

class Servico(models.Model):
    STATUS_CHOICES = [
        ('SOLICITADO', 'Solicitado'),
        ('AUTORIZADO', 'Autorizado'),
        ('RECUSADO', 'Recusado'),
        ('EM_EXECUCAO', 'Em Execução'),
        ('CONCLUIDO', 'Concluído'),
    ]

    veiculo = models.ForeignKey(Veiculo, on_delete=models.CASCADE, related_name='servicos', verbose_name="Veículo")
    ciclo = models.ForeignKey(CicloVeiculo, on_delete=models.PROTECT, related_name='servicos', verbose_name="Ciclo Operacional", null=True, blank=True)
    descricao = models.CharField(max_length=255, verbose_name="Descrição do Serviço")
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='SOLICITADO', verbose_name="Status")
    precisa_autorizacao = models.BooleanField(default=True)
    
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Serviço"
        verbose_name_plural = "Serviços"

    def __str__(self):
        return f"{self.descricao} - {self.veiculo.placa}"


class Autorizacao(models.Model):
    STATUS_CHOICES = [
        ('PENDENTE', 'Pendente'),
        ('APROVADA', 'Aprovada'),
        ('RECUSADA', 'Recusada'),
    ]
    
    servico = models.OneToOneField(Servico, on_delete=models.CASCADE, related_name='autorizacao')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDENTE')
    observacao = models.TextField(blank=True, null=True)
    respondida_em = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Autorização {self.status} para Serviço #{self.servico.id}"


class ExecucaoServico(models.Model):
    servico = models.ForeignKey(Servico, on_delete=models.CASCADE, related_name='execucoes', verbose_name="Serviço")
    executor = models.CharField(max_length=150, verbose_name="Nome do Executor / Mecânico / Pintor")
    iniciado_em = models.DateTimeField(auto_now_add=True, verbose_name="Início da Execução")
    concluido_em = models.DateTimeField(blank=True, null=True, verbose_name="Fim da Execução")
    observacoes = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Execução de Serviço"
        verbose_name_plural = "Execuções de Serviços"

    def __str__(self):
        return f"Execução de {self.servico.descricao} por {self.executor}"