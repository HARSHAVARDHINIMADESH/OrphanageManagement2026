const API_BASE = "/api/admin";


/* =====================================================
   GET LOGIN DATA
===================================================== */

function getToken() {
    return localStorage.getItem("hands2hands_token");
}


function getUser() {
    try {
        return JSON.parse(
            localStorage.getItem("hands2hands_user")
        );
    } catch (error) {
        return null;
    }
}


/* =====================================================
   AUTH HEADERS
===================================================== */

function getHeaders() {

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
    };

}


/* =====================================================
   ADMIN CHECK
===================================================== */

function checkAdmin() {

    const token = getToken();
    const user = getUser();

    if (!token || !user) {

        window.location.href = "login.html";

        return false;
    }


    if (user.role !== "admin") {

        alert("You don't have admin permission.");

        window.location.href = "index.html";

        return false;
    }


    return true;
}


/* =====================================================
   MESSAGE
===================================================== */

function showMessage(message, type = "success") {

    const box =
        document.getElementById("adminMessage");

    if (!box) {
        return;
    }


    box.textContent = message;

    box.className = type;

    box.style.display = "block";


    setTimeout(function () {

        box.style.display = "none";

    }, 3000);

}


/* =====================================================
   DASHBOARD
===================================================== */

async function loadDashboard() {

    try {

        const response =
            await fetch(
                `${API_BASE}/dashboard`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );


        if (response.status === 401 ||
            response.status === 403) {

            alert(
                "Admin session expired. Please login again."
            );

            logoutAdmin();

            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load dashboard."
            );

        }


        const counts =
            data.counts || {};


        document.getElementById(
            "usersCount"
        ).textContent =
            counts.users || 0;


        document.getElementById(
            "childrenCount"
        ).textContent =
            counts.children || 0;


        document.getElementById(
            "volunteersCount"
        ).textContent =
            counts.volunteers || 0;


        document.getElementById(
            "contactsCount"
        ).textContent =
            counts.contacts || 0;


        document.getElementById(
            "adoptionsCount"
        ).textContent =
            counts.adoptions || 0;


        document.getElementById(
            "donationsCount"
        ).textContent =
            counts.donations || 0;


        document.getElementById(
            "eventsCount"
        ).textContent =
            counts.events || 0;


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

        showMessage(
            error.message,
            "error"
        );

    }

}


/* =====================================================
   VOLUNTEERS
===================================================== */

