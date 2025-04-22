// loginHandler.js

async function loginUser(email, password) {
    if (!email || !password) return "Please fill in all fields";
  
    try {
      const res = await fetch("https://yallafix1.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await res.json();
      return res.ok ? "Success" : data.error || "Login failed";
    } catch (error) {
      return "Network error";
    }
  }
  
  module.exports = { loginUser };
  