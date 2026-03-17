import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User
from .permissions import IsAdminUserCustom
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializer import RegisteredSerializer, LoginSerializer, ProfileCompletionSerializer, ResumeUploadSerializer, TimelineRoadmapSerializer, UserDetailSerializer
from .ai_services import suggest_job_roles , generate_career_analysis, parse_resume_with_ai, analyze_resume_against_job, generate_timeline_roadmap
from .models import CareerAnalysis, ResumeAnalysis, TimelineRoadmap
from .utils.resume_parser import extract_text_from_pdf, extract_text_from_docx
import requests
from django.contrib.auth import authenticate
from .permissions import IsAdminUserCustom
from django.contrib.auth import get_user_model


# from .serializer import LoginSerializer
# from .serializer import ProfileCompletionSerializer


class AdminLoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        user = authenticate(request, email=email, password=password)
        if user is not None and user.is_staff:
            refresh = RefreshToken.for_user(user)
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "admin": True
            })
        return Response(
            {"error": "Invalid admin credentials"},
            status=status.HTTP_401_UNAUTHORIZED
        )

User = get_user_model()

class AdminUserListView(APIView):
    permission_classes = [IsAdminUserCustom]
    def get(self, request):
        users = User.objects.all().order_by("-date_joined")
        data = []
        for user in users:
            data.append({
                "id": user.id,
                "full_name":user.full_name,
                "email": user.email,
                "target_job": user.target_job,
                "date_joined": user.date_joined,
                "is_staff":user.is_staff
            })
        return Response(data, status=status.HTTP_200_OK)


