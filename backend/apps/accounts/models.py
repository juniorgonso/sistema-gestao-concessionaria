from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db import models


class CustomUser(AbstractUser):
    """
    Usuário personalizado do sistema.
    Utilizado para autenticação e acesso ao sistema.
    """

    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'

    def __str__(self):
        return self.get_full_name() or self.username


class Funcao(models.Model):
    """
    Função operacional exercida pelo funcionário.
    """

    nome = models.CharField(max_length=100, unique=True)
    descricao = models.TextField(blank=True)
    ativa = models.BooleanField(default=True)

    class Meta:
        verbose_name = 'Função'
        verbose_name_plural = 'Funções'
        ordering = ['nome']

    def __str__(self):
        return self.nome


class Funcionario(models.Model):
    """
    Representa o funcionário dentro da operação da concessionária.
    """

    usuario = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='funcionario',
    )

    nome = models.CharField(max_length=150)
    matricula = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        null=True,
    )

    concessionaria = models.ForeignKey(
        'concessionaria.Concessionaria',
        on_delete=models.PROTECT,
        related_name='funcionarios',
    )

    unidade = models.ForeignKey(
        'concessionaria.Unidade',
        on_delete=models.PROTECT,
        related_name='funcionarios',
    )

    funcao = models.ForeignKey(
        Funcao,
        on_delete=models.PROTECT,
        related_name='funcionarios',
    )

    ativo = models.BooleanField(default=True)

    data_admissao = models.DateField(
        blank=True,
        null=True,
    )

    data_desligamento = models.DateField(
        blank=True,
        null=True,
    )

    observacao = models.TextField(blank=True)

    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Funcionário'
        verbose_name_plural = 'Funcionários'
        ordering = ['nome']

    def __str__(self):
        return self.nome


class VinculoSetor(models.Model):
    """
    Permite que um funcionário esteja vinculado a um ou mais setores.
    """

    funcionario = models.ForeignKey(
        Funcionario,
        on_delete=models.CASCADE,
        related_name='vinculos_setor',
    )

    setor = models.ForeignKey(
        'concessionaria.Setor',
        on_delete=models.PROTECT,
        related_name='vinculos_funcionarios',
    )

    principal = models.BooleanField(default=False)
    ativo = models.BooleanField(default=True)

    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Vínculo com Setor'
        verbose_name_plural = 'Vínculos com Setores'

        constraints = [
            models.UniqueConstraint(
                fields=['funcionario', 'setor'],
                name='unique_funcionario_setor',
            )
        ]

    def __str__(self):
        return f'{self.funcionario.nome} - {self.setor.nome}'
        