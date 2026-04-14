// js/dashboard.js

async function loadStats() {
  try {
    const stats = await apiGet("/statistics");
    renderStats(stats);
  } catch (error) {
    document.getElementById("statsGrid").innerHTML =
      `<p class="error">Error loading stats: ${error.message}</p>`;
  }
}

function renderStats(stats) {
  const statsGrid = document.getElementById("statsGrid");

  // Har stat ka ek card banega
  const cards = [
    { label: "Total Products", value: stats.totalProducts },
    { label: "Total Categories", value: stats.totalCategories },
    { label: "Total Brands", value: stats.totalBrands },
    { label: "Avg Price", value: `$${Number(stats.avgPrice).toFixed(2)}` },
    { label: "Min Price", value: `$${Number(stats.minPrice).toFixed(2)}` },
    { label: "Max Price", value: `$${Number(stats.maxPrice).toFixed(2)}` },
    { label: "Avg Rating", value: Number(stats.avgRating).toFixed(2) },
    { label: "Total Stock", value: stats.totalStock },
  ];

  statsGrid.innerHTML = cards
    .map(
      (card) => `
      <div class="stat-card">
        <span class="stat-value">${card.value}</span>
        <span class="stat-label">${card.label}</span>
      </div>
    `,
    )
    .join("");
}

// Page load hote hi stats load karo
loadStats();
