from django.db import models

class Veiculo(models.Model):
    LOJAS_CHOICES = [
        ('GRAN_VIA', 'Gran Via'),
        ('EUROVIA', 'Eurovia'),
        ('PIEDADE', 'Piedade'),
    ]
    
    STATUS_CHOICES = [
        ('AVALIADOR', 'Avaliador'),
        ('OFICINA', 'Oficina'),
        ('QUALIDADE_POS', 'Qualidade Pós-Oficina'),
        ('LAVAGEM', 'Lavagem'),
        ('QUALIDADE_FINAL', 'Qualidade Final'),
        ('SHOWROOM', 'Showroom / Loja'),
    ]

    placa = models.CharField(max_length=10, unique=True, verbose_name="Placa")
    chassi = models.CharField(max_length=50, blank=True, null=True, verbose_name="Chassi")
    marca_modelo = models.CharField(max_length=150, verbose_name="Marca/Modelo")
    cor = models.CharField(max_length=50, blank=True, null=True, verbose_name="Cor")
    
    loja = models.CharField(max_length=20, choices=LOJAS_CHOICES, verbose_name="Loja de Destino")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVALIADOR', verbose_name="Etapa Atual")
    
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Veículo"
        verbose_name_plural = "Veículos"
        ordering = ['-criado_em']

    def __str__(self):
        return f"{self.placa} - {self.marca_modelo} ({self.get_loja_display()})"


class CicloVeiculo(models.Model):
    veiculo = models.ForeignKey(Veiculo, on_delete=models.CASCADE, related_name='ciclos', verbose_name="Veículo")
    numero_ciclo = models.PositiveIntegerField(verbose_name="Número do Ciclo")
    ativo = models.BooleanField(default=True, verbose_name="Ciclo Ativo?")
    iniciado_em = models.DateTimeField(auto_now_add=True)
    encerrado_em = models.DateTimeField(blank=True, null=True)

    class Meta:
        verbose_name = "Ciclo do Veículo"
        verbose_name_plural = "Ciclos dos Veículos"
        ordering = ['-numero_ciclo']

    def __str__(self):
        return f"Ciclo #{self.numero_ciclo} - {self.veiculo.placa}"