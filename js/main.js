const beeModel = document.getElementById('bee-model');
const Sections = Array.from(document.querySelectorAll('section'));

const shiftPositions = [0, -20, 0, 25];
const cameraOrbits = [[90, 90], [-45, 90], [-180, 0], [45, 90]];

let sectionOffsets = Sections.map(section => section.offsetTop);
const updateSectionOffsets = () => { sectionOffsets = Sections.map(section => section.offsetTop); };
window.addEventListener('resize', updateSectionOffsets);
window.addEventListener('load', updateSectionOffsets);

const lastSectionIndex = Sections.length - 1;

const interpolate = (start, end, progress) => start + (end - start) * progress;

const getScrollProgress = scrollY => {
    for (let i = 0; i < lastSectionIndex; i++) {
        if (scrollY >= sectionOffsets[i] && scrollY < sectionOffsets[i + 1]) {
            return i + (scrollY - sectionOffsets[i]) / (sectionOffsets[i + 1] - sectionOffsets[i]);
        }
    }

    return lastSectionIndex;
};

if (Sections.length === 0) {
    console.warn('No <section> elements found — scroll effects disabled.');
} else {
    window.addEventListener('scroll', () => {
        const scrollProgress = getScrollProgress(window.scrollY);
        const sectionIndex = Math.min(Math.floor(scrollProgress), lastSectionIndex);
        const sectionProgress = scrollProgress - sectionIndex;

        const currentShift = interpolate(
            shiftPositions[sectionIndex],
            shiftPositions[sectionIndex + 1] ?? shiftPositions[sectionIndex],
            sectionProgress
        );

        const currentOrbit = cameraOrbits[sectionIndex].map((value, i) =>
            interpolate(value, cameraOrbits[sectionIndex + 1]?.[i] ?? value, sectionProgress)
        );

        if (beeModel) {
            beeModel.style.transform = `translateX(${currentShift}%)`;
            beeModel.setAttribute('camera-orbit', `${currentOrbit[0]}deg ${currentOrbit[1]}deg`);
        }
    });
}

// --- Smooth scrolling for anchors and mobile menu toggle ---
const headerEl = document.querySelector('header');
const getHeaderOffset = () => (headerEl ? headerEl.offsetHeight : 0);

function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function smoothScrollTo(targetY, duration = 900) {
    const startY = window.scrollY || window.pageYOffset;
    const diff = targetY - startY;
    if (Math.abs(diff) < 1) return;
    const startTime = performance.now();

    function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutQuad(progress);
        window.scrollTo(0, Math.round(startY + diff * eased));
        if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        const id = href.slice(1);
        const target = document.getElementById(id);
        if (!target) return;

        e.preventDefault();
        const targetY = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset() - 8;
        smoothScrollTo(targetY, 900);
        history.pushState(null, '', `#${id}`);
    });
});

// No mobile menu toggle (menu button removed)
