import os
from celery import Celery
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bnpl.settings')

app = Celery('bnpl')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()