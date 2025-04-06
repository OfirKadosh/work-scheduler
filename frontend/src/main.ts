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
const loadPage = (page: "login" | "register") => {
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

                console.log("Login successful:", data);

            } catch (err) {
                console.error("❌ Error during login:", err);
                showLoginError("Something went wrong. Please try again.");
            }
        });
    } else {
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
            loadPage("login");
      
          } catch (err) {
            console.error("❌ Error during registration:", err);
            showRegisterError("Something went wrong. Please try again.");
          }
        });
    }

    document.querySelectorAll("[data-link]")?.forEach((el) => {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            const target = (e.currentTarget as HTMLElement).getAttribute("data-link");
            if (target === "login" || target === "register") {
                loadPage(target);
            }
        });
    });
};

loadPage("login");