'use client'

import { Github, Linkedin, Mail, Twitter, Users } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import Image from 'next/image'

export function Footer() {
  const [textColors, setTextColors] = useState(['text-blue-500', 'text-green-500', 'text-yellow-500', 'text-purple-500', 'text-pink-500'])
  const [imageRotation, setImageRotation] = useState(0)
  const [profileGlow, setProfileGlow] = useState(0)
  const [contributorScales, setContributorScales] = useState([1, 1, 1])

  useEffect(() => {
    const colorInterval = setInterval(() => {
      setTextColors(prevColors => [...prevColors.slice(1), prevColors[0]])
    }, 2000)

    const rotationInterval = setInterval(() => {
      setImageRotation(prev => (prev + 5) % 360)
    }, 100)

    const glowInterval = setInterval(() => {
      setProfileGlow(prev => (prev + 1) % 6)
    }, 1000)

    const scaleInterval = setInterval(() => {
      setContributorScales(prev => [
        1 + Math.sin(Date.now() / 1000) * 0.2,
        1 + Math.sin(Date.now() / 800) * 0.2,
        1 + Math.sin(Date.now() / 600) * 0.2,
      ])
    }, 50)

    return () => {
      clearInterval(colorInterval)
      clearInterval(rotationInterval)
      clearInterval(glowInterval)
      clearInterval(scaleInterval)
    }
  }, [])

  const glowColors = [
    'from-blue-400 via-green-400 to-purple-400',
    'from-red-400 via-yellow-400 to-green-400',
    'from-pink-400 via-purple-400 to-indigo-400',
    'from-yellow-400 via-red-400 to-pink-400',
    'from-green-400 via-blue-400 to-indigo-400',
    'from-purple-400 via-pink-400 to-red-400',
  ]

  return (
    <footer className="w-full border-t bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between space-y-8 md:flex-row md:space-y-0">
          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <div className="mb-4 relative group">
              <Image
                src="https://tinyurl.com/25l56ouh"
                alt="Aniruddha Adak"
                width={100}
                height={100}
                className="rounded-full border-4 border-primary shadow-lg transition-all duration-300 hover:scale-110 group-hover:shadow-primary/50"
                style={{ transform: `rotate(${imageRotation}deg)` }}
              />
              <div className={`absolute -inset-2 rounded-full opacity-50 animate-pulse bg-gradient-to-r ${glowColors[profileGlow]} blur-md transition-all duration-1000`}></div>
              <div className="absolute -inset-2 rounded-full opacity-25 animate-ping bg-gradient-to-r from-primary via-secondary to-primary"></div>
            </div>
            {[ 
              "© 2024 Folio Motion. All rights reserved.",
              "Created by ANIRUDDHA ADAK",
              "Phone: +917029155691",
              "Email: aniruddhaadak80@gmail.com"
            ].map((text, index) => (
              <p
                key={index}
                className={`mt-1 text-sm font-medium ${textColors[index]} transition-colors duration-500 ease-in-out animate-pulse hover:scale-105 transform`}
              >
                {text.startsWith('Phone:') ? (
                  <>Phone: <a href="tel:+917029155691" className="hover:underline hover:text-primary transition-colors duration-300">+917029155691</a></>
                ) : text.startsWith('Email:') ? (
                  <>Email: <a href="mailto:aniruddhaadak80@gmail.com" className="hover:underline hover:text-primary transition-colors duration-300">aniruddhaadak80@gmail.com</a></>
                ) : text}
              </p>
            ))}
          </div>
          <div className="flex flex-col items-center space-y-4">
            <div className="flex space-x-4">
              {[ 
                { icon: Github, href: "https://github.com/aniruddhaadak80", color: "text-purple-500" },
                { icon: Linkedin, href: "https://linkedin.com/in/aniruddha-adak", color: "text-blue-500" },
                { icon: Twitter, href: "https://twitter.com/aniruddha_adak", color: "text-sky-500" },
                { icon: Mail, href: "mailto:aniruddhaadak80@gmail.com", color: "text-red-500" },
                { icon: Users, href: "#contributors", color: "text-green-500" }
              ].map((social, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="icon"
                  className={`group transition-all duration-300 transform hover:scale-110 hover:rotate-6 ${social.color} hover:bg-${social.color}/10`}
                >
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative"
                  >
                    <social.icon className={`h-5 w-5 transition-all duration-300 ${social.color}`} />
                    <span className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping bg-current"></span>
                    <span className="absolute -inset-2 rounded-full opacity-0 group-hover:opacity-25 transition-opacity duration-300 bg-current blur-sm"></span>
                  </a>
                </Button>
              ))}
            </div>
            <div id="contributors" className="text-center">
              <h3 className="text-lg font-semibold mb-2 text-primary animate-bounce">Contributors</h3>
              <div className="flex justify-center space-x-4">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="relative group">
                    <Image
                      src="https://tinyurl.com/25l56ouh"
                      alt={`Contributor ${index + 1}`}
                      width={40}
                      height={40}
                      className="rounded-full border-2 border-primary transition-all duration-300 hover:border-4"
                      style={{
                        transform: `scale(${contributorScales[index]})`,
                        animation: `float${index + 1} ${3 + index}s ease-in-out infinite`
                      }}
                    />
                    <div className={`absolute -inset-1 rounded-full opacity-0 group-hover:opacity-25 transition-opacity duration-300 bg-primary blur-sm animate-pulse delay-${index * 100}`}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
      `}</style>
    </footer>
  )
}
