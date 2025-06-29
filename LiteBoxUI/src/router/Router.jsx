import React from 'react'
import { Routes, Route } from "react-router-dom"
import IndexPage from '../pages/IndexPage/IndexPage'
import HomePage from '../pages/HomePage/HomePage'
import PageNotFound from '../pages/PageNotFound/PageNotFound'



function Router() {
    return (
        <Routes>
            <Route path='/' element={<IndexPage />} />
            <Route path='/home' element={<HomePage />} />
            <Route path='*' element={<PageNotFound />} />
        </Routes>
    )
}

export default Router