import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
  Bell,
  BarChart3,
  ChevronRight,
  Menu,
  X,
  Shield,
  Zap,
  TrendingUp,
  Calendar,
  MessageSquare,
  UserPlus,
  Star,
  Github,
  Twitter,
  Linkedin,
  Mail,
  ArrowUpRight,
  Rocket,
  Sparkles,
  Target,
  BarChart,
  Cloud,
  Lock,
  User,
  LogOut,
  Brain,
  CalendarDays,
  MailCheck,
  MessageCircle,
  BellRing,
  Globe,
  Award,
  Briefcase,
  ExternalLink,
  CalendarCheck,
  Target as TargetIcon,
  CloudCog,
  Bot,
  Zap as ZapIcon,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  containerVariants,
  itemVariants,
  fadeInUp,
  staggerContainer,
  fadeIn,
  slideIn,
} from "@/components/FramerVariants";
import { useAuth } from "@/contexts/AuthContext";

// Top Banner for Fynd Hiring Challenge
const FyndChallengeBanner = () => {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 px-4"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4" />
          <span className="font-semibold text-sm sm:text-base">
            Fynd Hackathon Submission: Automated Chaser Agent
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs sm:text-sm">
          {/* <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Submission by: Feb 11, 11:00 AM IST</span>
          </div> */}
          <Badge className="bg-white text-purple-600 hover:bg-white/90">
            <Briefcase className="h-3 w-3 mr-1" />
            SDE Intern Hiring
          </Badge>
        </div>
      </div>
    </motion.div>
  );
};

// Candidate Info Section
const CandidateInfo = () => {
  const links = [
    {
      name: "Portfolio",
      url: "https://suthakaranburaj.com",
      icon: <Globe className="h-4 w-4" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "GitHub",
      url: "https://github.com/suthakaranburaj",
      icon: <Github className="h-4 w-4" />,
      color: "from-gray-900 to-gray-700",
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/suthakar-anburaj-7bb816290/",
      icon: <Linkedin className="h-4 w-4" />,
      color: "from-blue-700 to-blue-500",
    },
  ];

  return (
    <section className="py-12 bg-gradient-to-b from-secondary/50 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-8"
        >
          <motion.div variants={fadeInUp}>
            <Badge className="mb-4 px-4 py-1.5">
              <User className="h-3.5 w-3.5 mr-1.5" />
              Candidate Information
            </Badge>
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-3xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Suthakar Anburaj
            </span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-muted-foreground mb-8">
            Building the Automated Chaser Agent for Fynd's SDE Intern Hiring
            Evaluation
          </motion.p>

          <motion.div
            variants={containerVariants}
            className="flex flex-wrap justify-center gap-4 mb-8"
          >
            {links.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                variants={itemVariants}
                custom={index}
                className={`group relative bg-gradient-to-r ${link.color} text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex items-center gap-2`}
              >
                {link.icon}
                {link.name}
                <ExternalLink className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </motion.a>
            ))}
          </motion.div>

          <motion.div variants={fadeIn} className="mt-8">
            <Card className="max-w-3xl mx-auto">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Hackathon Project</h3>
                    <p className="text-sm text-muted-foreground">
                      Automated Chaser Agent - Eliminating manual follow-ups
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">24/7</div>
                    <div className="text-sm text-muted-foreground">
                      Automated Tracking
                    </div>
                  </div>
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">AI</div>
                    <div className="text-sm text-muted-foreground">
                      Smart Reminders
                    </div>
                  </div>
                  <div className="text-center p-4 bg-secondary/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">100%</div>
                    <div className="text-sm text-muted-foreground">
                      Time Saved
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

