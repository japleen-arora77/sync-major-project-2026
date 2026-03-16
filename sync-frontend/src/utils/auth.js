export const saveAuthData = (data) => {
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    localStorage.setItem("email", data.email);
    localStorage.setItem("full_name", data.full_name);
    localStorage.setItem("profile_completed", data.profile_completed);
  };
  
  export const getAccessToken = () => {
    return localStorage.getItem("access"); 
  };
  
  export const logout = () => {
    localStorage.clear();
  };
  