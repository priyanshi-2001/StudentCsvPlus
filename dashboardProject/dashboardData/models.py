from django.db import models
from datetime import datetime
# Create your models here.
class instituteData(models.Model):
    name=models.CharField(max_length=150)
    address=models.CharField(max_length=300)
    state=models.CharField(max_length=100)
    email=models.CharField(max_length=100,null=True,blank=True)
    contactNumber1=models.CharField(max_length=10)
    contactNumber2=models.CharField(max_length=10)



class StudentsData(models.Model):
    name=models.CharField(max_length=200)
    age=models.IntegerField()
    email=models.CharField(max_length=100,null=True,blank=True)
    schoolName=models.ForeignKey(instituteData,on_delete=models.CASCADE)
    mother_name=models.CharField(max_length=300,blank=True,null=True)
    father_name=models.CharField(max_length=300,blank=True,null=True)
    class_std=models.CharField(max_length=3,blank=True,null=True)
    dateCreated=models.DateTimeField(default=datetime.now())
    dateModified=models.DateTimeField(default=datetime.now())




