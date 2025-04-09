import "./styles/style.scss";

const loginTemplate = `
  <h2>🔐 Login</h2>
  <form id="login-form">
    <div class="error-message" id="login-error"></div>
    <input type="email" id="login-email" placeholder="Email" required />
    <input type="password" id="login-password" placeholder="Password" required />
    <button type="submit">Login</button>
  </form>
  <p>Don't have an account? <a href="#" data-link="register">Register</a></p>
`;

const registerTemplate = `
  <h2>📝 Register</h2>
  <form id="register-form">
    <div class="error-message" id="register-error"></div>
    <input type="text" id="register-name" placeholder="Name" required />
    <input type="email" id="register-email" placeholder="Email" required />
    <input type="password" id="register-password" placeholder="Password" required />
    <select id="register-role" required>
      <option value="">Select Role</option>
      <option value="admin">Admin</option>
      <option value="worker">Worker</option>
    </select>
    <button type="submit">Register</button>
  </form>
  <p>Already have an account? <a href="#" data-link="login">Login</a></p>
`;

const dashboardTemplate = `
  <h2>📋 Work Shifts Dashboard</h2>

  <div id="shift-actions" class="hidden">
    <button id="add-shift-btn">➕ Add New Shift</button>
  </div>

  <div id="shift-list">Loading shifts...</div>

  <div id="overlay" class="overlay hidden"></div>

  <div id="add-popup" class="popup hidden">
    <form id="add-form">
      <h3>Add New Shift</h3>
      <input type="date" id="new-date" required />
      <input type="time" id="new-start" required />
      <input type="time" id="new-end" required />
      <input type="text" id="new-assigned" placeholder="User ID" required />
      <button type="submit">Create</button>
      <button type="button" id="cancel-add">Cancel</button>
    </form>
  </div>

  <div id="edit-popup" class="popup hidden"> ... </div>

  <p><a href="#" data-link="login">Logout</a></p>
`;

function attachLinkListeners() {
  document.querySelectorAll("[data-link]")?.forEach((el) => {
    el.addEventListener("click", async (e) => {
      e.preventDefault();
      const target = (e.currentTarget as HTMLElement).getAttribute("data-link");
      if (target === "login") {
        localStorage.removeItem("token");
      }
      if (target === "login" || target === "register" || target === "dashboard") {
        await loadPage(target);
      }
    });
  });
}

function showLoginError(message: string) {
  const errorEl = document.getElementById("login-error");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.setAttribute("style", "display: block");
  }
}

function showRegisterError(message: string) {
  const errorEl = document.getElementById("register-error");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.setAttribute("style", "display: block");
  }
}

