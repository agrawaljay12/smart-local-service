export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    window.location.href = "/auth/signin";
    throw new Error("No token found");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/auth/signin";
    throw new Error("Unauthorized");
  }

  return response; // ✅ always returns Response
};