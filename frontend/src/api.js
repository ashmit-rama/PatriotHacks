const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";

export async function checkBackend() {
  try {
    const res = await fetch(`${BACKEND_URL}/health`);
    if (!res.ok) {
      throw new Error("Backend returned non-OK status");
    }
    return true;
  } catch (err) {
    console.error("Health check failed:", err);
    return false;
  }
}

export async function submitContactMessage(payload) {
  const body = {
    name: payload.name?.trim() || "",
    email: payload.email?.trim() || "",
    message: payload.message?.trim() || "",
  };

  const res = await fetch(`${BACKEND_URL}/api/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || "Failed to submit contact request.");
  }

  return res.json();
}
