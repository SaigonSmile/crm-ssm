// app.js - Global UI Interactions

document.addEventListener('DOMContentLoaded', () => {
    // Inject Layout
    if (typeof injectLayout === 'function') {
        const pageName = document.body.getAttribute('data-page') || 'dashboard';
        injectLayout(pageName);
    }
});

function openSlideOver(id) {
    const slideOver = document.getElementById(id);
    const backdrop = document.getElementById('slide-over-backdrop');
    if(slideOver) slideOver.classList.add('translate-x-0');
    if(slideOver) slideOver.classList.remove('translate-x-full');
    if(backdrop) backdrop.classList.remove('hidden');
}

function closeSlideOver(id) {
    const slideOver = document.getElementById(id);
    const backdrop = document.getElementById('slide-over-backdrop');
    if(slideOver) slideOver.classList.remove('translate-x-0');
    if(slideOver) slideOver.classList.add('translate-x-full');
    if(backdrop) backdrop.classList.add('hidden');
}

function openModal(id) {
    const modal = document.getElementById(id);
    if(modal) modal.classList.remove('hidden');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if(modal) modal.classList.add('hidden');
}
