import React from 'react'
import Navbar from '../../components/Navbar/Navbar'

function IndexPage() {
    return (
        <>
            <div className="w-full">
                {/* Navbar */}
                <Navbar />

                {/* Hero Section */}
                <div className="h-[60vh] bg-red-300 flex flex-col justify-center items-center text-white px-4">
                    <h1 className="text-5xl font-bold mb-4">LiteBox</h1>
                    <p className="text-lg text-center max-w-2xl">
                        Your Personal Mobile/Laptop NAS Server - Lightweight. Secure. Private.
                    </p>
                </div>

                <div className='pl-4 pr-4'>

                    {/* Info Section */}
                    <div className="flex flex-col justify-center items-center text-center mt-10 mb-10">
                        <h2 className="text-3xl font-semibold mb-4">Why LiteBox?</h2>
                        <p className="max-w-2xl text-gray-700">
                            LiteBox is a lightweight, secure, and private NAS solution designed for both mobile and desktop platforms.
                            Easily manage and access your files from anywhere without relying on third-party cloud services.
                        </p>
                    </div>

                    {/* Cards Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                        {/* Card 1 */}
                        <div className="card bg-base-100 w-80 shadow-md">
                            <div className="card-body">
                                <h2 className="card-title">
                                    <div className="badge badge-secondary">New</div>
                                    Easy Setup
                                </h2>
                                <p>Get started in minutes with a plug-and-play experience that works on both mobile and desktop.</p>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="card bg-base-100 w-80 shadow-md">
                            <div className="card-body">
                                <h2 className="card-title">
                                    <div className="badge badge-accent">Secure</div>
                                    Private Storage
                                </h2>
                                <p>Your data stays with you. No external cloud - just secure personal storage you control.</p>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="card bg-base-100 w-80 shadow-md">
                            <div className="card-body">
                                <h2 className="card-title">
                                    <div className="badge badge-info">Fast</div>
                                    High Performance
                                </h2>
                                <p>Optimized for speed and efficiency so you can access files instantly on any device.</p>
                            </div>
                        </div>
                    </div>

                    {/* Button */}
                    <div className='mt-5 mb-5 flex justify-center items-center'>
                        <button className="mt-6 btn btn-secondary">🚀 Launch LiteBox</button>
                    </div>

                </div>
            </div>
        </>
    )
}

export default IndexPage
