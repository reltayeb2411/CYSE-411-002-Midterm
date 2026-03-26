// ============================================================
//  CYSE 411 Q4 Starter Code
//  Employee Directory Application


function loadSession() {
    const raw = sessionStorage.getItem("session");
    const session = JSON.parse(raw);          // No try/catch
    return session;                            // No field validation
}


//  Q4.A  Status Message Rendering
//  Displays an employee's status message on their profile card.
//  VULNERABILITY: The message is inserted via innerHTML,
//  allowing any HTML or script tags in the message to
//  execute in the viewer's browser (stored XSS).


function renderStatusMessage(containerElement, message) {
    // Clear the container first
    containerElement.innerHTML = "";
    
    // Use createElement + textContent to treat message as literal text (prevents XSS)
    const p = document.createElement("p");
    p.textContent = message; 
    
    containerElement.appendChild(p);
}


//  Q4.B  Search Query Sanitization
//  Builds a display label from the user's search input.
//  VULNERABILITY: The raw input is used directly with no
//  character filtering, no length limit, and no trimming.


function sanitizeSearchQuery(input) {
    // If input is null or undefined, return null
    if (!input) return null;

    // 1. Trim leading/trailing whitespace
    const trimmed = input.trim();

    // 2. Max 40 characters check & ensure it's not empty after trim
    if (trimmed.length === 0 || trimmed.length > 40) {
        return null;
    }

    // 3. Regex: Allow only letters (a-z, A-Z), digits (0-9), spaces, hyphens (-), underscores (_)
    // The ^ and $ ensure the ENTIRE string matches only these characters
    const allowedPattern = /^[a-zA-Z0-9 _-]+$/;
    
    if (!allowedPattern.test(trimmed)) {
        return null; // Return null if any illegal characters (like < > /) are present
    }

    return trimmed; 
}

function performSearch(query) {
    const sanitized = sanitizeSearchQuery(query);
    const label = document.getElementById("search-label");
    
    // Check if the sanitization returned null (invalid input)
    if (sanitized === null) {
        label.textContent = "Invalid search query.";
    } else {
        // Use textContent instead of innerHTML to prevent any possible injection
        label.textContent = "Showing results for: " + sanitized;
    }
}



//  Application Bootstrap
//  Runs when the page finishes loading.


document.addEventListener("DOMContentLoaded", function () {

    // Load session
    const session = loadSession();
    if (session) {
        document.getElementById("welcome-msg").textContent =
            "Welcome, " + session.displayName;
    }

    // Simulate receiving a profile card with a status message
    // In production this would come from an API response.
    const simulatedProfiles = [
        {
            name: "Alice Johnson",
            department: "Engineering",
            status: "Working from home today"
        },
        {
            name: "Bob Martinez",
            department: "Security",
            // Attacker-controlled payload – should NOT execute
            status: "<img src=x onerror=\"alert('XSS: session stolen')\">"
        },
        {
            name: "Carol Lee",
            department: "HR",
            status: "Out of office until Friday"
        }
    ];

    const directory = document.getElementById("directory");

    simulatedProfiles.forEach(function (profile) {
        const card = document.createElement("div");
        card.className = "profile-card";

        const nameEl = document.createElement("h3");
        nameEl.textContent = profile.name;

        const deptEl = document.createElement("p");
        deptEl.textContent = "Department: " + profile.department;

        const statusContainer = document.createElement("div");
        statusContainer.className = "status";

        // Q4.A – fix this call
        renderStatusMessage(statusContainer, profile.status);

        card.appendChild(nameEl);
        card.appendChild(deptEl);
        card.appendChild(statusContainer);
        directory.appendChild(card);
    });

    // Search button handler
    document.getElementById("search-btn").addEventListener("click", function () {
        const query = document.getElementById("search-input").value;
        performSearch(query);
    });

});
