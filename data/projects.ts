export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  color: string;
  textColor: string;
  details: string;
  technologies: string[];
  github: string;
  live: string;
}

export const projects: Project[] = [
  {
    id: 1,
    title: "LearnVaultX",
    description:
      "AI-Driven Adaptive Learning & Exam Simulation Platform with real-time scoring and dynamic difficulty scaling.",
    image: "/images/projects/learnvaultx.jpg",
    color: "from-blue-600 to-indigo-700",
    textColor: "text-blue-100",
    details:
      "Architected an intelligent assessment engine in Flask with dynamic difficulty scaling, performance trend analytics, and real-time LLM tutor support. Delivers real-time readiness scoring (0–100%) and schedules automated revision for weak modules.",
    technologies: ["Python", "Flask API", "Machine Learning", "LLM", "Adaptive AI"],
    github:
      "https://github.com/teamvisioncraft875-netizen/LearnVaultX---AI-Driven-Adaptive-Learning-Platform-.git",
    live: "https://learnvaultx.online/",
  },
  {
    id: 2,
    title: "ExamSentinelX AI",
    description:
      "Online Exam Abnormal Activity & Computer Vision Proctoring detecting face absence and gaze divergence.",
    image: "/images/projects/examsentinelx.jpg",
    color: "from-emerald-600 to-teal-700",
    textColor: "text-emerald-100",
    details:
      "Engineered a lightweight computer vision pipeline using OpenCV and machine learning classifiers to analyze video frames in real time. Accurately detects face absence, multiple faces, head angles, and suspicious gaze divergence with instant evaluator alerts.",
    technologies: ["Python", "OpenCV", "Computer Vision", "Machine Learning", "Flask"],
    github: "https://github.com/ssubratkumar106-blip/ExamSentinelX-AI",
    live: "https://examsentinelx-ai.onrender.com",
  },
  {
    id: 3,
    title: "Apple Stock Price Prediction",
    description:
      "Exploratory market time-series analysis and regression modeling evaluating stock price trajectories.",
    image: "/images/projects/apple_stock_prediction.jpg",
    color: "from-purple-600 to-pink-700",
    textColor: "text-purple-100",
    details:
      "Executed end-to-end Exploratory Data Analysis (EDA) on AAPL historical records, engineered rolling lag indicators, and evaluated regression models to isolate predictive signals with Matplotlib and Scikit-Learn.",
    technologies: ["Python", "Pandas", "Scikit-Learn", "Matplotlib", "EDA"],
    github: "https://github.com/ssubratkumar106-blip/Mega_DataScience_Project",
    live: "https://github.com/ssubratkumar106-blip/Mega_DataScience_Project",
  },
  {
    id: 4,
    title: "Futuristic Tic Tac Toe",
    description:
      "Cyberpunk interactive web game featuring minimax AI decision algorithms and fluid 60fps animations.",
    image: "/images/projects/tic_tac_toe.jpg",
    color: "from-cyan-600 to-blue-700",
    textColor: "text-cyan-100",
    details:
      "Implemented minimax decision trees and CSS variable-driven neon visuals on pure DOM events with zero external runtime dependencies, sound feedback, and instant replayability.",
    technologies: ["HTML5", "CSS3", "JavaScript", "Minimax Algorithm"],
    github: "https://github.com/ssubratkumar106-blip/Tic_Tac_Toe.git",
    live: "https://ssubratkumar106-blip.github.io/Tic_Tac_Toe/",
  },
  {
    id: 5,
    title: "Daily Task Tracker",
    description:
      "Full-Stack Productivity Dashboard with Flask RESTful API sync and responsive state management.",
    image: "/images/projects/daily_task_tracker.jpg",
    color: "from-rose-600 to-red-700",
    textColor: "text-rose-100",
    details:
      "Built a minimalist RESTful interface with Flask endpoints and responsive JavaScript state management for fast, persistent task organization with category filters and completion metrics.",
    technologies: ["Python (Flask)", "JavaScript", "HTML5", "CSS3"],
    github: "https://github.com/ssubratkumar106-blip/Daily_task_Tracker.git",
    live: "https://github.com/ssubratkumar106-blip/Daily_task_Tracker.git",
  },
];

export default projects;
