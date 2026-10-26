// Current year in the footer.
    document.getElementById('year').textContent = new Date().getFullYear();

    // Use each supplied poster when its local image file is available; otherwise keep the CSS artwork visible.
    document.querySelectorAll('.project-art > img').forEach((img) => {
      const art = img.closest('.project-art');
      const showImage = () => art.classList.add('has-image');
      img.addEventListener('load', showImage, { once: true });
      img.addEventListener('error', () => { art.classList.remove('has-image'); img.removeAttribute('src'); }, { once: true });
      if (img.complete && img.naturalWidth > 0) showImage();
    });

    // Working portfolio category filters.
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projects = document.querySelectorAll('.project');
    let filterTransitionId = 0;
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const selected = button.dataset.filter;
        const transitionId = ++filterTransitionId;
        filterButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));

        // Fade the current cards away before changing the grid, then reveal matching cards smoothly.
        projects.forEach((project) => {
          project.classList.remove('filter-in');
          if (!project.hidden) project.classList.add('filter-out');
        });

        window.setTimeout(() => {
          if (transitionId !== filterTransitionId) return;
          projects.forEach((project) => {
            const matches = selected === 'all' || project.dataset.category === selected;
            project.hidden = !matches;
            project.classList.remove('filter-out');
            if (matches) {
              // Restart the entrance animation reliably when switching tabs.
              void project.offsetWidth;
              project.classList.add('filter-in');
            }
          });
        }, 180);
      });
    });



    // Accessible project modal: thumbnail click, text link, arrows, keyboard, close button and backdrop.
    const projectModal = document.getElementById('project-modal');
    const modalArtStage = document.getElementById('modal-art-stage');
    const modalCategory = document.getElementById('modal-category');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalFocus = document.getElementById('modal-focus');
    const modalClose = document.getElementById('modal-close');
    const modalPrev = document.getElementById('modal-prev');
    const modalNext = document.getElementById('modal-next');
    const modalContact = document.getElementById('modal-contact');
    const projectCards = Array.from(projects);
    let currentProject = null;
    let lastTrigger = null;

    const designFocus = {
      food: 'Food-led composition, warm colour, clear campaign hierarchy and product-focused messaging.',
      beauty: 'A premium colour palette, elegant typography, editorial composition and offer-led messaging.',
      fitness: 'High contrast, bold typography, energetic hierarchy and motivating campaign messaging.'
    };

    function visibleProjects() {
      return projectCards.filter((project) => !project.hidden);
    }

    function showProject(project, trigger = null) {
      if (!project) return;
      currentProject = project;
      if (trigger) lastTrigger = trigger;

      const info = project.querySelector('.projectinfo');
      const art = project.querySelector('.project-art');
      const title = info.querySelector('h3');
      const description = info.querySelector('p');
      const tag = info.querySelector('.tag');
      const preview = art.cloneNode(true);
      preview.classList.remove('project-art-clickable');
      preview.removeAttribute('role');
      preview.removeAttribute('tabindex');
      preview.removeAttribute('aria-haspopup');
      preview.removeAttribute('aria-label');
      preview.querySelector('.project-art-hint')?.remove();
      modalArtStage.replaceChildren(preview);
      modalCategory.textContent = `${project.dataset.category} campaign${tag ? ` · ${tag.textContent.trim()}` : ''}`;
      modalTitle.textContent = title.textContent.trim();
      modalDescription.textContent = description ? description.textContent.trim() : '';
      modalFocus.textContent = designFocus[project.dataset.category] || 'Thoughtful typography, purposeful colour and a clear visual message.';

      const navList = visibleProjects();
      const position = navList.indexOf(project);
      modalPrev.disabled = navList.length < 2;
      modalNext.disabled = navList.length < 2;
      modalPrev.setAttribute('aria-label', `Previous project${position > 0 ? `: ${navList[position - 1].querySelector('h3')?.textContent.trim()}` : ': last project'}`);
      modalNext.setAttribute('aria-label', `Next project${position < navList.length - 1 ? `: ${navList[position + 1].querySelector('h3')?.textContent.trim()}` : ': first project'}`);

      if (typeof projectModal.showModal === 'function') {
        if (!projectModal.open) projectModal.showModal();
      } else {
        projectModal.setAttribute('open', '');
      }
    }

    function openAdjacentProject(direction) {
      const navList = visibleProjects();
      if (navList.length < 2 || !currentProject) return;
      let index = navList.indexOf(currentProject);
      if (index < 0) index = 0;
      const nextIndex = (index + direction + navList.length) % navList.length;
      showProject(navList[nextIndex]);
    }

    projectCards.forEach((project) => {
      const info = project.querySelector('.projectinfo');
      const title = info.querySelector('h3');
      const art = project.querySelector('.project-art');
      const openButton = document.createElement('button');
      openButton.type = 'button';
      openButton.className = 'view-project';
      openButton.innerHTML = 'View project details <span aria-hidden="true">↗</span>';
      openButton.setAttribute('aria-haspopup', 'dialog');
      openButton.setAttribute('aria-label', `View details for ${title.textContent.trim()}`);
      info.appendChild(openButton);

      // Make the artwork itself the primary modal trigger, with keyboard support.
      art.classList.add('project-art-clickable');
      art.setAttribute('role', 'button');
      art.setAttribute('tabindex', '0');
      art.setAttribute('aria-haspopup', 'dialog');
      art.setAttribute('aria-label', `Open project preview: ${title.textContent.trim()}`);
      const hint = document.createElement('span');
      hint.className = 'project-art-hint';
      hint.innerHTML = '<span aria-hidden="true">↗</span> View project';
      art.appendChild(hint);

      art.addEventListener('click', () => showProject(project, art));
      art.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          showProject(project, art);
        }
      });
      openButton.addEventListener('click', () => showProject(project, openButton));
    });

    function closeProjectModal() {
      if (typeof projectModal.close === 'function' && projectModal.open) {
        projectModal.close();
      } else {
        projectModal.removeAttribute('open');
      }
    }

    modalPrev.addEventListener('click', () => openAdjacentProject(-1));
    modalNext.addEventListener('click', () => openAdjacentProject(1));
    modalClose.addEventListener('click', closeProjectModal);
    projectModal.addEventListener('click', (event) => {
      if (event.target === projectModal) closeProjectModal();
    });
    projectModal.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        openAdjacentProject(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        openAdjacentProject(1);
      }
    });
    projectModal.addEventListener('close', () => {
      if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
      currentProject = null;
    });
    modalContact.addEventListener('click', () => {
      // Let the contact anchor navigate without focus restoration pulling the page back to the thumbnail.
      lastTrigger = null;
      closeProjectModal();
    });

    // Keep the header transparent at the top, then smoothly turn it white on scroll.
    const siteHeader = document.querySelector('.site-header');
    const updateHeaderOnScroll = () => {
      siteHeader.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    updateHeaderOnScroll();
    window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });

    // Mobile off-canvas side navigation.
    const menuToggle = document.querySelector('.menu-toggle');
    const sideNav = document.getElementById('mobile-side-nav');
    const sideBackdrop = document.getElementById('mobile-side-backdrop');
    const sideClose = document.querySelector('.side-nav-close');
    const sideLinks = [...sideNav.querySelectorAll('a[href^="#"]')];
    const setSideNav = (open) => {
      sideNav.classList.toggle('open', open);
      sideBackdrop.classList.toggle('open', open);
      sideNav.setAttribute('aria-hidden', String(!open));
      sideBackdrop.setAttribute('aria-hidden', String(!open));
      menuToggle.setAttribute('aria-expanded', String(open));
      menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menuToggle.textContent = open ? '×' : '☰';
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) sideClose.focus();
    };
    menuToggle.addEventListener('click', () => setSideNav(!sideNav.classList.contains('open')));
    sideClose.addEventListener('click', () => { setSideNav(false); menuToggle.focus(); });
    sideBackdrop.addEventListener('click', () => { setSideNav(false); });
    sideLinks.forEach((link) => link.addEventListener('click', () => setSideNav(false)));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && sideNav.classList.contains('open')) {
        setSideNav(false);
        menuToggle.focus();
      }
    });

    // Highlight the active section in the mobile side navigation while scrolling.
    const sideNavLinks = [...sideNav.querySelectorAll('a[href^="#"]')].filter((link) => link.getAttribute('href') !== '#top');
    const observedSections = sideNavLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    if ('IntersectionObserver' in window) {
      const sectionObserver = new IntersectionObserver((entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        sideNavLinks.forEach((link) => {
          if (link.getAttribute('href') === '#' + visible.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }, { rootMargin: '-18% 0px -55% 0px', threshold: [0, .1, .25, .5] });
      observedSections.forEach((section) => sectionObserver.observe(section));
    }