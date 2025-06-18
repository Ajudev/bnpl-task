from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.merchant_dashboard, name='merchant_dashboard'),
]