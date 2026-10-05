const API_BASE = "/api";


/* ==========================================
   AUTH HELPERS
========================================== */

function getToken() {
    return localStorage.getItem("hands2hands_token");
}


function getCurrentUser() {
    try {
        const user = localStorage.getItem("hands2hands_user");

        if (!user) {
            return null;
        }

        return JSON.parse(user);

    } catch (error) {
        console.error("User data error:", error);
        return null;
    }
}


function saveLoginData(data) {

    if (data.token) {
        localStorage.setItem(
            "hands2hands_token",
            data.token
        );
    }

    if (data.user) {
        localStorage.setItem(
            "hands2hands_user",
            JSON.stringify(data.user)
        );
    }
}


function authHeaders() {

    const headers = {
        "Content-Type": "application/json"
    };

    const token = getToken();

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}


/* ==========================================
   MESSAGE
========================================== */

function showMessage(message, type = "success") {

    const formMessage =
        document.getElementById("formMessage");

    if (formMessage) {

        formMessage.textContent = message;
        formMessage.className = type;

        return;
    }


    const messageBox =
        document.getElementById("message");

    if (!messageBox) {

        alert(message);

        return;
    }

    messageBox.textContent = message;
    messageBox.className = `message ${type}`;
}


/* ==========================================
   LOGOUT
========================================== */

function logoutUser() {

    localStorage.removeItem("hands2hands_token");
    localStorage.removeItem("hands2hands_user");

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "index.html";
}


/* ==========================================
   CHECK USER ACCESS
========================================== */

function checkUserAccess(page) {

    const token = getToken();
    const user = getCurrentUser();

    if (!token || !user) {

        alert("Please login first.");

        window.location.href =
            "login.html?role=user";

        return false;
    }

    window.location.href = page;

    return false;
}


/* ==========================================
   PROTECT ADOPTION / DONATION PAGES
========================================== */

function protectUserPage() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();

    const protectedPages = [
        "adopt.html",
        "donat.html"
    ];

    if (!protectedPages.includes(currentPage)) {
        return;
    }

    const token = getToken();
    const user = getCurrentUser();

    if (!token || !user) {

        alert("Please login first.");

        window.location.href =
            "login.html?role=user";

        return;
    }
}


/* ==========================================
   LOGIN
========================================== */

async function loginUser(email, password) {

    try {

        const response =
            await fetch(
                `${API_BASE}/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Login failed."
            );
        }


        const params =
            new URLSearchParams(
                window.location.search
            );


        const selectedRole =
            params.get("role") || "user";


        const actualRole =
            data.user.role;


        /* ==================================
           USER LOGIN + ADMIN ACCOUNT
        ================================== */

        if (
            selectedRole === "user" &&
            actualRole === "admin"
        ) {

            showMessage(
                "This is an admin account. Please use Admin Login.",
                "error"
            );

            return;
        }


        /* ==================================
           ADMIN LOGIN + USER ACCOUNT
        ================================== */

        if (
            selectedRole === "admin" &&
            actualRole !== "admin"
        ) {

            showMessage(
                "This account is not an admin account.",
                "error"
            );

            return;
        }


        /* ==================================
           SAVE LOGIN
        ================================== */

        saveLoginData(data);


        showMessage(
            "Login successful!"
        );


        /* ==================================
           REDIRECT
        ================================== */

        setTimeout(
            function () {

                if (actualRole === "admin") {

                    window.location.href =
                        "admin.html";

                } else {

                    window.location.href =
                        "index.html";
                }

            },
            700
        );


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        showMessage(
            error.message,
            "error"
        );
    }
}


/* ==========================================
   LOGIN FORM
========================================== */

function setupLoginForm() {

    const form =
        document.getElementById("loginForm");


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const emailElement =
                document.getElementById("email");


            const passwordElement =
                document.getElementById("password");


            if (
                !emailElement ||
                !passwordElement
            ) {
                return;
            }


            const email =
                emailElement.value.trim();


            const password =
                passwordElement.value;


            if (!email || !password) {

                showMessage(
                    "Please enter email and password.",
                    "error"
                );

                return;
            }


            await loginUser(
                email,
                password
            );

        }
    );
}


/* ==========================================
   SIGNUP
========================================== */

function setupSignupForm() {

    const form =
        document.getElementById("signupForm");


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const nameElement =
                document.getElementById("name");


            const emailElement =
                document.getElementById("email");


            const passwordElement =
                document.getElementById("password");


            const confirmPasswordElement =
                document.getElementById(
                    "confirmPassword"
                );


            if (
                !nameElement ||
                !emailElement ||
                !passwordElement
            ) {
                return;
            }


            const name =
                nameElement.value.trim();


            const email =
                emailElement.value.trim();


            const password =
                passwordElement.value;


            const confirmPassword =
                confirmPasswordElement
                    ? confirmPasswordElement.value
                    : password;


            if (
                !name ||
                !email ||
                !password
            ) {

                showMessage(
                    "Please fill all required fields.",
                    "error"
                );

                return;
            }


            if (password.length < 8) {

                showMessage(
                    "Password must be at least 8 characters.",
                    "error"
                );

                return;
            }


            if (password !== confirmPassword) {

                showMessage(
                    "Passwords do not match.",
                    "error"
                );

                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_BASE}/auth/signup`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                name: name,
                                email: email,
                                password: password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Signup failed."
                    );
                }


                showMessage(
                    "Signup successful! Please login."
                );


                form.reset();


                setTimeout(
                    function () {

                        window.location.href =
                            "login.html?role=user";

                    },
                    1000
                );


            } catch (error) {

                showMessage(
                    error.message,
                    "error"
                );
            }

        }
    );
}


