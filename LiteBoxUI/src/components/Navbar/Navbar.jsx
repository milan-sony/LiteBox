import { Box } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Navbar() {
    const [theme, setTheme] = useState("emerald")

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme")
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        if (savedTheme) {
            setTheme(savedTheme)
        } else if (systemPrefersDark) {
            setTheme("night")
        }
    }, [])

    useEffect(() => {
        const html = document.documentElement
        html.setAttribute("data-theme", theme)
        localStorage.setItem("theme", theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme(theme === "emerald" ? "night" : "emerald")
    }

    return (
        <div className="navbar bg-base-100 shadow-sm">
            <div className="flex-1">
                <Link to={"/"} className='btn btn-ghost text-xl font-[poppins]'><Box /> LiteBox</Link>
            </div>
            <div className="flex-none">
                <button onClick={toggleTheme}>
                    {
                        theme === 'night' ? (
                            <span className='text-xl'>🌞</span>
                        ) : (
                            <span className='text-xl'>🌛</span>
                        )
                    }
                </button>
            </div>
        </div>
    )
}

export default Navbar
