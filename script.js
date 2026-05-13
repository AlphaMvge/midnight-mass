document.addEventListener('DOMContentLoaded', () => {
    // 1. Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const cards = document.querySelectorAll('.animate-on-scroll');
    cards.forEach((card, index) => {
        // Stagger initial load slightly
        setTimeout(() => {
            observer.observe(card);
        }, index * 100); 
    });

    // 2. Filter Logic
    const filterBtns = document.querySelectorAll('.filter-btn');
    const allCards = document.querySelectorAll('.card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add to clicked
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            allCards.forEach(card => {
                // Reset visibility for re-animation
                card.classList.remove('visible');

                setTimeout(() => {
                    if (filterValue === 'all' || card.classList.contains(filterValue)) {
                        card.style.display = 'block';
                        // Trigger reflow to restart animation
                        void card.offsetWidth;
                        card.classList.add('visible');
                    } else {
                        card.style.display = 'none';
                    }
                }, 300); // Wait for fade out
            });
        });
    });

    // 3. Simple particle effect background
    const createParticle = () => {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.width = Math.random() * 3 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = Math.random() > 0.5 ? 'rgba(247, 118, 142, 0.2)' : 'rgba(255, 158, 100, 0.2)';
        particle.style.left = Math.random() * 100 + 'vw';
        particle.style.top = Math.random() * 100 + 'vh';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1';
        particle.style.animation = `float ${Math.random() * 10 + 5}s linear infinite`;
        
        document.getElementById('particles').appendChild(particle);
    };

    // Add CSS for particle float
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes float {
            0% { transform: translateY(0) translateX(0); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Create 30 particles
    for(let i = 0; i < 30; i++) {
        createParticle();
    }
});
