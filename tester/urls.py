from django.urls import path
from . import views

urlpatterns = [
    path('', views.tester, name='tester'),
    path('dbtest', views.dbtester, name='dbtester'),
    path('containers/', views.get_all_containers, name='get_all_containers'),
    path('search/', views.search_containers, name='search_containers'),
]