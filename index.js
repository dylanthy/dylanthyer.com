document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".container");
    const scrollSpeed = 0.05;
    let scrollPosition = 0;
    let isScrolling = false;
    let lastIsMobileView = window.innerWidth < 1230; // Store the initial state

    function isMobileView() {
        return window.innerWidth < 1230;
    }

    function enableHorizontalScroll() {
        if (!container.dataset.duplicated) {
            container.innerHTML += container.innerHTML;
            container.dataset.duplicated = "true";
        }

        const totalWidth = container.scrollWidth / 2;

        window.addEventListener("wheel", (event) => {
            event.preventDefault();
            scrollPosition += event.deltaY;
            startScrolling();
        });

        function startScrolling() {
            if (!isScrolling) {
                isScrolling = true;
                window.requestAnimationFrame(smoothScroll);
            }
        }

        function smoothScroll() {
            const currentScroll = window.scrollX;
            const difference = scrollPosition - currentScroll;

            if (Math.abs(difference) > 1) {
                window.scrollBy(difference * scrollSpeed, 0);
                window.requestAnimationFrame(smoothScroll);
            } else {
                isScrolling = false;
            }

            if (window.scrollX >= totalWidth) {
                window.scrollTo({ left: window.scrollX - totalWidth });
                scrollPosition -= totalWidth;
            } else if (window.scrollX <= 0) {
                window.scrollTo({ left: window.scrollX + totalWidth });
                scrollPosition += totalWidth;
            }
        }
    }

    function disableHorizontalScroll() {
        if (container.dataset.duplicated) {
            const children = Array.from(container.children);
            const half = Math.ceil(children.length / 2);
            while (container.children.length > half) {
                container.removeChild(container.lastChild);
            }
            container.dataset.duplicated = "false";
        }
        window.removeEventListener("wheel", null);
    }

    function handleResize() {
        const currentIsMobileView = isMobileView();

        // Check if the threshold was crossed
        if (currentIsMobileView !== lastIsMobileView) {
            location.reload(); // Reload the page if the threshold is crossed
        }

        lastIsMobileView = currentIsMobileView; // Update the last known state
    }

    function updateLayout() {
        if (isMobileView()) {
            disableHorizontalScroll();
            container.style.overflow = "visible";
        } else {
            enableHorizontalScroll();
            container.style.overflow = "hidden";
        }
    }

    window.addEventListener("resize", handleResize);
    updateLayout();
});
