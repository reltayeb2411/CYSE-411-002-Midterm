// ============================================================
//  CYSE 411 – Mid-Term Exam V2  |  Q5 Starter File
//  Incident Tracker Application


//  Application State

const ACCEPTED_SEVERITIES = ["low", "medium", "high", "critical"];
const ACCEPTED_FILTERS    = ["all", "low", "medium", "high", "critical"];

// Current filter selection (set during state load, used on save)
let currentFilter = "all";



//  Q5.C  Dashboard State – Load
//  Reads the last selected filter from localStorage.
//  VULNERABILITY: JSON.parse is called without a try/catch.
//  The stored filter value is used without checking whether
//  it belongs to the accepted list.


function loadDashboardState() {
    const raw   = localStorage.getItem("dashboardState");
    if (!raw) return; // Guard if no state exists

    try {
        // Fix: Added try/catch for JSON.parse
        const state = JSON.parse(raw);

        // Fix: Enum validation - check if the filter belongs to the accepted list
        if (state && ACCEPTED_FILTERS.includes(state.filter)) {
            currentFilter = state.filter;
            
            // Sync the UI dropdown
            const filterInput = document.getElementById("filter-select");
            if (filterInput) filterInput.value = currentFilter;
            
            applyFilter(currentFilter);
        }
    } catch (e) {
        // Fallback if JSON is corrupted
        console.error("Failed to parse dashboard state:", e);
        currentFilter = "all";
    }
}


//  Q5.C  Dashboard State – Save
//  Writes the selected filter back to localStorage after a fetch.
//  VULNERABILITY: The raw value from the DOM input is written
//  directly to localStorage without validating it against the
//  accepted list.


function saveDashboardState() {
    const filterInput = document.getElementById("filter-select");
    const filter      = filterInput.value;

    // Fix: Validate the value against the accepted list before storing
    if (ACCEPTED_FILTERS.includes(filter)) {
        localStorage.setItem("dashboardState", JSON.stringify({ filter: filter }));
        currentFilter = filter;
    }
}



//  Q5.A  Fetch Incidents
//  Retrieves open incidents from the REST API.
//  VULNERABILITY 1: fetch() is called but NOT awaited.
//  VULNERABILITY 2: response.ok is never checked.
//  VULNERABILITY 3: No try/catch for network failures.


async function fetchIncidents() {
    try {
        // Fix: Added await for fetch()
        const res = await fetch("/api/incidents");

        // Fix: Added check for response.ok
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        // Fix: Added await for res.json()
        const data = await res.json();
        return data;

    } catch (error) {
        // Fix: Added try/catch to handle network/parsing failures
        console.error("Fetch incidents failed:", error);
        return []; // Return empty array to keep app stable
    }
}



//  Q5.B  Render Incidents
//  Builds the incident list in the dashboard.
//  VULNERABILITY 1: Incident data is inserted via innerHTML (XSS Risk).
//  VULNERABILITY 2: No validation of the incidents array or individual fields.


function renderIncidents(incidents) {
    const container = document.getElementById("incident-list");
    container.innerHTML = ""; // Clear previous results

    // Fix: Validation - Ensure we have an array
    if (!Array.isArray(incidents)) {
        container.textContent = "Error loading incident data.";
        return;
    }

    incidents.forEach(function (incident) {
        // Fix: Individual field validation
        const hasTitle = typeof incident.title === 'string' && incident.title.trim() !== "";
        const hasValidSev = ACCEPTED_SEVERITIES.includes(incident.severity);

        if (hasTitle && hasValidSev) {
            const item = document.createElement("li");

            // Fix: Use createElement and textContent to prevent Stored XSS
            const titleEl = document.createElement("strong");
            titleEl.textContent = incident.title;

            const severityEl = document.createElement("span");
            severityEl.className = "severity severity-" + incident.severity;
            severityEl.textContent = " " + incident.severity;

            item.appendChild(titleEl);
            item.appendChild(severityEl);
            container.appendChild(item);
        } else {
            console.warn("Skipping invalid incident record:", incident);
        }
    });
}



//  Filter Helper (provided – do not modify)
//  Hides/shows rendered items based on selected severity.


function applyFilter(filter) {
    const items = document.querySelectorAll("#incident-list li");
    items.forEach(function (item) {
        const badge = item.querySelector(".severity");
        if (!badge) return;
        const sev = badge.textContent.trim();
        item.style.display = (filter === "all" || sev === filter) ? "" : "none";
    });
    currentFilter = filter;
}



//  Application Bootstrap
//  Runs when the page finishes loading.


document.addEventListener("DOMContentLoaded", async function () {

    // Q5.C – Load saved filter state
    loadDashboardState();

    // Q5.A – Fetch incident data from the API
    const incidents = await fetchIncidents();

    // Q5.B – Render the incidents
    renderIncidents(incidents);

    // Filter select change handler
    document.getElementById("filter-select").addEventListener("change", function () {
        applyFilter(this.value);
        // Q5.C – Save the new filter choice
        saveDashboardState();
    });

});