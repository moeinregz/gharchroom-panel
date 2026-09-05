const BASE = import.meta.env.VITE_API_URL || "/api";

function getToken() {
  return localStorage.getItem("cmd_token");
}

async function request(path, { method = "GET", body, isForm } = {}) {
  const headers = {};
  const token = getToken();

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!isForm) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body
      ? (isForm ? body : JSON.stringify(body))
      : undefined,
  });

  let data = null;

  try {
    data = await res.json();
  } catch (_) {
    // no body
  }

  if (!res.ok) {
    throw new Error(
      data?.error || `درخواست با خطا مواجه شد (${res.status})`
    );
  }

  return data;
}

export const api = {
  // auth
  login: (username, password) =>
    request("/auth/login", {
      method: "POST",
      body: { username, password },
    }),

  me: () => request("/auth/me"),

  // users
  listUsers: () => request("/users"),

  createUser: (payload) =>
    request("/users", {
      method: "POST",
      body: payload,
    }),

  updateUser: (id, payload) =>
    request(`/users/${id}`, {
      method: "PATCH",
      body: payload,
    }),

  deleteUser: (id) =>
    request(`/users/${id}`, {
      method: "DELETE",
    }),

  // tasks
  listTasks: () => request("/tasks"),

  createTask: (payload) =>
    request("/tasks", {
      method: "POST",
      body: payload,
    }),

  toggleTask: (id) =>
    request(`/tasks/${id}/toggle`, {
      method: "PATCH",
    }),

  // chat
  listMessages: () =>
    request("/chat/messages"),

  sendMessage: (text) =>
    request("/chat/messages", {
      method: "POST",
      body: { text },
    }),

  uploadFile: (file) => {
    const fd = new FormData();
    fd.append("file", file);

    return request("/chat/upload", {
      method: "POST",
      body: fd,
      isForm: true,
    });
  },

  // crm
  listCalls: () =>
    request("/crm"),

  createCall: (payload) =>
    request("/crm", {
      method: "POST",
      body: payload,
    }),

  toggleCall: (id) =>
    request(`/crm/${id}/toggle`, {
      method: "PATCH",
    }),

  deleteCall: (id) =>
    request(`/crm/${id}`, {
      method: "DELETE",
    }),

  // orders
  listOrders: () =>
    request("/orders"),

  createOrder: (payload) =>
    request("/orders", {
      method: "POST",
      body: payload,
    }),

  updateOrderStage: (id, stage) =>
    request(`/orders/${id}`, {
      method: "PATCH",
      body: { stage },
    }),

  deleteOrder: (id) =>
    request(`/orders/${id}`, {
      method: "DELETE",
    }),

  trackOrder: (code) =>
    request(`/orders/track/${encodeURIComponent(code)}`),

  // attendance
  listAttendance: () =>
    request("/attendance"),

  myAttendance: () =>
    request("/attendance/me"),

  clockIn: () =>
    request("/attendance/clock-in", {
      method: "POST",
    }),

  clockOut: () =>
    request("/attendance/clock-out", {
      method: "POST",
    }),

  // notes
  listNotes: () =>
    request("/notes"),

  createNote: (text) =>
    request("/notes", {
      method: "POST",
      body: { text },
    }),

  deleteNote: (id) =>
    request(`/notes/${id}`, {
      method: "DELETE",
    }),

  // reports
  listReports: () =>
    request("/reports"),

  createReport: (text) =>
    request("/reports", {
      method: "POST",
      body: { text },
    }),
};

export function saveToken(token) {
  localStorage.setItem("cmd_token", token);
}

export function clearToken() {
  localStorage.removeItem("cmd_token");
}

export { getToken };