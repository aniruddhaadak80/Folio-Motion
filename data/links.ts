export interface ProjectLink {
  name: string;
  tagline: string;
  url: string;
  repo: string;
  video?: string;
  problem: string;
  approach: string;
  result: string;
  tags: string[];
  image?: string;
  featured?: boolean;
}

export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  location: string;
  summary: string;
  achievements: string[];
  skills: string[];
}

export interface SkillCategory {
  title: string;
  icon: string;
  skills: { name: string; level?: string }[];
}

export interface CertificationItem {
  title: string;
  issuer: string;
  year?: string;
  badge?: string;
}

export interface PortfolioLinks {
  personal: {
    name: string;
    role: string;
    title: string;
    bio: string;
    email: string;
    phone: string;
    location: string;
    education: {
      degree: string;
      college: string;
      university: string;
      cgpa: string;
      period: string;
    };
    highlights: string[];
  };
  github: string;
  linkedin: string;
  email: string;
  resumeUrl: string;
  twitter?: string;
  projects: ProjectLink[];
  experience: ExperienceItem[];
  skills: SkillCategory[];
  certifications: CertificationItem[];
}

export const links: PortfolioLinks = {
  personal: {
    name: "Subrat Kumar Sahoo",
    role: "AI & ML Engineer",
    title: "AI & ML Engineer | Data Science | Full-Stack Developer",
    bio: "Computer Science undergraduate specializing in Artificial Intelligence, Machine Learning, and Full-Stack Engineering. Driven by building real-world AI applications, autonomous agents, and high-performance web systems with measurable impact.",
    email: "ssubratkumar106@gmail.com",
    phone: "+91 7735355017",
    location: "Odisha, India",
    education: {
      degree: "B.Tech in Computer Science & Engineering",
      college: "KMBB College of Engineering and Technology",
      university: "BPUT University, Khordha, Odisha",
      cgpa: "8.95 / 10.0",
      period: "2024 – Present",
    },
    highlights: [
      "Completed Virtual Data Science & AI Internships across Thiranex, IncodeVision, and XTRAGRAD",
      "Engineered full-scale production applications: LearnVaultX and ExamSentinelX AI",
      "Earned 19+ verified industry credentials including Google AI Agents & BCG Data Science",
      "Consistent academic excellence with an 8.95 CGPA in Computer Science",
    ],
  },
  github: "https://github.com/ssubratkumar106-blip",
  linkedin: "https://www.linkedin.com/in/subrat-kumar-sahoo-277664344",
  email: "ssubratkumar106@gmail.com",
  twitter: "https://twitter.com",
  resumeUrl: "/resume.pdf",
  projects: [
    {
      name: "LearnVaultX",
      tagline: "AI-Driven Adaptive Learning & Exam Simulation Platform",
      url: "https://learnvaultx.online/",
      repo: "https://github.com/teamvisioncraft875-netizen/LearnVaultX---AI-Driven-Adaptive-Learning-Platform-.git",
      video: "https://youtu.be/XCCQ-AFeC-M?si=NxrrAntN2FLuSvCW",
      problem:
        "Static e-learning quizzes fail to challenge learners dynamically or diagnose root knowledge gaps under true exam pressure.",
      approach:
        "Architected an intelligent assessment engine in Flask with dynamic difficulty scaling, performance trend analytics, and real-time LLM tutor support.",
      result:
        "Calculates real-time readiness scoring (0–100%), schedules automated revision for weak modules, and delivers gamified mastery tracking.",
      tags: ["Python", "Flask API", "Machine Learning", "LLM", "Adaptive AI"],
      image: "/images/projects/learnvaultx.jpg",
      featured: true,
    },
    {
      name: "ExamSentinelX AI",
      tagline: "Online Exam Abnormal Activity & Computer Vision Proctoring",
      url: "https://examsentinelx-ai.onrender.com",
      repo: "https://github.com/ssubratkumar106-blip/ExamSentinelX-AI",
      problem:
        "Remote examinations demand continuous invigilation to prevent academic dishonesty while respecting infrastructure constraints.",
      approach:
        "Engineered a lightweight computer vision pipeline using OpenCV and machine learning classifiers to analyze video frames in real time.",
      result:
        "Accurately detects face absence, multiple faces, head angles, and suspicious gaze divergence with instant evaluator alerts.",
      tags: ["Python", "OpenCV", "Computer Vision", "Machine Learning", "Flask"],
      image: "/images/projects/examsentinelx.jpg",
      featured: true,
    },
    {
      name: "Apple Stock Price Analysis & Prediction",
      tagline: "Exploratory Market Time-Series & Regression Modeling",
      url: "https://github.com/ssubratkumar106-blip/Mega_DataScience_Project",
      repo: "https://github.com/ssubratkumar106-blip/Mega_DataScience_Project",
      problem:
        "Historical equities data features complex stochastic volatility requiring rigorous feature extraction to isolate predictive signals.",
      approach:
        "Executed end-to-end Exploratory Data Analysis (EDA) on AAPL historical records, engineered rolling lag indicators, and evaluated regression models.",
      result:
        "Produced comprehensive visual charts of moving averages and constructed predictive models estimating subsequent price trajectories.",
      tags: ["Python", "Pandas", "Scikit-Learn", "Matplotlib", "EDA"],
      image: "/images/projects/apple_stock_prediction.jpg",
      featured: true,
    },
    {
      name: "Futuristic Tic Tac Toe",
      tagline: "Cyberpunk Interactive Web Game with Minimax Engine",
      url: "https://ssubratkumar106-blip.github.io/Tic_Tac_Toe/",
      repo: "https://github.com/ssubratkumar106-blip/Tic_Tac_Toe.git",
      problem:
        "Building a latency-free, zero-framework interactive web game with rich visuals and responsive touch compatibility.",
      approach:
        "Implemented minimax decision trees and CSS variable-driven neon visuals on pure DOM events.",
      result:
        "Fluid 60fps gameplay with sound feedback, instant replayability, and zero external runtime dependencies.",
      tags: ["HTML5", "CSS3", "JavaScript", "Game Algorithms"],
      image: "/images/projects/tic_tac_toe.jpg",
      featured: false,
    },
    {
      name: "Daily Task Tracker",
      tagline: "Full-Stack Productivity Dashboard with API Sync",
      url: "https://github.com/ssubratkumar106-blip/Daily_task_Tracker.git",
      repo: "https://github.com/ssubratkumar106-blip/Daily_task_Tracker.git",
      problem:
        "Managing daily developer tasks quickly without bloated enterprise productivity tools.",
      approach:
        "Built a minimalist RESTful interface with Flask endpoints and responsive JavaScript state management.",
      result:
        "Fast, persistent task organization with category filters and completion metrics.",
      tags: ["Python (Flask)", "JavaScript", "HTML5", "CSS3"],
      image: "/images/projects/daily_task_tracker.jpg",
      featured: false,
    },
  ],
  experience: [
    {
      role: "AI Intern (Virtual)",
      company: "XTRAGRAD Pvt. Ltd.",
      period: "July 2026 – August 2026",
      location: "Virtual / Remote",
      summary:
        "Spearheaded prompt engineering, agentic workflow architecture, and LLM tooling integration.",
      achievements: [
        "Contributed to the design of autonomous AI agent workflows for enterprise domain use cases.",
        "Integrated modern LLM APIs into rapid prototypes and internal productivity utilities.",
        "Conducted system latency profiling and fine-tuned prompt structures for high response accuracy.",
        "Documented technical specifications and collaborated with cross-functional product teams.",
      ],
      skills: ["AI Agents", "Prompt Engineering", "LLM APIs", "Agent.ai", "FastAPI / Flask"],
    },
    {
      role: "Data Science Intern (Virtual)",
      company: "Thiranex & IncodeVision",
      period: "June 2026 – August 2026",
      location: "Virtual / Remote",
      summary:
        "Focused on data preprocessing, feature engineering, and exploratory analysis alongside predictive modeling across production datasets.",
      achievements: [
        "Built end-to-end data cleaning pipelines and feature transformations utilizing Python, Pandas, and NumPy.",
        "Executed Exploratory Data Analysis (EDA) and crafted visualization dashboards for stakeholder reporting.",
        "Trained, benchmarked, and tuned regression and classification models with Scikit-Learn cross-validation.",
        "Practiced collaborative Git workflows within an Agile engineering team.",
      ],
      skills: ["Python", "Pandas", "NumPy", "EDA", "Machine Learning", "Scikit-Learn", "Git"],
    },
  ],
  skills: [
    {
      title: "Artificial Intelligence & ML",
      icon: "Brain",
      skills: [
        { name: "Prompt Engineering" },
        { name: "Autonomous AI Agents" },
        { name: "LLM API Integration" },
        { name: "Computer Vision (OpenCV)" },
        { name: "Scikit-Learn" },
        { name: "Haar Cascade / Motion Detection" },
        { name: "Agent.ai" },
      ],
    },
    {
      title: "Data Science & Analytics",
      icon: "BarChart3",
      skills: [
        { name: "NumPy & Pandas" },
        { name: "Exploratory Data Analysis (EDA)" },
        { name: "Data Cleaning & Preprocessing" },
        { name: "Matplotlib & Seaborn" },
        { name: "Feature Engineering" },
        { name: "Statistical Modeling" },
      ],
    },
    {
      title: "Full-Stack Development",
      icon: "Code2",
      skills: [
        { name: "Python" },
        { name: "JavaScript (ES6+)" },
        { name: "Java" },
        { name: "C / C++" },
        { name: "Next.js & React (basics)" },
        { name: "Tailwind CSS" },
        { name: "Flask REST APIs" },
        { name: "HTML5 & Modern CSS3" },
      ],
    },
    {
      title: "Tools, Platforms & Cloud",
      icon: "Wrench",
      skills: [
        { name: "Git & GitHub" },
        { name: "Docker" },
        { name: "VS Code" },
        { name: "Jupyter Notebook & Colab" },
        { name: "MySQL / Relational DBs" },
        { name: "Linux / Shell" },
      ],
    },
  ],
  certifications: [
    {
      title: "Google — 5-Day AI Agents: Intensive Vibe Coding Course",
      issuer: "Google",
      badge: "AI Agents",
    },
    {
      title: "BCG Data Science Job Simulation",
      issuer: "Forage / Boston Consulting Group",
      badge: "Data Science",
    },
    {
      title: "AWS Educate Machine Learning Foundations",
      issuer: "Amazon Web Services",
      badge: "Cloud ML",
    },
    {
      title: "AWS Introduction to Generative AI",
      issuer: "Amazon Web Services",
      badge: "GenAI",
    },
    {
      title: "Python & Java Certifications",
      issuer: "HackerRank",
      badge: "Languages",
    },
    {
      title: "Frontend Development & Git/GitHub Professional Badges",
      issuer: "IBM",
      badge: "Full-Stack",
    },
    {
      title: "AICTE Internship Program 2026 (Foundation Track)",
      issuer: "AICTE",
      badge: "Government",
    },
  ],
};

export default links;
