from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils import timezone
from .managers import UserManager
from django.conf import settings

#user model
class User(AbstractBaseUser, PermissionsMixin):
    Edu_choices=(
        ('UG','Undergraduate'),
        ('PG','Postgraduate'),
    )
    full_name=models.CharField(max_length=100)
    email=models.EmailField(unique=True)
    education_level=models.CharField(max_length=2, choices=Edu_choices, blank=True, null=True)
    stream=models.CharField(max_length=100, blank=True, null=True)
    skills=models.JSONField(default=list, blank=True, null=True)
    interests=models.JSONField(default=list, blank=True, null=True)
    target_job=models.CharField(max_length=100,blank=True, null=True)
    profile_completed=models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True) #user can login if true
    is_staff = models.BooleanField(default=False) #can't access admin panel if false
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']
    objects = UserManager()
    def __str__(self):
        return self.email


#carrer analysis model
class CareerAnalysis(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="career_analysis"
    )
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"CareerAnalysis for {self.user.email}"



# Resume analysis model
class ResumeAnalysis(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="resume_analysis"
    )
    resume_file = models.FileField(upload_to="resumes/",null=True, blank=True)
    data = models.JSONField()
    extracted_data = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"ResumeAnalysis for {self.user.email}"


#timeline based rodemap
class TimelineRoadmap(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="timeline_roadmap"
    )
    target_job = models.CharField(max_length=100)
    duration = models.IntegerField()
    unit = models.CharField(max_length=20)
    roadmap_data = models.JSONField()
    created_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"{self.user.email} - {self.target_job}"

