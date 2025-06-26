const currentPage = window.location.pathname.endsWith("login.html") ? "login" : "signup";

const mainActionBtn = document.getElementById(`${currentPage}-btn`);

/*EMAIL HANDLING*/

const emailInput = document.getElementById("email");
const emailLabel = document.getElementById("email-label");

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

emailInput.addEventListener("input", () => {
    if (isValidEmail(emailInput.value)) {
        emailLabel.style.color = "gray";
        emailLabel.innerHTML = `Email Address`;
        if (isValidPassword(passwordInput?.value)) {
            mainActionBtn.classList.add("active");
        }
    } else {
        emailLabel.style.color = "#ff640a";
        emailLabel.innerHTML = `Invalid Email Address`;
        mainActionBtn.classList.remove("active");
    }
});

/*PASSWORD HANDLING*/

const passwordInput = document.getElementById("password");
const passwordLabel = document.getElementById("password-label");

function isValidPassword(password) {
    if (password.length >= 6 && !password.includes(' ')) {
        return true;
    }
    return false;
}

passwordInput.addEventListener('input', () => {
    if (isValidPassword(passwordInput.value)) {
        passwordLabel.innerHTML = "Password";
        passwordLabel.style.color = "#666666";
        if (isValidEmail(emailInput.value)) {
            mainActionBtn.classList.add("active");
        }
    } else {
        passwordLabel.innerHTML = "Invalid password";
        passwordLabel.style.color = "#ff640a";
        mainActionBtn.classList.remove("active");
    }
});

/*AUTO-FILL HANDLING*/

window.addEventListener("DOMContentLoaded", () => {
    [emailInput, passwordInput].forEach(input => {
        input.addEventListener("animationstart", (e) => {
            if (e.animationName === "autofill-start") {
                input.focus();
            }
        });
    });
});

/*API CALLS*/

mainActionBtn.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    const baseURL = window.location.origin;

    if (isValidEmail(email) && isValidPassword(password)) {
        fetch(`${baseURL}/api/${currentPage}`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password }),
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    currentPage == 'login' ? alert("Login successful!") : alert("Account created successfully ✅ | Now Login to your account");
                    window.location.href = currentPage == 'login' ? "../index.html" : "./login.html";
                } else {
                    alert(data.error || `${currentPage} failed : ${data.details}`);
                }
            })
            .catch(e => {
                console.error(e);
                alert("Something went wrong !");
            });
    }
});