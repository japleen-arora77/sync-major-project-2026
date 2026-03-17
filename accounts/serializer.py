from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import User, TimelineRoadmap
from rest_framework import serializers
from .models import User


class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "email",
            "education_level",
            "stream",
            "skills",
            "interests",
            "target_job",
            "date_joined",
            "is_staff",
        ]
        
#ModelSerializer automaticappy maps the model fields
class RegisteredSerializer(serializers.ModelSerializer):
    password=serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields =(
            'email', 
            'full_name',
            'password'
        )
    def create(self, validate_data):
        password=validate_data.pop('password')
        user=User(**validate_data)
        user.set_password(password)
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    def validate(self, data):
        email = data.get("email")
        password = data.get("password")
                #authenticate is in built auth system for django
        user = authenticate(email=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid email or password")
        data["user"] = user
        return data

class ProfileCompletionSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields =[
            "education_level",
            "stream",
            "skills",
            "interests",
            "target_job"
        ]
        extra_kwargs = {
            "target_job": {"required": False}
        }
        #update() is called automatically when we update an existing user
    def update(self,instance, validate_data):
        #update fields
        for attr, value in validate_data.items():
            setattr(instance,attr, value)
        # mark profile completed based on REQUIRED fields only
        required_fields = [
            instance.education_level,
            instance.stream,
            instance.skills,
            instance.interests
        ]
        instance.profile_completed=True
        instance.save()
        return instance


class ResumeUploadSerializer(serializers.Serializer):
    resume = serializers.FileField()
    def validate_resume(self, file):
        allowed_types = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ]
        if file.content_type not in allowed_types:
            raise serializers.ValidationError("Only PDF or DOCX files are allowed.")
        return file


class TimelineRoadmapSerializer(serializers.ModelSerializer):
    class Meta:
        model=TimelineRoadmap
        fields="__all__"
        read_only_fields=["user","roadmap_data","created_at"]