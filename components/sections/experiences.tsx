"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Github, Linkedin, Mail, Calendar } from "lucide-react"
import Image from "next/image"

// Example experiences data
const experiences = [
  {
    role: "Frontend Developer",
    company: "Tech Solutions",
    duration: "Jan 2022 - Present",
    description: "Developing cutting-edge web applications using Next.js, React, and Tailwind CSS.",
    technologies: ["React", "Next.js", "Tailwind CSS", "TypeScript"],
    companyLogo: "/path/to/logo1.png",  // Add the path to your logo image
  },
  {
    role: "UI/UX Designer",
    company: "Creative Agency",
    duration: "Jun 2020 - Dec 2021",
    description: "Designing interactive and user-friendly interfaces for web and mobile apps.",
    technologies: ["Figma", "Adobe XD", "UI/UX Design"],
    companyLogo: "/path/to/logo2.png",  // Add the path to your logo image
  },
  {
    role: "Full Stack Developer",
    company: "Web Innovators",
    duration: "Mar 2019 - May 2020",
    description: "Worked on both front-end and back-end development of an e-commerce platform using Node.js, Express, and React.",
    technologies: ["Node.js", "Express", "React", "MongoDB"],
    companyLogo: "/path/to/logo3.png",  // Add the path to your logo image
  },
  {
    role: "Backend Developer",
    company: "DataTech Solutions",
    duration: "Jan 2018 - Feb 2019",
    description: "Focused on developing and optimizing APIs and database architecture using Java and PostgreSQL.",
    technologies: ["Java", "Spring Boot", "PostgreSQL", "Docker"],
    companyLogo: "/path/to/logo4.png",  // Add the path to your logo image
  },
]

export function ExperienceSection() {
  return (
    <section id="experiences" className="py-24 bg-background">
      <div className="container px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid gap-12 md:grid-cols-2 items-center"
        >
          {/* Experience Cards */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-4 text-primary">Work Experience</h2>
              <p className="text-muted-foreground">
                A selection of my recent professional roles where I've grown my skills and worked on exciting projects.
              </p>
            </motion.div>

            {/* Cards for each experience */}
            {experiences.map((experience, index) => (
              <motion.div
                key={experience.company}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div className="relative w-full h-full group" style={{ perspective: "1000px" }}>
                  {/* Card with flip animation */}
                  <motion.div
                    className="w-full h-full transform-style-3d"
                    whileHover={{ rotateY: 180 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Front of the card */}
                    <Card className="p-6 bg-gradient-to-br from-accent to-primary shadow-xl rounded-lg relative overflow-hidden transform-style-3d backface-hidden">
                      {/* Experience Header */}
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 relative rounded-full overflow-hidden">
                          <Image
                            src={experience.companyLogo}
                            alt={experience.company}
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-light-foreground">{experience.role}</h3>
                          <p className="text-sm text-muted-foreground">{experience.company}</p>
                          <p className="text-sm text-muted-foreground">{experience.duration}</p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground mb-4">{experience.description}</p>

                      {/* Technologies */}
                      <div className="flex flex-wrap gap-2">
                        {experience.technologies.map((tech, index) => (
                          <motion.span
                            key={tech}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="px-3 py-1 bg-secondary rounded-full text-sm text-light-foreground"
                          >
                            {tech}
                          </motion.span>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-4 mt-6">
                        <Button variant="outline" className="text-light-foreground">
                          <Calendar className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                        <Button variant="ghost" size="icon" className="text-light-foreground">
                          <Github className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-light-foreground">
                          <Linkedin className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-light-foreground">
                          <Mail className="h-5 w-5" />
                        </Button>
                      </div>
                    </Card>

                    {/* Back of the card (for more details or additional content) */}
                    <div className="absolute inset-0 backface-hidden bg-secondary p-6 flex flex-col justify-center items-center rounded-lg shadow-xl">
                      <h3 className="text-xl font-semibold text-light-foreground">More About This Role</h3>
                      <p className="text-sm text-muted-foreground mt-4">
                        {experience.description} More details about this role, including technologies used, challenges faced, and accomplishments achieved.
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
