from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()

class PaymentPlan(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    merchant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='merchant_plans')
    customer_email = models.EmailField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    installment_count = models.IntegerField()
    start_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['merchant', 'status']),
            models.Index(fields=['customer_email']),
        ]

    def __str__(self):
        return f"Plan {self.id} - {self.total_amount} SAR"

    @property
    def installment_amount(self):
        return self.total_amount / self.installment_count

    @property
    def paid_amount(self):
        return sum(inst.amount for inst in self.installments.filter(status='paid'))

    @property
    def remaining_amount(self):
        return self.total_amount - self.paid_amount

    @property
    def progress_percentage(self):
        if self.total_amount == 0:
            return 0
        return (self.paid_amount / self.total_amount) * 100

class Installment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment_plan = models.ForeignKey(PaymentPlan, on_delete=models.CASCADE, related_name='installments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    paid_at = models.DateTimeField(null=True, blank=True)
    installment_number = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['installment_number']
        indexes = [
            models.Index(fields=['payment_plan', 'status']),
            models.Index(fields=['due_date', 'status']),
        ]

    def __str__(self):
        return f"Installment {self.installment_number} - {self.amount} SAR"

    @property
    def is_overdue(self):
        return (self.status == 'pending' or self.status == 'overdue') and self.due_date < timezone.now().date()

    def mark_overdue(self):
        if self.is_overdue:
            self.status = 'overdue'
            self.save()
