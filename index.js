document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".container");
    const scrollbarContainer = document.querySelector(".scrollbar-container");
    const scrollbarThumb = document.querySelector(".scrollbar-thumb");
    let lastIsMobileView = window.innerWidth < 1230;
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;
    let skipWrapping = false;

    function isMobileView() {
        return window.innerWidth < 1230;
    }

    function enableHorizontalScroll() {
        // Duplicate content for infinite scrolling effect
        if (!container.dataset.duplicated) {
            const originalContent = container.innerHTML;
            container.innerHTML += originalContent;
            container.dataset.duplicated = "true";
        }

        const totalWidth = container.scrollWidth / 2;

        // Convert vertical scroll to horizontal
        const handleWheel = (event) => {
            if (event.deltaY !== 0) {
      
                event.preventDefault();
                window.scrollBy(event.deltaY, 0);
            }
        };

        window.addEventListener("wheel", handleWheel, { passive: false });
        container.dataset.wheelListener = "true";

        // Handle wrapping
        const handleScroll = () => {
            const currentScroll = window.scrollX;
            
            // Only skip wrapping logic while dragging, but still update scrollbar
            if (!skipWrapping) {
                if (currentScroll >= totalWidth) {
                    window.scrollTo({ left: currentScroll - totalWidth, behavior: "instant" });
                } else if (currentScroll <= 0) {
                    window.scrollTo({ left: totalWidth, behavior: "instant" });
                }
            }

            updateScrollbar();
        };

        window.addEventListener("scroll", handleScroll);
        container.dataset.scrollListener = "true";

        // Initialize scrollbar
        updateScrollbar();
        initScrollbar();
    }

    function updateScrollbar() {
        if (!scrollbarThumb || isMobileView()) return;

        const container = document.querySelector(".container");
        const totalWidth = container.scrollWidth / 2;
        const viewportWidth = window.innerWidth;
        const scrollPosition = window.scrollX % totalWidth;
        
        // Calculate thumb width and position
        const thumbWidth = Math.max((viewportWidth / totalWidth) * 100, 5); // Min 5%
        const thumbPosition = (scrollPosition / totalWidth) * 100;

        scrollbarThumb.style.width = `${thumbWidth}%`;
        scrollbarThumb.style.left = `${thumbPosition}%`;

        // Create or update duplicate thumb for seamless wrapping
        let duplicateThumb = scrollbarContainer.querySelector(".scrollbar-thumb-duplicate");
        
        // Show duplicate when thumb would wrap around
        if (thumbPosition + thumbWidth > 100) {
            if (!duplicateThumb) {
                duplicateThumb = document.createElement("div");
                duplicateThumb.className = "scrollbar-thumb scrollbar-thumb-duplicate";
                scrollbarContainer.appendChild(duplicateThumb);
            }
            // Position duplicate on the left side
            const duplicatePosition = thumbPosition - 100;
            duplicateThumb.style.width = `${thumbWidth}%`;
            duplicateThumb.style.left = `${duplicatePosition}%`;
            duplicateThumb.style.display = "block";
        } else if (thumbPosition < 0) {
            if (!duplicateThumb) {
                duplicateThumb = document.createElement("div");
                duplicateThumb.className = "scrollbar-thumb scrollbar-thumb-duplicate";
                scrollbarContainer.appendChild(duplicateThumb);
            }
            // Position duplicate on the right side
            const duplicatePosition = thumbPosition + 100;
            duplicateThumb.style.width = `${thumbWidth}%`;
            duplicateThumb.style.left = `${duplicatePosition}%`;
            duplicateThumb.style.display = "block";
        } else if (duplicateThumb) {
            duplicateThumb.style.display = "none";
        }
    }

    function initScrollbar() {
        if (!scrollbarThumb || !scrollbarContainer) return;

        // Dragging functionality - using event delegation to handle both thumbs
        scrollbarContainer.addEventListener("mousedown", (e) => {
            if (e.target.classList.contains("scrollbar-thumb") || 
                e.target.classList.contains("scrollbar-thumb-duplicate")) {
                isDragging = true;
                skipWrapping = true;
                startX = e.clientX;
                scrollLeft = window.scrollX;
                scrollbarThumb.classList.add("dragging");
                
                // Add dragging class to duplicate if it exists
                const duplicateThumb = scrollbarContainer.querySelector(".scrollbar-thumb-duplicate");
                if (duplicateThumb) {
                    duplicateThumb.classList.add("dragging");
                }
                
                e.preventDefault();
            }
        });

        document.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            e.preventDefault();

            const totalWidth = container.scrollWidth / 2;
            const containerWidth = scrollbarContainer.offsetWidth;
            const deltaX = e.clientX - startX;
            const scrollDelta = (deltaX / containerWidth) * totalWidth;

            window.scrollTo({ left: scrollLeft + scrollDelta, behavior: "instant" });
        });

        document.addEventListener("mouseup", () => {
            if (isDragging) {
                isDragging = false;
                scrollbarThumb.classList.remove("dragging");
                
                // Remove dragging class from duplicate if it exists
                const duplicateThumb = scrollbarContainer.querySelector(".scrollbar-thumb-duplicate");
                if (duplicateThumb) {
                    duplicateThumb.classList.remove("dragging");
                }
                
                // Re-enable wrapping and perform a wrap if needed
                skipWrapping = false;
                const totalWidth = container.scrollWidth / 2;
                const currentScroll = window.scrollX;
                
                if (currentScroll >= totalWidth) {
                    window.scrollTo({ left: currentScroll - totalWidth, behavior: "instant" });
                } else if (currentScroll < 0) {
                    window.scrollTo({ left: currentScroll + totalWidth, behavior: "instant" });
                }
                
                updateScrollbar();
            }
        });

        // Click on scrollbar track
        scrollbarContainer.addEventListener("click", (e) => {
            if (e.target === scrollbarContainer) {
                const totalWidth = container.scrollWidth / 2;
                const containerWidth = scrollbarContainer.offsetWidth;
                const clickPosition = e.clientX - scrollbarContainer.getBoundingClientRect().left;
                const scrollToPosition = (clickPosition / containerWidth) * totalWidth;
                
                window.scrollTo({ left: scrollToPosition, behavior: "smooth" });
            }
        });
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
        
        // Hide scrollbar in mobile view
        if (scrollbarContainer) {
            scrollbarContainer.style.display = "none";
        }
    }

    function handleResize() {
        const currentIsMobileView = isMobileView();

        // Check if the threshold was crossed
        if (currentIsMobileView !== lastIsMobileView) {
            location.reload();
        }

        lastIsMobileView = currentIsMobileView;
        
        if (!currentIsMobileView) {
            updateScrollbar();
        }
    }

    function updateLayout() {
        if (isMobileView()) {
            disableHorizontalScroll();
            container.style.overflow = "visible";
        } else {
            enableHorizontalScroll();
            container.style.overflow = "hidden";
            if (scrollbarContainer) {
                scrollbarContainer.style.display = "block";
            }
        }
    }

    window.addEventListener("resize", handleResize);
    updateLayout();

    // Set initial scroll position to middle for proper wrapping
    if (!isMobileView() && container.dataset.duplicated) {
        window.scrollTo({ left: container.scrollWidth / 4, behavior: "instant" });
    }
});
