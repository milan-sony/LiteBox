import React, { useState, useEffect } from 'react'

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
                <a className="btn btn-ghost text-xl font-poppins">📦 LiteBox</a>
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
