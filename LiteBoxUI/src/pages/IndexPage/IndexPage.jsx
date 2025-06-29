import React from 'react'
import Navbar from '../../components/Navbar/Navbar'

function IndexPage() {
    return (
        <>
            <div className="w-full">
                {/* Navbar */}
                <Navbar />

                {/* Hero Section */}
                <div className="h-[60vh] bg-base-300 flex flex-col justify-center items-center px-4">
                    <h1 className="text-5xl font-bold mb-4 font-[poppins]">LiteBox</h1>
                    <p className="text-xl text-center max-w-2xl font-[roboto]">
                        A Personal Mobile/Laptop NAS Server - Lightweight. Secure. Private.
                    </p>
                </div>

                <div className='pl-4 pr-4'>

                    {/* Info Section */}
                    <div className="flex flex-col justify-center items-center text-center mt-10 mb-10">
                        <h2 className="text-3xl font-semibold mb-4 font-[poppins]">Why LiteBox?</h2>
                        <p className="max-w-2xl text-base font-[roboto]">
                            LiteBox is a lightweight, secure, and private NAS (Network-Attached Storage) solution built for both mobile and desktop platforms. It empowers you to store, manage, and access your files from anywhere without relying on third-party cloud services.
                        </p>
                    </div>

                    {/* Cards Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                        {/* Card 1 */}
                        <div className="card bg-base-200 w-80 shadow-md">
                            <div className="card-body">
                                <h2 className="card-title">
                                    <div className="badge badge-secondary font-[poppins] text-lg">🔒</div>
                                    Secure
                                </h2>
                                <p className='text-sm font-[roboto]'>Your data stays yours. All files are stored locally and transmitted securely.</p>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="card bg-base-200 w-80 shadow-md">
                            <div className="card-body">
                                <h2 className="card-title">
                                    <div className="badge badge-secondary font-[poppins] text-lg">💻</div>
                                    Cross-Platform
                                </h2>
                                <p className='text-sm font-[roboto]'>Seamlessly access and manage files across desktop and mobile devices.</p>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="card bg-base-200 w-80 shadow-md">
                            <div className="card-body">
                                <h2 className="card-title">
                                    <div className="badge badge-secondary font-[poppins] text-lg">⚡</div>
                                    Lightweight
                                </h2>
                                <p className='text-sm font-[roboto]'>Optimized for speed and efficiency so you can access files instantly on any device.</p>
                            </div>
                        </div>

                        {/* Card 4 */}
                        <div className="card bg-base-200 w-80 shadow-md">
                            <div className="card-body">
                                <h2 className="card-title">
                                    <div className="badge badge-secondary font-[poppins] text-lg">📶</div>
                                    Works Offline
                                </h2>
                                <p className='text-sm font-[roboto]'>No internet? No problem. LiteBox works over your local Wi-Fi network.</p>
                            </div>
                        </div>

                        {/* Card 5 */}
                        <div className="card bg-base-200 w-80 shadow-md">
                            <div className="card-body">
                                <h2 className="card-title">
                                    <div className="badge badge-secondary font-[poppins] text-lg">✨</div>
                                    Minimal UI
                                </h2>
                                <p className='text-sm font-[roboto]'>Clean, responsive UI with dark mode, drag & drop uploads, and folder navigation.</p>
                            </div>
                        </div>

                        {/* Card 6 */}
                        <div className="card bg-base-200 w-80 shadow-md">
                            <div className="card-body">
                                <h2 className="card-title">
                                    <div className="badge badge-secondary font-[poppins] text-lg">📁</div>
                                    Easy File Sharing
                                </h2>
                                <p className='text-sm font-[roboto]'>Upload, download, or share files from your phone or any device on your network.</p>
                            </div>
                        </div>

                        {/* Card 7 */}
                        <div className="card bg-base-200 w-80 shadow-md">
                            <div className="card-body">
                                <h2 className="card-title">
                                    <div className="badge badge-secondary font-[poppins] text-lg">🛠️</div>
                                    Easy Setup
                                </h2>
                                <p className='text-sm font-[roboto]'>Turn your old mobile or laptop into a powerful personal NAS in minutes.</p>
                            </div>
                        </div>

                        {/* Card 8 */}
                        <div className="card bg-base-200 w-80 shadow-md">
                            <div className="card-body">
                                <h2 className="card-title">
                                    <div className="badge badge-secondary font-[poppins] text-lg">☁️</div>
                                    Cloud-Free
                                </h2>
                                <p className='text-sm font-[roboto]'> No subscriptions. No surveillance. No hidden costs. Total privacy and freedom.</p>
                            </div>
                        </div>
                    </div>

                    {/* Button */}
                    <div className='mt-5 mb-10 flex justify-center items-center'>
                        <button className="mt-6 btn btn-secondary">🚀 Launch LiteBox</button>
                    </div>
                </div>

                {/* Footer */}
                <footer className="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4">
                    <aside>
                        <p>© {new Date().getFullYear()} LiteBox - All rights reserved</p>
                    </aside>
                </footer>
            </div>
        </>
    )
}

export default IndexPage
