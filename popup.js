document.addEventListener("DOMContentLoaded", async () => {
  const faviconList = document.getElementById("favicon-list");

  // Inject a content script to gather favicon data
  chrome.scripting.executeScript({
    target: { tabId: (await getCurrentTab()).id },
    func: fetchFavicons
  }, async (results) => {
    console.log("Favicon results:", results);
    const favicons = results[0].result;
    console.log("Favicon data:", favicons);
    await checkRobotsTxt(favicons);
    displayFavicons(favicons);
  });

  async function checkRobotsTxt(favicons) {
    try {
      // Fetch the robots.txt file
      const robotsTxtUrl = new URL("/robots.txt", window.location.origin).href;
      const response = await fetch(robotsTxtUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch robots.txt (HTTP ${response.status})`);
      }

      const robotsTxt = await response.text();
      const disallowedPaths = parseRobotsTxt(robotsTxt);

      // Check each favicon URL against disallowed paths
      favicons.forEach((favicon) => {
        const faviconPath = new URL(favicon.url).pathname;
        favicon.isBlockedByRobots = disallowedPaths.some((path) =>
          path.endsWith("*")
            ? faviconPath.startsWith(path.slice(0, -1))
            : faviconPath === path
        );

        if (favicon.isBlockedByRobots) {
          favicon.reason += " Blocked by robots.txt.";
          favicon.isRelevant = false; // Mark as not relevant if blocked
        }
      });
    } catch (error) {
      console.error("Error checking robots.txt:", error.message);
    }
  }

  function parseRobotsTxt(robotsTxt) {
    const lines = robotsTxt.split("\n");
    const disallowedPaths = [];

    let userAgentMatched = false;

    lines.forEach((line) => {
      line = line.trim();
      if (!line || line.startsWith("#")) return;

      const [directive, value] = line.split(":").map((part) => part.trim());
      if (directive.toLowerCase() === "user-agent") {
        userAgentMatched = value === "*" || value.includes("Googlebot");
      } else if (userAgentMatched && directive.toLowerCase() === "disallow") {
        disallowedPaths.push(value || "/");
      }
    });

    return disallowedPaths;
  }

  function displayFavicons(favicons) {
    if (favicons.length === 0) {
      faviconList.innerHTML = "<p>No favicons found on this page.</p>";
      return;
    }

    favicons.forEach((favicon, index) => {
      const item = document.createElement("div");
      item.className = `favicon-item ${favicon.isRelevant ? "relevant" : "not-relevant"}`;

      const faviconHeader = document.createElement("div");
      faviconHeader.className = "favicon-header";

      const faviconInfo = document.createElement("div");
      faviconInfo.className = "favicon-info";

      const img = document.createElement("img");
      img.src = favicon.url;
      img.className = "favicon-img";

      const url = document.createElement("span");
      url.className = "favicon-url";
      url.textContent = favicon.url;

      faviconInfo.appendChild(img);
      faviconInfo.appendChild(url);

      const toggleDetails = document.createElement("span");
      toggleDetails.className = "toggle-details";

      const icon = document.createElement("i");
      icon.className = index === 0 ? "fas fa-chevron-up" : "fas fa-chevron-down";
      toggleDetails.appendChild(icon);

      toggleDetails.addEventListener("click", () => {
        details.style.display = details.style.display === "none" ? "block" : "none";
        icon.className = details.style.display === "none" ? "fas fa-chevron-down" : "fas fa-chevron-up";
      });

      faviconHeader.appendChild(faviconInfo);
      faviconHeader.appendChild(toggleDetails);

      const details = document.createElement("div");
      details.className = "details";
      const isValid = favicon.isRelevant && !favicon.isBlockedByRobots;
      details.innerHTML = `
        <p>Valid: ${isValid ? '<span class="success">Yes</span>' : '<span class="error">No</span>'}</p>
        ${!favicon.isRelevant ? `<p>Reason: <span class="error">${favicon.reason}</span></p>` : ""}
        <p>Size: ${favicon.size ? `${favicon.size.width}x${favicon.size.height}` : "Unknown"}</p>
        <p>Format: ${favicon.format || "Unknown"}</p>
        <p>Blocked by Robots.txt: ${
          favicon.isBlockedByRobots ? '<span class="error">Yes</span>' : '<span class="success">No</span>'
        }</p>
      `;
      if (index !== 0) {
          details.style.display = "none"; // Hide details for all items except the first
      }

      item.appendChild(faviconHeader);
      item.appendChild(details);

      faviconList.appendChild(item);
    });
  }

  async function getCurrentTab() {
    const queryOptions = { active: true, lastFocusedWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }
});

// Function injected into the webpage to fetch all favicon links
function fetchFavicons() {
  const links = [...document.querySelectorAll('link[rel*="icon"]')];
  console.log("Favicon links:", links); // Log favicon links

  return links.map((link) => {
    const url = link.href;

    // Validate size and format
    let reason = "";
    let isRelevant = true;

    // Example size validation (assume we fetch size dynamically)
    const sizeMatch = url.match(/(\d+)x(\d+)/); // Extract size from URL if present
    const size = sizeMatch
      ? { width: parseInt(sizeMatch[1]), height: parseInt(sizeMatch[2]) }
      : null;

    if (size && (size.width < 48 || size.height < 48)) {
      isRelevant = false;
      reason += `Size is too small (${size.width}x${size.height}). `;
    }

    // Example format validation
    const formatMatch = url.match(/\.(\w+)$/); // Extract file extension
    const format = formatMatch ? formatMatch[1].toLowerCase() : null;
    const supportedFormats = ["ico", "png", "jpg", "jpeg", "gif", "webp"];

    if (!supportedFormats.includes(format)) {
      isRelevant = false;
      reason += `Unsupported format (${format}). `;
    }

    return {
      url,
      isRelevant,
      reason,
      size,
      format,
      isBlockedByRobots: false, // Default value; will be updated later
    };
  });
}
