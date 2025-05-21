const overlay = {
    init(api) {
        if(api.options.device === 'desktop') {
            api.events.on('resize', size => {
                const overlay = getOverlay();
                if(overlay.classList.contains('blackout') || overlay.classList.contains('blocking')) {
                    overlay.style.height = '100%';
                } else {
                    overlay.style.height = size.bottom + 'px';
                }
            });
        }

        api.events.on('pause', () => {
            const container = getContainer();
            container.classList.add('overlay');
            container.classList.add('paused');
        });

        api.events.on('resume', () => {
            const container = getContainer();
            if(container.classList.contains('paused')) {
                container.classList.remove('overlay');
                container.classList.remove('paused');
            }
        });
    }
};

function getContainer() {
    return document.querySelector('.nolimit.container');
}

function getOverlay() {
    return document.querySelector('.nolimit .overlay');
}

module.exports = overlay;
