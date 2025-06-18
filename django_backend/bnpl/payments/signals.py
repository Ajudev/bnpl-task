from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import PaymentPlan, Installment
from dateutil.relativedelta import relativedelta

@receiver(post_save, sender=PaymentPlan)
def create_installments(sender, instance, created, **kwargs):
    if created:
        # Create installments
        installment_amount = instance.installment_amount
        current_date = instance.start_date
        
        for i in range(instance.installment_count):
            Installment.objects.create(
                payment_plan=instance,
                amount=installment_amount,
                due_date=current_date,
                installment_number=i + 1
            )
            current_date += relativedelta(months=1)

@receiver(post_save, sender=Installment)
def update_payment_plan_status(sender, instance, **kwargs):
    plan = instance.payment_plan
    total_installments = plan.installments.count()
    paid_installments = plan.installments.filter(status='paid').count()
    
    if paid_installments == total_installments:
        plan.status = 'completed'
        plan.save()