class AdminUserDetailView(APIView):
    permission_classes = [IsAdminUserCustom]
    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            serializer = UserDetailSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class AdminUpdateUserView(APIView):
    permission_classes = [IsAdminUserCustom]
    def put(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            user.education_level = request.data.get("education_level", user.education_level)
            user.stream = request.data.get("stream", user.stream)
            user.skills = request.data.get("skills", user.skills)
            user.interests = request.data.get("interests", user.interests)
            #convert string to array becuz  admin panel set it as string
            if isinstance(skills,str):
                skills =[s.strip() for s in skills.split(",") if s.strip()]
            
            if isinstance(interests,str):
                interests =[i.strip() for i in interests.split(",") if i.strip()]
            
            user.skills = skills
            user.interests = interests

            user.save()
            return Response({
                "id": user.id,
                "email": user.email,
                "education_level": user.education_level,
                "stream": user.stream,
                "skills": user.skills,
                "interests": user.interests
            })
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class AdminDeleteUserView(APIView):
    permission_classes = [IsAdminUserCustom]
    def delete(self, request, pk):
        try:
            user = User.objects.get(pk=pk)

            if user.is_staff:
                return Response(
                    {"error": "Admins cannot be deleted"},
                    status=status.HTTP_403_FORBIDDEN
                )

            user.delete()
            return Response(
                {"message": "User deleted successfully"},
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

class RegisterView(APIView):
    def post(self,request):
        serializer = RegisteredSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save() 
            return Response(
                {
                    "msg: user registered successfully"
                },
                status=status.HTTP_201_CREATED
            )
        #else
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_class = [AllowAny]
    def post(self,request):
        serializer=LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh=RefreshToken.for_user(user)
        return Response({
            "access":str(refresh.access_token),
            "refresh":str(refresh),
            "email":user.email,
            "full_name":user.full_name,
            "profile_completed": user.profile_completed,
            "target_job": user.target_job,
        }, status=status.HTTP_200_OK)
    


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        return Response({
            "email": user.email,
            "full_name": user.full_name,
            "education_level": user.education_level,
            "stream": user.stream,
            "skills": user.skills,
            "interests": user.interests,
            "target_job": user.target_job,
            "profile_completed": user.profile_completed,
        })

class ProfileCompletionView(APIView):
    permission_classes=[IsAuthenticated]
    def put(self,request):
        user=request.user
        serializer=ProfileCompletionSerializer(
            user,data=request.data,partial=True
        ) #partial=True means user doen't have to send all fields at once
        serializer.is_valid(raise_exception=True)
        serializer.save()
        CareerAnalysis.objects.filter(user=user).delete()
        return Response({
            "msg":"Profile Completed Successfully!",
            "profile_completed":True
        })



class JobRoleSuggestionView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        # Ensure user has completed profile
        if not user.profile_completed:
            return Response(
                {"error": "Complete your profile first!"},
                status=status.HTTP_400_BAD_REQUEST
            )
        # Call AI service
        try:
            ai_response = suggest_job_roles(user)
            # Safety check: ensure 'job_roles' exists
            if "job_roles" not in ai_response:
                return Response(
                    {"error": "AI service returned invalid data."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            return Response(ai_response)
        except Exception as e:
            return Response(
                {"error": f"Job role suggestion failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



class CareerAnalysisView(APIView):
    print("carrer analysis view hit here perfectly 🤭")
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        if not user.target_job:
            return Response(
                {"error": "Target job role not selected"},
                status=status.HTTP_400_BAD_REQUEST
            )
        #Check cache
        try:
            print("try block of view is called 😈")
            analysis = CareerAnalysis.objects.get(user=user)
            return Response(analysis.data)
        except CareerAnalysis.DoesNotExist:
            pass
        #Generate via AI
        ai_data = generate_career_analysis(user)

        #Save to DB
        analysis, created = CareerAnalysis.objects.get_or_create(
            user=user,
            defaults={"data": ai_data}
        )
        # If already exists, update it
        if not created:
            analysis.data = ai_data
            analysis.save()

        return Response(analysis.data, status=status.HTTP_200_OK)






class ResumeAnalysisView(APIView):
    permission_classes = [IsAuthenticated]
    # GET → Fetch saved analysis
    def get(self, request):
        user = request.user
        try:
            analysis = ResumeAnalysis.objects.get(user=user)
            return Response({
                "extracted_data": analysis.extracted_data,
                "analysis": analysis.data,
                "resume_file": analysis.resume_file.url if analysis.resume_file else None,
                "resume_name": analysis.resume_file.name.split("/")[-1] if analysis.resume_file else None
            })
        except ResumeAnalysis.DoesNotExist:
            return Response(
                {"message": "No resume analysis found."},
                status=status.HTTP_404_NOT_FOUND
            )
    #  POST → Upload new resume & re-analyze
    def post(self, request):
        serializer = ResumeUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        resume_file = serializer.validated_data["resume"]
        # Extract text
        if resume_file.name.endswith(".pdf"):
            resume_text = extract_text_from_pdf(resume_file)
        else:
            resume_text = extract_text_from_docx(resume_file)
        if not resume_text:
            return Response(
                {"error": "Could not extract text from resume"},
                status=status.HTTP_400_BAD_REQUEST
            )
        user = request.user
        target_job = getattr(user, "target_job", None)
        if not target_job:
            return Response(
                {"error": "Target job role not found in profile"},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            parsed_resume = parse_resume_with_ai(resume_text)
            analysis_data = analyze_resume_against_job(parsed_resume, target_job)
            # Save or update
            obj, created = ResumeAnalysis.objects.get_or_create(
                user=user,
                defaults={
                    "data": analysis_data,
                    "extracted_data": parsed_resume,
                    "resume_file": resume_file
                }
            )
            if not created:
                obj.data = analysis_data
                obj.extracted_data = parsed_resume
                obj.resume_file = resume_file
                obj.save()
            return Response({
                "extracted_data": parsed_resume,
                "analysis": analysis_data
            }, status=status.HTTP_200_OK)
        except json.JSONDecodeError:
            return Response(
                {"error": "AI response was not valid JSON"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return Response(
                {"error": "Resume analysis failed", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



class TimelineRoadmapView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            roadmap = TimelineRoadmap.objects.get(user=request.user)

            return Response({
                "roadmap_data": roadmap.roadmap_data,
                "duration": roadmap.duration,
                "unit": roadmap.unit,
                "target_job": roadmap.target_job
            }, status=status.HTTP_200_OK)

        except TimelineRoadmap.DoesNotExist:
            return Response(
                {"roadmap_data": None},
                status=status.HTTP_200_OK
            )

    def post(self, request):
        user = request.user
        duration = request.data.get("duration")
        unit = request.data.get("unit")

        if not duration or not unit:
            return Response(
                {"error": "Duration and unit required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user.target_job:
            return Response(
                {"error": "Target job role not set in profile"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            roadmap_json = generate_timeline_roadmap(
                education=user.education_level,
                stream=user.stream,
                skills=user.skills or [],
                target_job=user.target_job,
                duration=duration,
                unit=unit
            )

            obj, created = TimelineRoadmap.objects.update_or_create(
                user=user,
                defaults={
                    "target_job": user.target_job,
                    "duration": duration,
                    "unit": unit,
                    "roadmap_data": roadmap_json
                }
            )

            return Response({
                "roadmap_data": roadmap_json
            }, status=status.HTTP_200_OK)

        except json.JSONDecodeError:
            return Response(
                {"error": "AI response was not valid JSON"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        except Exception as e:
            return Response(
                {"error": "Roadmap generation failed", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        







        #temporary added 
class CreateAdminView(APIView):
    def get(self, request):
        User = get_user_model()

        # check if admin already exists
        if User.objects.filter(email="jap.arora.2026@gmail.com").exists():
            return Response(
                {"msg": "Admin already exists"},
                status=status.HTTP_200_OK
            )

        # create superuser using your model fields
        user = User(
            email="jap.arora.2026@gmail.com",
            full_name="Japleen Arora"
        )
        user.set_password("imnotfine1234")
        user.is_staff = True
        user.is_superuser = True
        user.save()

        return Response(
            {"msg": "Admin created successfully"},
            status=status.HTTP_201_CREATED
        )