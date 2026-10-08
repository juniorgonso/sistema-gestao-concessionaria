from django.db import models
from apps.veiculos.models import Veiculo

class Servico(models.Model):
    STATUS_CHOICES = [
        ('SOLICITADO', 'Solicitado (Aguardando Análise)'),
        ('AGUARDANDO_AUTORIZACAO', 'Aguardando Autorização Administrativa'),
        ('AUTORIZADO', 'Autorizado / Em Fila'),
        ('EM_EXECUCAO', 'Em Execução na Oficina'),
        ('CONCLUIDO', 'Concluído'),
    ]

    veiculo = models.ForeignKey(Veiculo, on_delete=models.CASCADE, related_name='servicos', verbose_name="Veículo")
    descricao = models.CharField(max_length=255, verbose_name="Descrição do Serviço")
    setor_executor = models.CharField(max_length=100, default="Oficina (Mecânica)", verbose_name="Setor Executor")
    
    # Controle de fluxo
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='SOLICITADO', verbose_name="Status do Serviço")
    precisa_autorizacao = models.BooleanField(default=True, verbose_name="Requer Autorização?")
    
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Serviço"
        verbose_name_plural = "Serviços"
        ordering = ['-criado_em']

    def __str__(self):
        return f"{self.descricao} - {self.veiculo.placa}"


class Autorizacao(models.Model):
    STATUS_CHOICES = [
        ('PENDENTE', 'Pendente'),
        ('APROVADA', 'Aprovada'),
        ('RECUSADA', 'Recusada'),
    ]
    
    servico = models.OneToOneField(Servico, on_delete=models.CASCADE, related_name='autorizacao', verbose_name="Serviço Relacionado")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDENTE', verbose_name="Decisão")
    observacao = models.TextField(blank=True, null=True, verbose_name="Justificativa / Observação")
    
    criada_em = models.DateTimeField(auto_now_add=True)
    respondida_em = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Autorização"
        verbose_name_plural = "Autorizações"

    def __str__(self):
        return f"Autorização {self.id} - {self.status}"