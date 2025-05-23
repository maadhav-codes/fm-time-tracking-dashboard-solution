const main = () => {
  const dashboard = document.getElementById("dashboard");
  const template = document.getElementById("template");
  const pages = document.querySelectorAll("a[data-timeframe]");

  let currentPage = "weekly";
  let timeTrackingData = [];

  function renderPlaceholder(count) {
    if (!dashboard) return;
    dashboard.innerHTML = "";

    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement("div");
      skeleton.className = "card skeleton-card";

      const content = document.createElement("div");
      content.className = "card-content";

      const header = document.createElement("div");
      header.className = "card-header skeleton-header";

      const line = document.createElement("div");
      line.className = "skeleton-line";
      header.appendChild(line);

      const button = document.createElement("div");
      button.className = "skeleton-button";
      header.appendChild(button);

      const body = document.createElement("div");
      body.className = "card-body skeleton-body";

      content.appendChild(header);
      content.appendChild(body);

      skeleton.appendChild(content);

      dashboard.appendChild(skeleton);
    }
  }

  // Formats the previous time text based on selected timeframe
  function formatPreviousTimeText(timeframe, previousHours) {
    let periodText = "";

    if (timeframe === "daily") {
      periodText = "Yesterday";
    } else if (timeframe === "weekly") {
      periodText = "Last Week";
    } else if (timeframe === "monthly") {
      periodText = "Last Month";
    }

    return `${periodText} - ${previousHours}hr${
      previousHours === 1 ? "" : "s"
    }`;
  }

  // Create a single time tracking card element
  function createCardElement(data, selectedTimeframe) {
    if (!template) {
      console.error("Template not found!");
      return null;
    }

    const clone = template.content.cloneNode(true);

    const card = clone.querySelector(".card");
    const title = clone.querySelector(".card-header h2");
    const button = clone.querySelector(".card-header button");
    const currentHour = clone.querySelector(".current-hours");
    const previousHours = clone.querySelector(".previous-hours");

    if (!card || !title || !button || !currentHour || !previousHours) {
      return null;
    }

    title.textContent = data.title;

    // Set category specific card
    const category = `${data.title.toLowerCase().replace(/\s+/g, "-")}-card`;
    card.classList.add(category);

    // Set accessibility for button
    button.setAttribute(
      "aria-label",
      `Options for ${data.title.toLowerCase()} category`
    );

    const time = data.timeframes[selectedTimeframe];
    if (time) {
      currentHour.textContent = `${time.current}hr${
        time.current === 1 ? "" : "s"
      }`;
      previousHours.textContent = formatPreviousTimeText(
        selectedTimeframe,
        time.previous
      );
    } else {
      currentHour.textContent = "N/A";
      previousHours.textContent = "Data not available";
    }

    return card;
  }

  // Render all tracking card to the dashboard
  function render(selectedTimeframe) {
    if (!dashboard) {
      return;
    }

    // Clear any existing cards
    dashboard.innerHTML = "";

    // Create and append card for each item in the data
    timeTrackingData.forEach((item) => {
      const card = createCardElement(item, selectedTimeframe);

      if (card) {
        dashboard.appendChild(card);
      }
    });
  }

  // Handle click on timeframe navigation links
  function handleCurrentPage(event) {
    event.preventDefault();

    const clickedLink = event.currentTarget;
    const newTimeframe = clickedLink.dataset.timeframe;

    if (newTimeframe && newTimeframe !== currentPage) {
      // Update current selected timeframe
      currentPage = newTimeframe;

      renderPlaceholder(6);

      pages.forEach((page) => {
        if (page.dataset.timeframe === currentPage) {
          page.setAttribute("aria-current", "page");
        } else {
          page.removeAttribute("aria-current");
        }
      });

      render(currentPage);
    }
  }

  async function loadTimeTrackingData() {
    renderPlaceholder(6);

    try {
      const response = await fetch("./data/data.json");

      if (!response.ok) {
        throw new Error("HTTP error! status: ", response.status);
      }

      timeTrackingData = await response.json();

      if (pages.length > 0) {
        pages.forEach((page) =>
          page.addEventListener("click", handleCurrentPage)
        );
      }

      // Initial render of dashboard
      render(currentPage);
    } catch (error) {
      console.error("Failed to load time tracking data: ", error);

      if (dashboard) {
        dashboard.innerHTML = `<p class="error-message">Could not load data. Please try refreshing the page or check your connection.</p>`;
      }
    }
  }

  loadTimeTrackingData();
};

document.addEventListener("DOMContentLoaded", main);
