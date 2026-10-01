import { gsap } from 'gsap';

// Header animations
export const animateHeaderFadeDown = (element) => {
  gsap.fromTo(element, {
    opacity: 0,
    y: -50
  }, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: "power2.out"
  });
};

export const animateNotification = (element) => {
  gsap.fromTo(element, {
    opacity: 0,
    scale: 0.8,
    y: -20
  }, {
    opacity: 1,
    scale: 1,
    y: 0,
    duration: 0.3,
    ease: "back.out(1.7)"
  });
};

// Sidebar animations
export const animateSidebarSlide = (element) => {
  gsap.fromTo(element, {
    x: -100,
    opacity: 0
  }, {
    x: 0,
    opacity: 1,
    duration: 0.5,
    ease: "power2.out"
  });
};

export const animateSidebarItem = (element, delay = 0) => {
  gsap.fromTo(element, {
    x: -20,
    opacity: 0
  }, {
    x: 0,
    opacity: 1,
    duration: 0.3,
    delay: delay,
    ease: "power2.out"
  });
};


// Content area animations
export const animateContentCards = (elements) => {
  gsap.fromTo(elements, {
    opacity: 0,
    y: 30,
    scale: 0.95
  }, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.6,
    stagger: 0.1,
    ease: "power2.out"
  });
};

export const animateContentArea = (element) => {
  gsap.fromTo(element, {
    opacity: 0,
    scale: 0.98
  }, {
    opacity: 1,
    scale: 1,
    duration: 0.4,
    ease: "power2.out"
  });
};

// Form animations
export const animateFormInputs = (elements) => {
  gsap.fromTo(elements, {
    opacity: 0,
    y: 20
  }, {
    opacity: 1,
    y: 0,
    duration: 0.4,
    stagger: 0.05,
    ease: "power2.out"
  });
};

export const animateFormSubmit = (element) => {
  gsap.to(element, {
    scale: 0.95,
    duration: 0.1,
    yoyo: true,
    repeat: 1,
    ease: "power2.inOut"
  });
};

// Button animations
export const animateButtonHover = (element) => {
  gsap.to(element, {
    scale: 1.05,
    duration: 0.2,
    ease: "power2.out"
  });
};

export const animateButtonLeave = (element) => {
  gsap.to(element, {
    scale: 1,
    duration: 0.2,
    ease: "power2.out"
  });
};

export const animateButtonClick = (element) => {
  gsap.to(element, {
    scale: 0.95,
    duration: 0.1,
    yoyo: true,
    repeat: 1,
    ease: "power2.inOut"
  });
};

// Message animations
export const animateMessageSlide = (element, direction = 'right') => {
  const x = direction === 'right' ? 50 : -50;
  gsap.fromTo(element, {
    x: x,
    opacity: 0,
    scale: 0.8
  }, {
    x: 0,
    opacity: 1,
    scale: 1,
    duration: 0.3,
    ease: "back.out(1.7)"
  });
};

export const animateMessageTyping = (element) => {
  gsap.to(element, {
    opacity: 0.5,
    duration: 0.5,
    repeat: -1,
    yoyo: true,
    ease: "power2.inOut"
  });
};

// Appointment animations
export const animateAppointmentCard = (element, delay = 0) => {
  gsap.fromTo(element, {
    opacity: 0,
    y: 20,
    scale: 0.95
  }, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.4,
    delay: delay,
    ease: "back.out(1.7)"
  });
};

export const animateBookingForm = (element) => {
  gsap.fromTo(element, {
    opacity: 0,
    y: -30,
    scale: 0.95
  }, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.5,
    ease: "back.out(1.7)"
  });
};

// University section animations
export const animateUniversityForm = (element) => {
  gsap.fromTo(element, {
    opacity: 0,
    x: -30
  }, {
    opacity: 1,
    x: 0,
    duration: 0.5,
    ease: "power2.out"
  });
};

export const animateUniversitySummary = (element) => {
  gsap.fromTo(element, {
    opacity: 0,
    x: 30
  }, {
    opacity: 1,
    x: 0,
    duration: 0.5,
    ease: "power2.out"
  });
};

// Contract animations
export const animateContractUpload = (element) => {
  gsap.fromTo(element, {
    opacity: 0,
    scale: 0.9
  }, {
    opacity: 1,
    scale: 1,
    duration: 0.5,
    ease: "back.out(1.7)"
  });
};

export const animateProgressBar = (element, progress) => {
  gsap.to(element, {
    width: `${progress}%`,
    duration: 1,
    ease: "power2.out"
  });
};

// Dossier timeline animations
export const animateTimeline = (element) => {
  gsap.fromTo(element, {
    opacity: 0,
    x: -50
  }, {
    opacity: 1,
    x: 0,
    duration: 0.6,
    ease: "power2.out"
  });
};

export const animateTimelineStep = (element, delay = 0) => {
  gsap.fromTo(element, {
    opacity: 0,
    scale: 0.8,
    y: 20
  }, {
    opacity: 1,
    scale: 1,
    y: 0,
    duration: 0.4,
    delay: delay,
    ease: "back.out(1.7)"
  });
};

// Announcement animations
export const animateAnnouncementCard = (element, delay = 0) => {
  gsap.fromTo(element, {
    opacity: 0,
    y: 30,
    rotationX: 10
  }, {
    opacity: 1,
    y: 0,
    rotationX: 0,
    duration: 0.5,
    delay: delay,
    ease: "power2.out"
  });
};

// Loading animations
export const animateLoadingSpinner = (element) => {
  gsap.to(element, {
    rotation: 360,
    duration: 1,
    repeat: -1,
    ease: "none"
  });
};

// Success/Error animations
export const animateSuccessMessage = (element) => {
  gsap.fromTo(element, {
    opacity: 0,
    scale: 0.5,
    y: -20
  }, {
    opacity: 1,
    scale: 1,
    y: 0,
    duration: 0.4,
    ease: "back.out(1.7)"
  });
};

export const animateErrorMessage = (element) => {
  gsap.fromTo(element, {
    opacity: 0,
    x: -20
  }, {
    opacity: 1,
    x: 0,
    duration: 0.3,
    ease: "power2.out"
  });
  
  // Add shake effect
  gsap.to(element, {
    x: 5,
    duration: 0.1,
    repeat: 5,
    yoyo: true,
    ease: "power2.inOut",
    delay: 0.3
  });
};

// Modal animations
export const animateModalOpen = (element) => {
  gsap.fromTo(element, {
    opacity: 0,
    scale: 0.8
  }, {
    opacity: 1,
    scale: 1,
    duration: 0.3,
    ease: "back.out(1.7)"
  });
};

export const animateModalClose = (element) => {
  gsap.to(element, {
    opacity: 0,
    scale: 0.8,
    duration: 0.2,
    ease: "power2.in"
  });
};

// Page transition animations
export const animatePageTransition = (element, callback) => {
  gsap.to(element, {
    opacity: 0,
    y: 20,
    duration: 0.3,
    ease: "power2.in",
    onComplete: callback
  });
};

export const animatePageEntry = (element) => {
  gsap.fromTo(element, {
    opacity: 0,
    y: 20
  }, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: "power2.out"
  });
};

// Utility function to stagger animate elements
export const staggerAnimate = (elements, animation, staggerDelay = 0.1) => {
  gsap.fromTo(elements, animation.from, {
    ...animation.to,
    stagger: staggerDelay
  });
};
