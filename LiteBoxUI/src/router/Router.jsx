import React from 'react'
import { Routes, Route } from "react-router-dom"
import IndexPage from '../pages/IndexPage/IndexPage'
import HomePage from '../pages/HomePage/HomePage'



function Router() {
    return (
        <Routes>
            <Route path='/' element={<IndexPage />} />
            <Route path='/home' element={<HomePage />} />
        </Routes>
    )
}

export default Router