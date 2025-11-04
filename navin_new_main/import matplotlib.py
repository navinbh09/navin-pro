import matplotlib.pyplot as plt
import numpy as np

# Data for honey composition
components = [
    "Fructose", "Glucose", "Water", "Maltose",
    "Trisaccharides/Carbohydrates", "Sucrose",
    "Minerals/Vitamins/Enzymes"
]
percentages = [38.5, 31.0, 17.1, 7.2, 4.2, 1.5, 0.5]

# Colorblind-friendly color palette
colors = [
    "#E69F00", "#56B4E9", "#009E73", "#F0E442",
    "#0072B2", "#D55E00", "#CC79A7"
]

# Sort data from highest to lowest for better readability
sorted_indices = np.argsort(percentages)[::-1]
components = [components[i] for i in sorted_indices]
percentages = [percentages[i] for i in sorted_indices]
colors = [colors[i] for i in sorted_indices]

# Create the horizontal bar chart
fig, ax = plt.subplots(figsize=(10, 6))
bars = ax.barh(components, percentages, color=colors, edgecolor="black")

# Add percentage labels inside or outside bars depending on size
for i, (bar, pct) in enumerate(zip(bars, percentages)):
    x = bar.get_width()
    if x > 5:
        # If bar is wide enough, label inside
        ax.text(x - 2, bar.get_y() + bar.get_height() / 2,
                f"{pct}%", va="center", ha="right", color="white", fontsize=10, fontweight="bold")
    else:
        # Otherwise, label outside
        ax.text(x + 0.5, bar.get_y() + bar.get_height() / 2,
                f"{pct}%", va="center", ha="left", color="black", fontsize=10)

# Titles and labels
ax.set_title("Composition of Honey (Corrected)", fontsize=14, fontweight="bold", pad=15)
ax.set_xlabel("Percentage (%)", fontsize=12)
ax.set_xlim(0, max(percentages) + 5)

# Gridlines for easier reading
ax.xaxis.grid(True, linestyle="--", alpha=0.6)
ax.set_axisbelow(True)

# Make layout tight
plt.tight_layout()

# Show the chart
plt.show()
