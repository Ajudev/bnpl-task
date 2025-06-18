from rest_framework import serializers
from .models import PaymentPlan, Installment

class InstallmentSerializer(serializers.ModelSerializer):
    is_overdue = serializers.ReadOnlyField()
    
    class Meta:
        model = Installment
        fields = ['id', 'amount', 'due_date', 'status', 'paid_at', 
                 'installment_number', 'is_overdue']

class PaymentPlanSerializer(serializers.ModelSerializer):
    installments = InstallmentSerializer(many=True, read_only=True)
    installment_amount = serializers.ReadOnlyField()
    paid_amount = serializers.ReadOnlyField()
    remaining_amount = serializers.ReadOnlyField()
    progress_percentage = serializers.ReadOnlyField()
    merchant_name = serializers.CharField(source='merchant.username', read_only=True)
    
    class Meta:
        model = PaymentPlan
        fields = ['id', 'merchant_name', 'customer_email', 'total_amount', 
                 'installment_count', 'start_date', 'status', 'created_at',
                 'installment_amount', 'paid_amount', 'remaining_amount',
                 'progress_percentage', 'installments']

class PaymentPlanCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentPlan
        fields = ['customer_email', 'total_amount', 'installment_count', 'start_date']

    def validate_installment_count(self, value):
        if value < 2 or value > 12:
            raise serializers.ValidationError("Installment count must be between 2 and 12")
        return value

    def validate_total_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Total amount must be positive")
        return value
