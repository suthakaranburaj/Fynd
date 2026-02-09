// Animation variants
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

export const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
    },
  }),
  hover: {
    scale: 1.0,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
    transition: {
      duration: 0.2,
    },
  },
};

export const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.95,
  },
};

export const badgeVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.01,
    transition: {
      duration: 0.2,
    },
  },
};

// New Animation Variants
export const fadeInUp = {
  hidden: {
    opacity: 0,
    y: 60,
    transition: {
      type: "spring" as const,
      damping: 12,
      stiffness: 100,
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      damping: 12,
      stiffness: 100,
      delay: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
};

export const fadeIn = {
  hidden: {
    opacity: 0,
    transition: {
      duration: 0.4,
    },
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
};

export const slideIn = {
  hidden: (direction: string = "left") => ({
    opacity: 0,
    x: direction === "left" ? -100 : direction === "right" ? 100 : 0,
    y: direction === "top" ? -100 : direction === "bottom" ? 100 : 0,
  }),
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      type: "spring" as const,
      damping: 15,
      stiffness: 100,
      mass: 0.5,
    },
  },
  exit: (direction: string = "left") => ({
    opacity: 0,
    x: direction === "left" ? -100 : direction === "right" ? 100 : 0,
    y: direction === "top" ? -100 : direction === "bottom" ? 100 : 0,
    transition: {
      duration: 0.3,
    },
  }),
};

// Scale variants
export const scaleUp = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      damping: 15,
      stiffness: 200,
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.95,
  },
};

// Rotate variants
export const rotateIn = {
  hidden: {
    opacity: 0,
    rotateY: 90,
  },
  visible: {
    opacity: 1,
    rotateY: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Bounce variants
export const bounceIn = {
  hidden: {
    opacity: 0,
    y: 100,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      bounce: 0.6,
      duration: 0.8,
    },
  },
};

// Page transition variants
export const pageTransition = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

// List item variants for staggered lists
export const listVariants = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  },
};

// Card hover variants
export const cardHover = {
  initial: {
    scale: 1,
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
  hover: {
    scale: 1.02,
    y: -8,
    boxShadow:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20,
    },
  },
};

// Text reveal variants
export const textReveal = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

// Gradient background variants
export const gradientBg = {
  initial: {
    backgroundPosition: "0% 50%",
  },
  animate: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
    transition: {
      duration: 5,
      ease: "linear",
      repeat: Infinity,
    },
  },
};

// Typewriter effect variants
export const typewriter = {
  hidden: {
    width: "0%",
    opacity: 0,
  },
  visible: {
    width: "100%",
    opacity: 1,
    transition: {
      width: {
        duration: 1.5,
        ease: "easeInOut",
      },
      opacity: {
        duration: 0.01,
      },
    },
  },
};

// Shimmer effect variants
export const shimmer = {
  initial: {
    backgroundPosition: "-200% center",
  },
  animate: {
    backgroundPosition: ["0% center", "200% center"],
    transition: {
      backgroundPosition: {
        duration: 2,
        ease: "linear",
        repeat: Infinity,
      },
    },
  },
};

// Pulse animation variants
export const pulse = {
  initial: {
    scale: 1,
  },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

// Floating animation variants
export const floating = {
  initial: {
    y: 0,
  },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

// Attention seeker variants
export const attentionSeeker = {
  initial: {
    scale: 1,
    rotate: 0,
  },
  animate: {
    scale: [1, 1.1, 1],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 0.5,
      times: [0, 0.3, 0.7, 1],
    },
  },
};

// Complex stagger for dashboard items
export const dashboardStagger = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  },
  item: {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  },
};

// Modal variants
export const modalVariants = {
  overlay: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },
  content: {
    hidden: {
      opacity: 0,
      scale: 0.9,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 20,
      transition: {
        duration: 0.2,
      },
    },
  },
};

// Notification/toast variants
export const notificationVariants = {
  hidden: {
    opacity: 0,
    x: 100,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      damping: 20,
      stiffness: 200,
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: {
      duration: 0.2,
    },
  },
};

// Loading spinner variants
export const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: "linear",
      repeat: Infinity,
    },
  },
};