const app = document.getElementById("app")!;
const loadPage = async (page: "login" | "register" | "dashboard") => {
  if (page === "dashboard") {
    app.innerHTML = dashboardTemplate;
    attachLinkListeners();

    const shiftList = document.getElementById("shift-list")!;
    const token = localStorage.getItem("token");
    const popup = document.getElementById("edit-popup")!;
    const overlay = document.getElementById("overlay")!;

    if (!token) {
      shiftList.innerHTML = "<p>⛔ Not logged in</p>";
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/shifts", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const shifts = await res.json();

      if (!Array.isArray(shifts)) {
        shiftList.innerHTML = "<p>⚠️ Failed to load shifts</p>";
        return;
      }

      if (shifts.length === 0) {
        shiftList.innerHTML = "<p>No shifts found.</p>";
        return;
      }
      const role = localStorage.getItem("role");


      shiftList.innerHTML = shifts.map(shift => `
        <div class="shift-card" data-id="${shift._id}">
          <p><strong>Date:</strong> ${new Date(shift.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${shift.startHour} - ${shift.endHour}</p>
          <p><strong>Assigned to:</strong> ${shift.assignedTo?.name || "N/A"}</p>
          <p><strong>Created by:</strong> ${shift.createdBy?.name || "N/A"}</p>
          ${role === "admin" ? `
            <button class="edit-btn">✏️ Edit</button>
            <button class="delete-btn">🗑️ Delete</button>
          ` : ""}
        </div>
      `).join("");

      if (role === "admin") {
        document.getElementById("shift-actions")?.classList.remove("hidden");

        const addBtn = document.getElementById("add-shift-btn")!;
        const addPopup = document.getElementById("add-popup")!;
        const editPopup = document.getElementById("edit-popup")!;
        const addForm = document.getElementById("add-form")!;
        const cancelAdd = document.getElementById("cancel-add")!;

        addBtn.addEventListener("click", () => {
          addPopup.classList.remove("hidden");
          overlay.classList.remove("hidden");
          setTimeout(() => {
            addPopup.classList.add("show");
            overlay.classList.add("show");
          }, 10);
        });

        cancelAdd.addEventListener("click", () => {
          addPopup.classList.remove("show");
          overlay.classList.remove("show");
          setTimeout(() => {
            addPopup.classList.add("hidden");
            overlay.classList.add("hidden");
          }, 300);
        });

        overlay.addEventListener("click", () => {
          addPopup.classList.remove("show");
          editPopup.classList.remove("show");
          overlay.classList.remove("show");
          setTimeout(() => {
            addPopup.classList.add("hidden");
            editPopup.classList.add("hidden");
            overlay.classList.add("hidden");
          }, 300);
        });

        addForm.addEventListener("submit", async (e) => {
          e.preventDefault();
        
          const date = (document.getElementById("new-date") as HTMLInputElement).value;
          const startHour = (document.getElementById("new-start") as HTMLInputElement).value;
          const endHour = (document.getElementById("new-end") as HTMLInputElement).value;
          const assignedTo = (document.getElementById("new-assigned") as HTMLInputElement).value;
          const token = localStorage.getItem("token");
        
          try {
            const res = await fetch("http://localhost:5000/api/shifts", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ date, startHour, endHour, assignedTo }),
            });
        
            if (res.ok) {
              await loadPage("dashboard");
            } else {
              alert("❌ Failed to create shift.");
            }
          } catch (err) {
            console.error("❌ Error creating shift:", err);
          }
        });

        document.querySelectorAll(".delete-btn").forEach(btn => {
          btn.addEventListener("click", async (e) => {
            const parent = (e.currentTarget as HTMLElement).closest(".shift-card");
            const id = parent?.getAttribute("data-id");
            const token = localStorage.getItem("token");

            if (id && token) {
              const confirmed = confirm("Are you sure you want to delete this shift?");
              if (!confirmed) return;

              try {
                const res = await fetch(`http://localhost:5000/api/shifts/${id}`, {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                  parent?.remove();
                  const remainingShifts = document.querySelectorAll(".shift-card");
                  if (remainingShifts.length === 0) {
                    shiftList.innerHTML = "<p>No shifts found.</p>";
                  }
                } else {
                  alert("❌ Failed to delete shift.");
                }
              } catch (err) {
                console.error("❌ Error deleting shift:", err);
              }
            }
          });
          document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
              const parent = (e.currentTarget as HTMLElement).closest(".shift-card");
              const id = parent?.getAttribute("data-id");
              const date = parent?.querySelector("p:nth-child(1)")?.textContent?.split(": ")[1] || "";
              const startEnd = parent?.querySelector("p:nth-child(2)")?.textContent?.split(": ")[1]?.split(" - ") || ["", ""];
              const assignedTo = parent?.querySelector("p:nth-child(3)")?.textContent?.split(": ")[1] || "";

              popup.classList.remove("hidden");
              overlay.classList.remove("hidden");
              setTimeout(() => {
                popup.classList.add("show");
                overlay.classList.add("show");
              }, 10);


              (document.getElementById("edit-date") as HTMLInputElement).value = new Date(date).toISOString().split("T")[0];
              (document.getElementById("edit-start") as HTMLInputElement).value = startEnd[0];
              (document.getElementById("edit-end") as HTMLInputElement).value = startEnd[1];
              (document.getElementById("edit-assigned") as HTMLInputElement).value = assignedTo;
              (popup as HTMLElement).setAttribute("data-id", id!);
            });
          });
          document.getElementById("edit-form")?.addEventListener("submit", async (e) => {
            e.preventDefault();

            const id = popup.getAttribute("data-id");
            const token = localStorage.getItem("token");

            const date = (document.getElementById("edit-date") as HTMLInputElement).value;
            const startHour = (document.getElementById("edit-start") as HTMLInputElement).value;
            const endHour = (document.getElementById("edit-end") as HTMLInputElement).value;
            const assignedTo = (document.getElementById("edit-assigned") as HTMLInputElement).value;

            try {
              const res = await fetch(`http://localhost:5000/api/shifts/${id}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ date, startHour, endHour, assignedTo }),
              });

              if (res.ok) {
                popup.classList.remove("show");
                overlay.classList.remove("show");
                setTimeout(() => {
                  popup.classList.add("hidden");
                  overlay.classList.add("hidden");
                }, 300);

                await loadPage("dashboard");
              } else {
                alert("Failed to update shift.");
              }
            } catch (err) {
              console.error("❌ Error updating shift:", err);
            }
          });
          document.getElementById("cancel-edit")?.addEventListener("click", () => {
            popup.classList.remove("show");
            overlay.classList.remove("show");

            setTimeout(() => {
              popup.classList.add("hidden");
              overlay.classList.add("hidden");
            }, 300);
          });

        });
        overlay.addEventListener("click", () => {
          popup.classList.remove("show");
          overlay.classList.remove("show");
          setTimeout(() => {
            popup.classList.add("hidden");
            overlay.classList.add("hidden");
          }, 300);
        });

      }

    } catch (err) {
      console.error("❌ Failed to fetch shifts:", err);
      shiftList.innerHTML = "<p>🚨 Error loading shifts</p>";
    }
  }

  if (page === "login") {
    app.innerHTML = loginTemplate;
    const form = document.getElementById("login-form") as HTMLFormElement;

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = (document.getElementById("login-email") as HTMLInputElement).value;
      const password = (document.getElementById("login-password") as HTMLInputElement).value;

      try {
        const res = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          showLoginError(data.message || "Login failed");
          return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        await loadPage("dashboard");

      } catch (err) {
        console.error("❌ Error during login:", err);
        showLoginError("Something went wrong. Please try again.");
      }
    });
  } if (page === "register") {
    app.innerHTML = registerTemplate;
    const form = document.getElementById("register-form") as HTMLFormElement;

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = (document.getElementById("register-name") as HTMLInputElement).value;
      const email = (document.getElementById("register-email") as HTMLInputElement).value;
      const password = (document.getElementById("register-password") as HTMLInputElement).value;
      const role = (document.getElementById("register-role") as HTMLSelectElement).value;

      try {
        const res = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role }),
        });

        const data = await res.json();

        if (!res.ok) {
          showRegisterError(data.message || "Registration failed");
          return;
        }

        console.log("✅ Registered successfully:", data);
        await loadPage("login");

      } catch (err) {
        console.error("❌ Error during registration:", err);
        showRegisterError("Something went wrong. Please try again.");
      }
    });
  }

  document.querySelectorAll("[data-link]")?.forEach((el) => {
    el.addEventListener("click", async (e) => {
      e.preventDefault();
      const target = (e.currentTarget as HTMLElement).getAttribute("data-link");
      if (target === "login") {
        localStorage.removeItem("token");
      }
      if (target === "login" || target === "register") {
        loadPage(target);
      }
    });
  });
};

(async () => {
  await loadPage("login");
})();