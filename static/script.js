
document.addEventListener("DOMContentLoaded", function () {

    // Career compatibility progress bars
    const progressBars = document.querySelectorAll(".progress-fill");

    progressBars.forEach(function (bar) {
        const score = Number(bar.dataset.score);

        if (Number.isFinite(score)) {
            const safeScore = Math.max(0, Math.min(100, score));
            bar.style.width = safeScore + "%";
        }
    });

    // Skill level progress bars
    document.querySelectorAll(".skill-fill").forEach(function (bar) {
        const current = Number(bar.dataset.current);

        if (Number.isFinite(current)) {
            const level = Math.max(0, Math.min(5, current));
            bar.style.width = (level * 20) + "%";
        }
    });

});


