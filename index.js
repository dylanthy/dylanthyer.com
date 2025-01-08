document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".container");
    const scrollSpeed = 0.05;

    container.innerHTML += container.innerHTML;
    const totalWidth = container.scrollWidth / 2;

    let scrollPosition = 0;
    let isScrolling = false;

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
});
