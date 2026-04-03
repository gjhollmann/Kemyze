from django.db import models

# Create your models here.
class Containers(models.Model):
    container_id = models.AutoField(primary_key=True)
    chemical_name = models.CharField(max_length=255)
    cas_number = models.CharField(max_length=12, blank=True, null=True)
    expr_date = models.DateField(blank=True, null=True)
    acqn_date = models.DateField()
    location = models.ForeignKey('Locations', models.DO_NOTHING, blank=True, null=True)
    quantity = models.CharField(max_length=6)

    class Meta:
        managed = False
        db_table = 'containers'

class Locations(models.Model):
    location_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=7)
    parent = models.ForeignKey('self', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'locations'


class TesterTesttable(models.Model):
    id = models.BigAutoField(primary_key=True)
    testname = models.CharField(db_column='testName', max_length=255)  # Field name made lowercase.
    testphrase = models.CharField(db_column='testPhrase', max_length=255)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'tester_testtable'


class Users(models.Model):
    user_id = models.PositiveIntegerField(primary_key=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.CharField(unique=True, max_length=255)
    phone = models.CharField(max_length=20, blank=True, null=True)
    password = models.CharField(max_length=255)
    access_level = models.PositiveIntegerField()
    location = models.ForeignKey(Locations, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'users'
