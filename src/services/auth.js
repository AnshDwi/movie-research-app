const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787/api";

export async function getProfile() {
  try {
    const response = await fetch(`${API_URL}/profile`);
    if (!response.ok) {
      throw new Error("Profile unavailable");
    }
    return response.json();
  } catch {
    return {
      id: "demo-user",
      name: "Cine Explorer",
      handle: "@afterglow",
      visibility: "public",
      watchlists: [{ id: "starter", name: "Weekend queue", isPublic: true }]
    };
  }
}
