from django.db import models

# Create your models here.
class TestTable(models.Model):
    testName = models.CharField(max_length=255)
    testPhrase = models.CharField(max_length=255)