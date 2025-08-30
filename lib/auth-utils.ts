export const logout = () => {
  if (typeof window !== "undefined") {
    // Clear user data from localStorage
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    localStorage.removeItem("authToken")
    
    // Redirect to home page
    window.location.href = "/"
  }
}