/* ==========================================
   DONATION
========================================== */

async function submitDonation(
    amount,
    purpose
) {

    try {

        const response =
            await fetch(
                `${API_BASE}/donations`,
                {
                    method: "POST",

                    headers:
                        authHeaders(),

                    body: JSON.stringify({
                        amount: amount,
                        purpose: purpose
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Donation failed."
            );
        }


        showMessage(
            "Donation submitted successfully!"
        );


    } catch (error) {

        showMessage(
            error.message,
            "error"
        );
    }
}


/* ==========================================
   DONATION FORM
========================================== */

function setupDonationForm() {

    const form =
        document.getElementById(
            "donationForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const token = getToken();
            const user = getCurrentUser();


            if (!token || !user) {

                showMessage(
                    "Please login before making a donation.",
                    "error"
                );


                setTimeout(
                    function () {

                        window.location.href =
                            "login.html?role=user";

                    },
                    1200
                );

                return;
            }


            const amountElement =
                document.getElementById("amount");


            const purposeElement =
                document.getElementById("purpose");


            if (!amountElement) {
                return;
            }


            const amount =
                amountElement.value;


            const purpose =
                purposeElement
                    ? purposeElement.value
                    : "General";


            if (
                !amount ||
                Number(amount) <= 0
            ) {

                showMessage(
                    "Please enter a valid donation amount.",
                    "error"
                );

                return;
            }


            await submitDonation(
                amount,
                purpose
            );

        }
    );
}


/* ==========================================
   VOLUNTEER
========================================== */

function setupVolunteerForm() {

    const form =
        document.getElementById(
            "volunteerForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const formData =
                new FormData(form);


            const body = {

                name:
                    formData.get("name"),

                email:
                    formData.get("email"),

                phone:
                    formData.get("phone"),

                availability:
                    formData.get("availability"),

                activities:
                    formData.get("activities"),

                message:
                    formData.get("message")
            };


            try {

                const response =
                    await fetch(
                        `${API_BASE}/volunteers`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(body)
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Volunteer application failed."
                    );
                }


                showMessage(
                    "Volunteer application submitted successfully!"
                );


                form.reset();


            } catch (error) {

                showMessage(
                    error.message,
                    "error"
                );
            }

        }
    );
}


/* ==========================================
   CONTACT
========================================== */

