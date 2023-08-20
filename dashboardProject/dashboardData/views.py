from django.shortcuts import render
from django.http import JsonResponse
from django.views import View
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
import json
from operator import itemgetter
from datetime import datetime
from django.db.models import Q
from django.core import serializers
import csv
from django.db.models import Subquery, OuterRef
from django.db.models import F, Value
from django.core.files.uploadedfile import InMemoryUploadedFile
import re
from django.http import HttpResponse
from .models import StudentsData,instituteData
# Create your views here.
class DashboardData(View):
    @classmethod
    def getData(self,request):
        try:
            if request.method=='GET':
                page=request.GET.get('page',1)
                name=request.GET.get('name',None)
                age=request.GET.get('age',None)
                email=request.GET.get('email',None)
                schoolName=request.GET.get('schoolName',None)
                standard=request.GET.get('standard',None)
                data=StudentsData.objects.all().order_by('-dateModified')

                if name and name!='':
                    combined_query = Q(name__exact=name) | Q(name__icontains=name)
                    data = data.filter(combined_query).order_by('-dateModified')
                if age and age!='':
                    data = data.filter(age=int(age)).order_by('-dateModified')
                if standard and standard!='':
                    data = data.filter(class_std=int(standard)).order_by('-dateModified')
                if email and email!='':
                    combined_query = Q(email__exact=email) | Q(email__icontains=email)
                    data = data.filter(combined_query).order_by('-dateModified')
                if schoolName and schoolName!='':
                    schoolId=list(instituteData.objects.filter(name__icontains=schoolName).values_list('id',flat=True))
                    data = data.filter(schoolName__in=schoolId).order_by('-dateModified')
                
                startIndex=( int(page)-1)*20
                endIndex=startIndex+20

                paginated_data=data[startIndex:endIndex]
                school_id_values=set(x.schoolName_id for x in paginated_data)
                filteredSchoolNames=instituteData.objects.filter(id__in=list(school_id_values))
                schoolData={x.id:x.name  for x in filteredSchoolNames} 
                res=[{'id': x.id,'dateModified':x.dateModified,'name': x.name,'age':x.age,'schoolName':schoolData.get(x.schoolName_id, 'Unknown'),'email':x.email,'mother_name':x.mother_name,'father_name':x.father_name,"class_std":x.class_std} for x in paginated_data] 

                if len(paginated_data)==0:
                    return JsonResponse({'Error':'no data found'})
                return JsonResponse({'Error':'NA','data':res})
            return JsonResponse({'Error':'Method Error'})
        except Exception as ex:
             return JsonResponse({'Error':str(ex)})


    def is_valid_name(name):
        return re.match(r'^[A-Za-z ]+$', name) is not None

    def is_valid_age(age):
        return age.isdigit() and int(age) > 0

    def is_valid_email(email):
        import re
        return re.match(r'^[\w\.-]+@[\w\.-]+$', email) is not None

    def is_valid_class_std(class_std):
        return class_std.isdigit() and 5 <= int(class_std) <= 12
    
    @classmethod
    @csrf_exempt
    def uploadData(self,request):
        try:
            if request.method=='POST':
                csv_file=request.FILES['file']
                if isinstance(csv_file, InMemoryUploadedFile):
                    decoded_file = csv_file.read().decode('utf-8')
                    csv_data = csv.reader(decoded_file.splitlines(), delimiter=',')
                    header = next(csv_data, None)
                    successCases=0
                    failedCases=[]
                    for row in csv_data:
                        if len(row)!=7:
                            continue

                        name, email,age, schoolName,mother_name ,father_name,class_std= row
                        if(
                            self.is_valid_name(name) and
                            self.is_valid_email(email) and
                            self.is_valid_age(age) and
                            self.is_valid_name(schoolName) and
                            self.is_valid_name(mother_name) and
                            self.is_valid_name(father_name) and
                            self.is_valid_class_std(class_std)
                        ):
                            instFound=instituteData.objects.filter(name=schoolName.upper()).last()
                            if instFound:
                                newRecord=StudentsData(dateCreated=datetime.now(),dateModified=datetime.now(), name=name,age=age,email=email,mother_name=mother_name,father_name=father_name,class_std=class_std,schoolName= instFound)
                                newRecord.save()
                                successCases+=1
                        else:
                            failedCases.append(row)
                    return JsonResponse({'Error':'NA','failedCases':failedCases,'successCases':successCases})
                else:
                    return JsonResponse({'Error':'Error in fileData'})
                
                
            return JsonResponse({'Error':'Method Error'})
        except Exception as ex:
             return JsonResponse({'Error':str(ex)})


    def download_csv(request):
        try:
            data = [
                {"name":"Dummy","email":"test@gmail.com","age":"21","schoolName":"Delhi Public School","mother_name":"Anuja","father_name":"Piramal","class_std":"10"}
            ]
            
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="data.csv"'
            
            writer = csv.DictWriter(response, fieldnames=["name", "email","age", "schoolName", "mother_name", "father_name", "class_std"])
            writer.writeheader()
            
            for item in data:
                writer.writerow(item)
            
            return response
        except Exception as ex:
            return HttpResponse("Error", status=500)