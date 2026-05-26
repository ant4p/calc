from django.urls import path

from src.views import (
    ShowIndex
)

app_name = 'src'

urlpatterns = [
    path('', ShowIndex.as_view(), name='index'),
]