// Navbar Component
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "AI Daily Planner", href: "#ai-planner" },
    { label: "Team Collaboration", href: "#team-collab" },
    { label: "Calendar", href: "#calendar" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Contact", href: "#contact" },
  ];

  const productLinks = [
    {
      title: "AI Daily Planner",
      description: "Smart daily planning with morning email summaries",
      icon: <Brain className="h-4 w-4" />,
      href: "#ai-planner",
    },
    {
      title: "Team Collaboration",
      description: "Real-time task management and team coordination",
      icon: <Users className="h-4 w-4" />,
      href: "#team-collab",
    },
    {
      title: "Smart Calendar",
      description: "Unified calendar view with task integration",
      icon: <CalendarDays className="h-4 w-4" />,
      href: "#calendar",
    },
    {
      title: "Real-time Notifications",
      description: "Instant updates on task changes and deadlines",
      icon: <BellRing className="h-4 w-4" />,
      href: "#features",
    },
  ];

  const handleSignInClick = () => {
    navigate("/login");
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-8 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-lg border-b shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                <ZapIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                TaskChaser
              </span>
            </Link>
            <Badge variant="outline" className="ml-2 hidden sm:flex">
              <Sparkles className="h-3 w-3 mr-1" />
              Fynd Hackathon
            </Badge>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent">
                    Features
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px]">
                      {productLinks.map((link, index) => (
                        <motion.div
                          key={link.title}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <NavigationMenuLink asChild>
                            <a
                              href={link.href}
                              className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary transition-colors group"
                            >
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <div className="text-primary">{link.icon}</div>
                              </div>
                              <div>
                                <div className="font-medium text-foreground">
                                  {link.title}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {link.description}
                                </p>
                              </div>
                            </a>
                          </NavigationMenuLink>
                        </motion.div>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {navLinks.slice(1, 5).map((link) => (
              <motion.a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {link.label}
              </motion.a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="ghost" size="sm" onClick={handleSignInClick}>
                    Sign In
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/register">
                    <Button size="sm" className="gap-2">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t absolute top-16 left-0 right-0 bg-background shadow-lg"
          >
            <div className="px-4 py-6 space-y-4">
              <div className="space-y-2">
                <div className="px-3 py-2 text-sm font-semibold text-muted-foreground">
                  Features
                </div>
                {productLinks.map((link) => (
                  <a
                    key={link.title}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
                  >
                    {link.icon}
                    <span>{link.title}</span>
                  </a>
                ))}
              </div>

              <div className="space-y-2 pt-4 border-t">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <div className="pt-4 border-t space-y-3">
                {user ? (
                  <>
                    <Link to="/dashboard">
                      <Button variant="outline" className="w-full gap-2">
                        <User className="h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      className="w-full gap-2"
                      onClick={logout}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleSignInClick}
                    >
                      Sign In
                    </Button>
                    <Link to="/register">
                      <Button className="w-full gap-2">
                        Get Started Free
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// Hero Section
const HeroSection = () => {
  return (
    <section className="relative pt-40 pb-20 md:pt-48 md:pb-28 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-60 -left-40 w-80 h-80 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center"
        >
          <motion.div variants={fadeInUp}>
            <Badge className="mb-6 px-4 py-1.5 text-sm font-medium">
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              Fynd Hackathon: Automated Chaser Agent
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            <span className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
              Intelligent Task
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Management & Follow-ups
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10"
          >
            Built for Fynd's SDE Intern Hiring. An AI-powered system that
            automates follow-ups, sends smart reminders, and ensures deadlines
            are met—all without micromanagement. Powered by Boltic workflows.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Link to="/register">
              <Button size="lg" className="gap-2 px-8 py-6 text-base">
                Try Demo Version
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 px-8 py-6 text-base"
              onClick={() =>
                document.getElementById("how-it-works")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              <PlayCircle className="h-5 w-5" />
              See How It Works
            </Button>
          </motion.div>

          <motion.div
            variants={fadeIn}
            className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <CloudCog className="h-4 w-4 text-blue-500" />
              Powered by Boltic Workflows
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              AI-Powered Daily Planning
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              Real-time Team Collaboration
            </div>
            <div className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-orange-500" />
              Smart Notifications
            </div>
          </motion.div>
        </motion.div>

        {/* Hero Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-16 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
          <div className="relative rounded-2xl border shadow-2xl overflow-hidden bg-card">
            <div className="h-8 bg-secondary flex items-center px-4 justify-between">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="text-xs text-muted-foreground">
                TaskChaser Dashboard Preview
              </div>
            </div>
            <div className="p-6">
              {/* Mock dashboard content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[
                  { title: "Active Tasks", value: "24", color: "bg-blue-500" },
                  {
                    title: "Pending Follow-ups",
                    value: "8",
                    color: "bg-orange-500",
                  },
                  {
                    title: "Completed Today",
                    value: "12",
                    color: "bg-green-500",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="space-y-2 p-4 bg-secondary/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className={`h-3 w-3 rounded-full ${item.color}`} />
                    </div>
                    <div className="h-6 bg-muted rounded w-1/4" />
                    <div className="h-2 bg-muted rounded w-3/4" />
                  </div>
                ))}
              </div>
              <div className="mt-6 h-48 bg-gradient-to-r from-primary/10 to-secondary/30 rounded-lg border flex items-center justify-center">
                <div className="text-center">
                  <CalendarDays className="h-12 w-12 text-primary/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Interactive Calendar View
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    See all tasks, deadlines, and team availability
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Enhanced Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI Daily Planner",
      description:
        "Smart daily planning with automated morning email summaries using Boltic workflows",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      tag: "New",
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: "Smart Reminders",
      description:
        "Context-aware notifications that adapt to user behavior and project urgency",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: <TargetIcon className="h-6 w-6" />,
      title: "Automated Follow-ups",
      description: "Intelligent chaser system that eliminates manual check-ins",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Team Collaboration",
      description:
        "Real-time task management, comments, and team coordination features",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: <CalendarCheck className="h-6 w-6" />,
      title: "Calendar Integration",
      description:
        "Unified calendar view with task deadlines and team availability",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Progress Tracking",
      description: "Real-time analytics and insights into team productivity",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      icon: <BellRing className="h-6 w-6" />,
      title: "Real-time Notifications",
      description:
        "Instant updates on task changes, mentions, and deadline alerts",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      icon: <MailCheck className="h-6 w-6" />,
      title: "Email Automation",
      description:
        "Automated email summaries, follow-ups, and acknowledgment emails",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
  ];

  return (
    <section id="features" className="py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="outline" className="mb-4">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Complete Feature Set
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
          >
            Everything you need to
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {" "}
              automate follow-ups
            </span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Built for Fynd's Hackathon with comprehensive features for modern
            task management
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              custom={index}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`h-12 w-12 rounded-xl ${feature.bgColor} flex items-center justify-center`}
                    >
                      <div className={feature.color}>{feature.icon}</div>
                    </div>
                    {feature.tag && (
                      <Badge className="bg-purple-500 hover:bg-purple-600">
                        {feature.tag}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                  <Button variant="link" className="px-0 mt-4 gap-1">
                    Learn more
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// AI Daily Planner Section
const AIDailyPlannerSection = () => {
  const plannerFeatures = [
    {
      step: "1",
      title: "Morning Email Summary",
      description:
        "Get a personalized daily plan emailed every morning with tasks, deadlines, and priorities",
      icon: <Mail className="h-5 w-5" />,
    },
    {
      step: "2",
      title: "Smart Task Prioritization",
      description:
        "AI analyzes deadlines, dependencies, and importance to create optimal task order",
      icon: <Brain className="h-5 w-5" />,
    },
    {
      step: "3",
      title: "Boltic Workflow Automation",
      description:
        "Automated workflows trigger email summaries, reminders, and follow-ups",
      icon: <CloudCog className="h-5 w-5" />,
    },
    {
      step: "4",
      title: "Progress Tracking",
      description:
        "Track completion throughout the day with automated updates and adjustments",
      icon: <TrendingUp className="h-5 w-5" />,
    },
  ];

  return (
    <section
      id="ai-planner"
      className="py-20 bg-gradient-to-b from-background to-secondary/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp}>
            <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500">
              <Brain className="h-3.5 w-3.5 mr-1.5" />
              AI-Powered
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              AI Daily Planner
            </span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10"
          >
            Start your day with a smart plan. Our AI analyzes your tasks and
            sends a personalized daily agenda via email using Boltic workflows.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-2 border-primary/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MailCheck className="h-5 w-5 text-primary" />
                  Daily Planning Email Example
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <div className="font-semibold">
                      Good Morning! Here's your plan for today:
                    </div>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-green-500" />
                        <span>Complete project proposal (High Priority)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-yellow-500" />
                        <span>Team sync meeting at 2:00 PM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-blue-500" />
                        <span>Review PRs from team members</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      This email is automatically generated every morning at
                      7:00 AM
                    </p>
                    <p className="mt-1">
                      Powered by Boltic workflow automation and AI task analysis
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {plannerFeatures.map((feature) => (
              <div key={feature.step} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <div className="text-primary font-bold">{feature.step}</div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-primary">{feature.icon}</div>
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Team Collaboration Section
const TeamCollaborationSection = () => {
  const collaborationFeatures = [
    {
      icon: <Users className="h-5 w-5" />,
      title: "Real-time Updates",
      description: "See team progress and changes as they happen",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: "Task Comments",
      description: "Discuss tasks directly within the platform",
    },
    {
      icon: <BellRing className="h-5 w-5" />,
      title: "@Mentions",
      description: "Notify specific team members with @mentions",
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      title: "Approval Workflows",
      description: "Set up multi-stage approval processes",
    },
  ];

  return (
    <section id="team-collab" className="py-20 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Team Collaboration
            </span>
            <br />
            Made Seamless
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Work together efficiently with real-time updates, task comments, and
            team coordination features
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="chat">Team Chat</TabsTrigger>
                <TabsTrigger value="tasks">Task Board</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
              </TabsList>
              <TabsContent value="chat" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-sm font-semibold">JD</span>
                        </div>
                        <div>
                          <div className="font-semibold">John Doe</div>
                          <p className="text-sm">
                            Can you review the design mockups?
                          </p>
                          <span className="text-xs text-muted-foreground">
                            2 min ago
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 ml-8">
                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          <span className="text-sm font-semibold">SA</span>
                        </div>
                        <div>
                          <div className="font-semibold">Sarah Adams</div>
                          <p className="text-sm">
                            Sure, I'll review them by EOD
                          </p>
                          <span className="text-xs text-muted-foreground">
                            Just now
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="tasks">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <span>Complete homepage redesign</span>
                        <Badge>In Progress</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <span>Write API documentation</span>
                        <Badge variant="outline">Todo</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="progress">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Project Alpha</span>
                          <span>75%</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Website Redesign</span>
                          <span>40%</span>
                        </div>
                        <Progress value={40} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-6"
          >
            {collaborationFeatures.map((feature, index) => (
              <Card key={feature.title} className="border">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <div className="text-primary">{feature.icon}</div>
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Calendar Interface Section
const CalendarInterfaceSection = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const tasks = [
    { day: 1, title: "Team Meeting", color: "bg-blue-500" },
    { day: 2, title: "Project Deadline", color: "bg-red-500" },
    { day: 3, title: "Client Call", color: "bg-green-500" },
    { day: 5, title: "Code Review", color: "bg-purple-500" },
    { day: 7, title: "Weekly Planning", color: "bg-orange-500" },
  ];

  return (
    <section id="calendar" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="outline" className="mb-4">
              <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
              Calendar View
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
          >
            Unified
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {" "}
              Calendar Interface
            </span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            See all your tasks, deadlines, and team events in one integrated
            calendar view
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <Card className="border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    February 2024
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      &lt;
                    </Button>
                    <Button size="sm" variant="outline">
                      &gt;
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {days.map((day) => (
                    <div
                      key={day}
                      className="text-center font-semibold text-muted-foreground py-2"
                    >
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => {
                    const dayTasks = tasks.filter((task) => task.day === day);
                    return (
                      <div
                        key={day}
                        className="min-h-24 border rounded-lg p-2 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="font-semibold">{day}</div>
                        <div className="mt-2 space-y-1">
                          {dayTasks.map((task, index) => (
                            <div
                              key={index}
                              className={`${task.color} text-white text-xs px-2 py-1 rounded truncate`}
                              title={task.title}
                            >
                              {task.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "Project Alpha", date: "Today", priority: "high" },
                  {
                    title: "Client Report",
                    date: "Tomorrow",
                    priority: "medium",
                  },
                  { title: "Team Retro", date: "Feb 14", priority: "low" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Due: {item.date}
                      </div>
                    </div>
                    <Badge
                      variant={
                        item.priority === "high"
                          ? "destructive"
                          : item.priority === "medium"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {item.priority}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      name: "John D.",
                      status: "Available",
                      color: "bg-green-500",
                    },
                    {
                      name: "Sarah A.",
                      status: "Busy",
                      color: "bg-yellow-500",
                    },
                    { name: "Mike R.", status: "Out", color: "bg-gray-500" },
                  ].map((person, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-3 w-3 rounded-full ${person.color}`}
                          />
                          <span className="font-medium">{person.name}</span>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {person.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// How It Works Section
const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      title: "Connect with Boltic",
      description:
        "Integrate with Boltic workflows to automate your follow-ups and reminders",
      icon: <CloudCog className="h-6 w-6" />,
    },
    {
      number: "02",
      title: "Set Your Rules",
      description: "Configure smart reminders and follow-up schedules",
      icon: <Calendar className="h-6 w-6" />,
    },
    {
      number: "03",
      title: "Add Team Members",
      description: "Invite your team and assign roles and permissions",
      icon: <UserPlus className="h-6 w-6" />,
    },
    {
      number: "04",
      title: "Automate & Track",
      description:
        "Watch as TaskChaser handles follow-ups and provides insights",
      icon: <TrendingUp className="h-6 w-6" />,
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-20 bg-gradient-to-b from-secondary/30 to-background"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
          >
            Built with
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {" "}
              Boltic Workflows
            </span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Leveraging Boltic's powerful automation capabilities for intelligent
            task management
          </motion.p>
        </motion.div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="relative z-10">
                  <Card className="text-center border-none shadow-lg">
                    <CardContent className="p-8">
                      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary text-2xl font-bold mb-6">
                        {step.number}
                      </div>
                      <div className="h-12 w-12 mx-auto rounded-xl bg-secondary flex items-center justify-center mb-4">
                        {step.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-3">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <Card className="max-w-3xl mx-auto border-primary/20">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-4 mb-6">
                <CloudCog className="h-10 w-10 text-primary" />
                <div>
                  <h3 className="text-2xl font-bold">Boltic Integration</h3>
                  <p className="text-muted-foreground">
                    Automated workflows for daily planning and follow-ups
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">
                    Automated Tracking
                  </div>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-primary">AI</div>
                  <div className="text-sm text-muted-foreground">
                    Smart Scheduling
                  </div>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground">
                    Time Saved
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager at TechCorp",
      content:
        "TaskChaser has reduced our manual follow-up time by 80%. It's like having an extra project manager on the team.",
      avatar: "SC",
      rating: 5,
    },
    {
      name: "Michael Rodriguez",
      role: "CTO at StartupXYZ",
      content:
        "The automated reminders are incredibly smart. They adapt to our team's working patterns and actually get responses.",
      avatar: "MR",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      role: "Team Lead at DesignStudio",
      content:
        "Our team's productivity increased by 40% after implementing TaskChaser. The analytics alone are worth it.",
      avatar: "PS",
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp}>
            <Badge variant="outline" className="mb-4">
              <Star className="h-3.5 w-3.5 mr-1.5" />
              Loved by Teams
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
          >
            Trusted by
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {" "}
              thousands of teams
            </span>
          </motion.h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className="h-full">
                <CardContent className="p-8">
                  <div className="flex mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 text-yellow-400 fill-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-lg mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-semibold text-primary">
                        {testimonial.avatar}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp}>
            <Badge className="mb-6">
              <Rocket className="h-3.5 w-3.5 mr-1.5" />
              Fynd Hackathon Project
            </Badge>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
          >
            Experience the future of
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {" "}
              task management
            </span>
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-xl text-muted-foreground mb-10"
          >
            Built for Fynd's SDE Intern Hiring. See how automated follow-ups can
            transform your team's productivity
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
          >
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Enter your work email"
                className="h-12"
              />
            </div>
            <Link to="/register">
              <Button size="lg" className="h-12 gap-2">
                Try Demo
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>

          <motion.p
            variants={fadeIn}
            className="text-sm text-muted-foreground mt-4"
          >
            Built by Suthakar Anburaj for Fynd Hackathon • Automated Chaser
            Agent • No credit card required
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  const footerLinks = {
    Product: [
      "AI Daily Planner",
      "Team Collaboration",
      "Calendar",
      "Reminders",
      "Analytics",
    ],
    Features: [
      "Automated Follow-ups",
      "Real-time Notifications",
      "Smart Scheduling",
      "Email Automation",
      "Boltic Integration",
    ],
    "Fynd Hackathon": [
      "Challenge Details",
      "Requirements",
      "Evaluation",
      "Submission",
      "Resources",
    ],
    Candidate: ["Portfolio", "GitHub", "LinkedIn", "Project Docs", "Contact"],
  };

  const socialLinks = [
    { icon: <Twitter className="h-5 w-5" />, href: "#", label: "Twitter" },
    {
      icon: <Linkedin className="h-5 w-5" />,
      href: "https://www.linkedin.com/in/suthakar-anburaj-7bb816290/",
      label: "LinkedIn",
    },
    {
      icon: <Github className="h-5 w-5" />,
      href: "https://github.com/suthakaranburaj",
      label: "GitHub",
    },
    {
      icon: <Mail className="h-5 w-5" />,
      href: "mailto:suthakaranburaj@gmail.com",
      label: "Email",
    },
  ];

  return (
    <footer id="contact" className="border-t bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                <ZapIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                TaskChaser
              </span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              An Automated Chaser Agent built for Fynd's SDE Intern Hiring
              Hackathon. Eliminates manual follow-ups with intelligent reminders
              and AI-powered task management.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target={social.href !== "#" ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
                    >
                      {link}
                      <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Candidate Info */}
        <div className="mt-12 pt-8 border-t">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Candidate Information</h3>
              <p className="text-muted-foreground mb-4">
                This project is submitted by <strong>Suthakar Anburaj</strong>{" "}
                for the Fynd SDE Intern Hiring Hackathon - Automated Chaser
                Agent.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://suthakaranburaj.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  Portfolio
                </a>
                <a
                  href="https://github.com/suthakaranburaj"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/suthakar-anburaj-7bb816290/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Project Features</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">AI Daily Planner</span>
                </div>
                <div className="flex items-center gap-2">
                  <CloudCog className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Boltic Workflows</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Team Collaboration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Calendar Integration</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TaskChaser. Built for Fynd Hackathon by
            Suthakar Anburaj.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Fynd Hackathon Project
            </span>
            <span className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Automated Chaser Agent
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main Home Component
export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <FyndChallengeBanner />
      <Navbar />

      <main>
        <HeroSection />
        <CandidateInfo />
        <FeaturesSection />
        <AIDailyPlannerSection />
        <TeamCollaborationSection />
        <CalendarInterfaceSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CTASection />
      </main>

      <Footer />

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {scrolled && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center z-50 hover:bg-primary/90 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// Add missing icon components
const PlayCircle = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ArrowUp = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 10l7-7m0 0l7 7m-7-7v18"
    />
  </svg>
);