function setupContactForm() {

    const form =
        document.getElementById(
            "contactForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const formData =
                new FormData(form);


            const body = {

                name:
                    formData.get("name"),

                email:
                    formData.get("email"),

                message:
                    formData.get("message")
            };


            try {

                const response =
                    await fetch(
                        `${API_BASE}/contact`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(body)
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Message submission failed."
                    );
                }


                showMessage(
                    "Message sent successfully!"
                );


                form.reset();


            } catch (error) {

                showMessage(
                    error.message,
                    "error"
                );
            }

        }
    );
}


/* ==========================================
   ADOPTION
========================================== */

function setupAdoptionForm() {

    const form =
        document.getElementById(
            "adoptionForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* ==================================
               LOGIN CHECK
            ================================== */

            const token =
                getToken();


            const user =
                getCurrentUser();


            if (!token || !user) {

                showMessage(
                    "Please login before applying for adoption.",
                    "error"
                );


                setTimeout(
                    function () {

                        window.location.href =
                            "login.html?role=user";

                    },
                    1200
                );

                return;
            }


            /* ==================================
               GET FORM FIELDS
            ================================== */

            const childSelect =
                document.getElementById(
                    "childId"
                );


            const dateInput =
                document.getElementById(
                    "applicationDate"
                );


            const remarksInput =
                document.getElementById(
                    "remarks"
                );


            if (!childSelect) {

                showMessage(
                    "Child selection field not found.",
                    "error"
                );

                return;
            }


            const childId =
                childSelect.value;


            const applicationDate =
                dateInput
                    ? dateInput.value
                    : "";


            const remarks =
                remarksInput
                    ? remarksInput.value.trim()
                    : "";


            console.log(
                "Selected Child ID:",
                childId
            );


            console.log(
                "Application Date:",
                applicationDate
            );


            console.log(
                "Remarks:",
                remarks
            );


            /* ==================================
               VALIDATE CHILD
            ================================== */

            if (
                !childId ||
                childId === "0"
            ) {

                showMessage(
                    "Please select a child.",
                    "error"
                );

                return;
            }


            /* ==================================
               VALIDATE DATE
            ================================== */

            if (!applicationDate) {

                showMessage(
                    "Please select application date.",
                    "error"
                );

                return;
            }


            /* ==================================
               REQUEST BODY
            ================================== */

            const requestBody = {

                child_id:
                    Number(childId),

                childId:
                    Number(childId),

                application_date:
                    applicationDate,

                applicationDate:
                    applicationDate,

                remarks:
                    remarks
            };


            console.log(
                "Adoption request:",
                requestBody
            );


            /* ==================================
               SEND REQUEST
            ================================== */

            try {

                const response =
                    await fetch(
                        `${API_BASE}/adoptions`,
                        {
                            method: "POST",

                            headers:
                                authHeaders(),

                            body:
                                JSON.stringify(
                                    requestBody
                                )
                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Adoption response:",
                    data
                );


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Adoption application failed."
                    );
                }


                showMessage(
                    "Adoption application submitted successfully!",
                    "success"
                );


                form.reset();


                /* ==================================
                   RESET DATE
                ================================== */

                if (dateInput) {

                    const today =
                        new Date()
                            .toISOString()
                            .split("T")[0];


                    dateInput.value =
                        today;
                }


                /* ==================================
                   HIDE SELECTED CHILD
                ================================== */

                const selectedChild =
                    document.getElementById(
                        "selectedChild"
                    );


                if (selectedChild) {

                    selectedChild.style.display =
                        "none";

                    selectedChild.textContent =
                        "";
                }


            } catch (error) {

                console.error(
                    "Adoption submit error:",
                    error
                );


                showMessage(
                    error.message,
                    "error"
                );
            }

        }
    );
}


/* ==========================================
   LOGOUT BUTTONS
========================================== */

function setupLogoutButtons() {

    const buttons =
        document.querySelectorAll(
            "#logoutBtn, .logout-btn"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    logoutUser();
                }
            );

        }
    );
}


/* ==========================================
   PAGE INITIALIZATION
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupLoginForm();

        setupSignupForm();

        setupDonationForm();

        setupVolunteerForm();

        setupContactForm();

        setupAdoptionForm();

        setupLogoutButtons();


        /* ==================================
           PROTECT USER PAGES
        ================================== */

        protectUserPage();

    }
);