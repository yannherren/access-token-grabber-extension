const revealTargets = document.querySelectorAll('.step, .outro-inner');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }
    });
}, {threshold: 0.25});

revealTargets.forEach(el => observer.observe(el));