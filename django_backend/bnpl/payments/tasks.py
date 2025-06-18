from celery import shared_task
from django.core.mail import send_mail
from django.utils import timezone
from .models import Installment

@shared_task
def send_payment_reminders_batch():
    installments = Installment.objects.all()
    for installment in installments:
        if installment.status == "pending":
            subject = f"Payment Reminder - Installment Due"
            message = f"""
            Dear Customer,
            
            This is a reminder that your installment payment of {installment.amount} SAR 
            is due on {installment.due_date}.
            
            Please make your payment to avoid any late fees.
            
            Thank you!
            """
            send_email = True
        elif installment.status == "overdue":
            subject = f"Payment Reminder - Installment Overdue"
            message = f"""
            Dear Customer,
            
            This is a reminder that your installment payment of {installment.amount} SAR 
            was due on {installment.due_date}.
            
            Please make your payment as soon as possible.
            
            Thank you!
            """
            send_email = True
        else:
            send_email = False
        
        if send_email:
            # In production, you would send to the actual customer email
            send_mail(
                subject=subject,
                message=message,
                recipient_list=[installment.payment_plan.customer_email],
                fail_silently=True,
            )
        
        print(f"Reminder sent for installment {installment.id}")
    return "Task has been successfully executed"


@shared_task
def mark_overdue_installments():
    """Mark installments as overdue if past due date"""
    overdue_installments = Installment.objects.filter(
        status='pending',
        due_date__lt=timezone.now().date()
    )
    
    count = 0
    for installment in overdue_installments:
        installment.status = 'overdue'
        installment.save()
        count += 1
    
    return f"Marked {count} installments as overdue"