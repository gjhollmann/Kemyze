from django.db import models

# Create your models here.
class TestTable(models.Model):
    testName = models.CharField(max_length=255)
    testPhrase = models.CharField(max_length=255)

class Container(models.Model):
    chemical_name = models.CharField(max_length=255)
    cas_number = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    quantity = models.FloatField()
    unit = models.CharField(max_length=50)
    status = models.CharField(max_length=100)
    date_added = models.DateTimeField(auto_now_add=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.chemical_name