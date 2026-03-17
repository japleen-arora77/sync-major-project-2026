from django.urls import path
from accounts.views import RegisterView, LoginView, ProfileView, ProfileCompletionView, JobRoleSuggestionView, CareerAnalysisView, ResumeAnalysisView, TimelineRoadmapView
from accounts.views import AdminLoginView, AdminUserListView, AdminUserDetailView, AdminUpdateUserView, AdminDeleteUserView, CreateAdminView
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('complete-profile/', ProfileCompletionView.as_view(), name='complete-profile'),
    path('suggest-jobs/',JobRoleSuggestionView.as_view(), name='suggest-jobs'),  #AI api
    path('career-analysis/',CareerAnalysisView.as_view(), name='career-analysis'), #AI api
    path("resume-analysis/", ResumeAnalysisView.as_view(), name="resume-analysis"), #AI api
    path("timeline-roadmap/", TimelineRoadmapView.as_view(), name="timeline-roadmap"), #AI api

    path("admin/login/", AdminLoginView.as_view(), name="admin-login"),
    path("admin/users/", AdminUserListView.as_view(), name="admin-users"),
    path("admin/users/<int:pk>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
    path("admin/users/<int:pk>/update/", AdminUpdateUserView.as_view()),
    path("admin/users/<int:pk>/delete/", AdminDeleteUserView.as_view()),

    path('create-admin/', CreateAdminView.as_view()),
]