async function loadVolunteers() {

    const table =
        document.getElementById(
            "volunteersTable"
        );


    if (!table) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/volunteers`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load volunteers."
            );

        }


        const volunteers =
            data.volunteers || [];


        if (volunteers.length === 0) {

            table.innerHTML = `
                <tr>
                    <td
                        colspan="8"
                        class="empty-message"
                    >
                        No volunteer applications found.
                    </td>
                </tr>
            `;

            return;
        }


        table.innerHTML =
            volunteers.map(function (item) {

                return `

                    <tr>

                        <td>
                            ${item.id}
                        </td>

                        <td>
                            ${escapeHtml(item.name)}
                        </td>

                        <td>
                            ${escapeHtml(item.email)}
                        </td>

                        <td>
                            ${escapeHtml(item.phone)}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.availability || "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.activities || "-"
                            )}
                        </td>

                        <td>

                            <select
                                id="volunteerStatus_${item.id}"
                            >

                                <option
                                    value="pending"
                                    ${
                                        item.status === "pending"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Pending
                                </option>

                                <option
                                    value="approved"
                                    ${
                                        item.status === "approved"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Approved
                                </option>

                                <option
                                    value="rejected"
                                    ${
                                        item.status === "rejected"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Rejected
                                </option>

                            </select>

                        </td>

                        <td>

                            <button
                                type="button"
                                class="save-button"
                                onclick="saveVolunteer(${item.id})"
                            >
                                Save
                            </button>

                        </td>

                    </tr>

                `;

            }).join("");


    } catch (error) {

        console.error(
            "Volunteer error:",
            error
        );

        table.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="empty-message"
                >
                    ${escapeHtml(error.message)}
                </td>
            </tr>
        `;

    }

}


/* =====================================================
   SAVE VOLUNTEER
===================================================== */

async function saveVolunteer(id) {

    const select =
        document.getElementById(
            `volunteerStatus_${id}`
        );


    if (!select) {
        return;
    }


    const status = select.value;


    try {

        const response =
            await fetch(
                `${API_BASE}/volunteers/${id}`,
                {
                    method: "PUT",

                    headers: getHeaders(),

                    body: JSON.stringify({
                        status: status
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to save volunteer."
            );

        }


        showMessage(
            "Volunteer status saved successfully!"
        );


        await loadVolunteers();

        await loadDashboard();


    } catch (error) {

        console.error(
            "Volunteer save error:",
            error
        );

        showMessage(
            error.message,
            "error"
        );

    }

}


/* =====================================================
   CONTACT MESSAGES
===================================================== */

async function loadContacts() {

    const table =
        document.getElementById(
            "contactsTable"
        );


    if (!table) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/contacts`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load contact messages."
            );

        }


        const messages =
            data.messages || [];


        if (messages.length === 0) {

            table.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="empty-message"
                    >
                        No contact messages found.
                    </td>
                </tr>
            `;

            return;
        }


        table.innerHTML =
            messages.map(function (item) {

                return `

                    <tr>

                        <td>
                            ${item.id}
                        </td>

                        <td>
                            ${escapeHtml(item.name)}
                        </td>

                        <td>
                            ${escapeHtml(item.email)}
                        </td>

                        <td>
                            ${escapeHtml(item.message)}
                        </td>

                        <td>

                            <select
                                id="contactStatus_${item.id}"
                            >

                                <option
                                    value="new"
                                    ${
                                        item.status === "new"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    New
                                </option>

                                <option
                                    value="read"
                                    ${
                                        item.status === "read"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Read
                                </option>

                                <option
                                    value="replied"
                                    ${
                                        item.status === "replied"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Replied
                                </option>

                                <option
                                    value="closed"
                                    ${
                                        item.status === "closed"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Closed
                                </option>

                            </select>

                        </td>

                        <td>

                            <button
                                type="button"
                                class="save-button"
                                onclick="saveContact(${item.id})"
                            >
                                Save
                            </button>

                        </td>

                    </tr>

                `;

            }).join("");


    } catch (error) {

        console.error(
            "Contact error:",
            error
        );

        table.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="empty-message"
                >
                    ${escapeHtml(error.message)}
                </td>
            </tr>
        `;

    }

}


/* =====================================================
   SAVE CONTACT
===================================================== */

async function saveContact(id) {

    const select =
        document.getElementById(
            `contactStatus_${id}`
        );


    if (!select) {
        return;
    }


    const status = select.value;


    try {

        const response =
            await fetch(
                `${API_BASE}/contacts/${id}`,
                {
                    method: "PUT",

                    headers: getHeaders(),

                    body: JSON.stringify({
                        status: status
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to save contact."
            );

        }


        showMessage(
            "Contact status saved successfully!"
        );


        await loadContacts();

        await loadDashboard();


    } catch (error) {

        console.error(
            "Contact save error:",
            error
        );

        showMessage(
            error.message,
            "error"
        );

    }

}


/* =====================================================
   ADOPTION APPLICATIONS
===================================================== */

async function loadAdoptions() {

    const table =
        document.getElementById(
            "adoptionsTable"
        );


    if (!table) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/adoptions`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load adoption applications."
            );

        }


        const applications =
            data.applications || [];


        if (applications.length === 0) {

            table.innerHTML = `
                <tr>
                    <td
                        colspan="8"
                        class="empty-message"
                    >
                        No adoption applications found.
                    </td>
                </tr>
            `;

            return;
        }


        table.innerHTML =
            applications.map(function (item) {

                return `

                    <tr>

                        <td>
                            ${item.id}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.child_name || "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.applicant_name || "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.applicant_email || "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.application_date || "-"
                            )}
                        </td>

                        <td>

                            <select
                                id="adoptionStatus_${item.id}"
                            >

                                <option
                                    value="pending"
                                    ${
                                        item.status === "pending"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Pending
                                </option>

                                <option
                                    value="approved"
                                    ${
                                        item.status === "approved"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Approved
                                </option>

                                <option
                                    value="rejected"
                                    ${
                                        item.status === "rejected"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Rejected
                                </option>

                                <option
                                    value="completed"
                                    ${
                                        item.status === "completed"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Completed
                                </option>

                            </select>

                        </td>

                        <td>

                            <textarea
                                id="adoptionRemarks_${item.id}"
                            >${escapeHtml(
                                item.remarks || ""
                            )}</textarea>

                        </td>

                        <td>

                            <button
                                type="button"
                                class="save-button"
                                onclick="saveAdoption(${item.id})"
                            >
                                Save
                            </button>

                        </td>

                    </tr>

                `;

            }).join("");


    } catch (error) {

        console.error(
            "Adoption error:",
            error
        );

        table.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="empty-message"
                >
                    ${escapeHtml(error.message)}
                </td>
            </tr>
        `;

    }

}


/* =====================================================
   SAVE ADOPTION
===================================================== */

async function saveAdoption(id) {

    const statusElement =
        document.getElementById(
            `adoptionStatus_${id}`
        );


    const remarksElement =
        document.getElementById(
            `adoptionRemarks_${id}`
        );


    if (!statusElement) {
        return;
    }


    const status =
        statusElement.value;


    const remarks =
        remarksElement
            ? remarksElement.value
            : "";


    try {

        const response =
            await fetch(
                `${API_BASE}/adoptions/${id}`,
                {
                    method: "PUT",

                    headers: getHeaders(),

                    body: JSON.stringify({
                        status: status,
                        remarks: remarks
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to save adoption."
            );

        }


        showMessage(
            "Adoption status saved successfully!"
        );


        await loadAdoptions();

        await loadDashboard();


    } catch (error) {

        console.error(
            "Adoption save error:",
            error
        );

        showMessage(
            error.message,
            "error"
        );

    }

}


/* =====================================================
   DONATIONS
===================================================== */

async function loadDonations() {

    const table =
        document.getElementById(
            "donationsTable"
        );


    if (!table) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/donations`,
                {
                    method: "GET",
                    headers: getHeaders()
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load donations."
            );

        }


        const donations =
            data.donations || [];


        if (donations.length === 0) {

            table.innerHTML = `
                <tr>
                    <td
                        colspan="8"
                        class="empty-message"
                    >
                        No donations found.
                    </td>
                </tr>
            `;

            return;
        }


        table.innerHTML =
            donations.map(function (item) {

                return `

                    <tr>

                        <td>
                            ${item.id}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.donor_name || "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.donor_email || "-"
                            )}
                        </td>

                        <td>
                            ₹${escapeHtml(
                                item.amount
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.purpose || "General"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.payment_status || "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.transaction_id || "-"
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                item.created_at || "-"
                            )}
                        </td>

                    </tr>

                `;

            }).join("");


    } catch (error) {

        console.error(
            "Donation error:",
            error
        );

        table.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="empty-message"
                >
                    ${escapeHtml(error.message)}
                </td>
            </tr>
        `;

    }

}


/* =====================================================
   LOGOUT
===================================================== */

function logoutAdmin() {

    localStorage.removeItem(
        "hands2hands_token"
    );

    localStorage.removeItem(
        "hands2hands_user"
    );

    /* Remove old keys also */

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );


    window.location.href =
        "index.html";

}


/* =====================================================
   HTML SAFETY
===================================================== */

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =====================================================
   LOAD ALL ADMIN DATA
===================================================== */

async function loadAllAdminData() {

    await loadDashboard();

    await loadVolunteers();

    await loadContacts();

    await loadAdoptions();

    await loadDonations();

}


/* =====================================================
   PAGE START
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        /*
         * Check admin login
         */

        if (!checkAdmin()) {
            return;
        }


        /*
         * Show admin name
         */

        const user =
            getUser();


        const welcomeText =
            document.getElementById(
                "welcomeText"
            );


        if (
            welcomeText &&
            user
        ) {

            welcomeText.textContent =
                `Welcome, ${user.name || "Administrator"}`;

        }


        /*
         * Logout
         */

        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                function () {

                    logoutAdmin();

                }
            );

        }


        /*
         * Refresh
         */

        const refreshButton =
            document.getElementById(
                "refreshButton"
            );


        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                async function () {

                    refreshButton.disabled =
                        true;

                    refreshButton.textContent =
                        "Refreshing...";


                    await loadAllAdminData();


                    refreshButton.disabled =
                        false;

                    refreshButton.textContent =
                        "Refresh Dashboard";

                }
            );

        }


        /*
         * IMPORTANT:
         *
         * NO automatic redirect.
         * NO 2-second timer.
         *
         * Admin stays on dashboard.
         */

        await loadAllAdminData();

    }
);