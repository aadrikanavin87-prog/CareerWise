
document.addEventListener("DOMContentLoaded", function () {

    // Career compatibility progress bars
    document.querySelectorAll(".progress-fill").forEach(function (bar) {
        const score = Number(bar.dataset.score);

        if (Number.isFinite(score)) {
            bar.style.width = Math.max(0, Math.min(100, score)) + "%";
        }
    });

    // Skill level progress bars
    document.querySelectorAll(".skill-fill").forEach(function (bar) {
        const current = Number(bar.dataset.current);

        if (Number.isFinite(current)) {
            bar.style.width = Math.max(0, Math.min(5, current)) * 20 + "%";
        }
    });

    // CareerWise form submission
    const careerForm = document.getElementById("careerForm");

    if (careerForm) {
        careerForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const button = careerForm.querySelector('button[type="submit"]');
            const originalText = button.textContent;

            let results = document.getElementById("recommendation-results");

            if (!results) {
                results = document.createElement("section");
                results.id = "recommendation-results";
                careerForm.insertAdjacentElement("afterend", results);
            }

            button.disabled = true;
            button.textContent = "Finding careers...";
            results.textContent = "Analyzing your skills...";

            try {
                const response = await fetch(
                    "https://aadrikanavin.pythonanywhere.com/recommend",
                    {
                        method: "POST",
                        body: new FormData(careerForm)
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "The server returned an error.");
                }

                if (!Array.isArray(data.recommendations)) {
                    throw new Error("The server response format is unexpected.");
                }

                results.replaceChildren();

                const heading = document.createElement("h2");
                heading.textContent = "Your Career Recommendations";
                results.appendChild(heading);

                data.recommendations.forEach(function (career) {
                    const card = document.createElement("article");

                    const title = document.createElement("h3");
                    title.textContent = career.name || "Career";
                    card.appendChild(title);

                    const description = document.createElement("p");
                    description.textContent = career.description || "";
                    card.appendChild(description);

                    const score = document.createElement("p");
                    score.textContent = "Compatibility Score: " + career.score;
                    card.appendChild(score);

                    if (career.gaps) {
                        const subheading = document.createElement("h4");
                        subheading.textContent = "Skills to Improve";
                        card.appendChild(subheading);

                        const list = document.createElement("ul");
                        const gaps = Array.isArray(career.gaps)
                            ? career.gaps
                            : Object.entries(career.gaps).map(
                                ([skill, value]) => skill + ": " + value
                            );

                        gaps.forEach(function (gap) {
                            const item = document.createElement("li");
                            item.textContent = typeof gap === "string"
                                ? gap
                                : JSON.stringify(gap);
                            list.appendChild(item);
                        });

                        card.appendChild(list);
                    }

                    if (Array.isArray(career.reasons) && career.reasons.length) {
                        const reasonsHeading = document.createElement("h4");
                        reasonsHeading.textContent = "Why this career?";
                        card.appendChild(reasonsHeading);

                        const reasonsList = document.createElement("ul");

                        career.reasons.forEach(function (reason) {
                            const item = document.createElement("li");
                            item.textContent = reason;
                            reasonsList.appendChild(item);
                        });

                        card.appendChild(reasonsList);
                    }

                    results.appendChild(card);
                });

                results.scrollIntoView({ behavior: "smooth" });

            } catch (error) {
                console.error("CareerWise error:", error);
                results.textContent =
                    "Could not load recommendations: " + error.message;
            } finally {
                button.disabled = false;
                button.textContent = originalText;
            }
        });
    }

});
