import React from 'react'
import Router from './router/Router'
import { Toaster } from 'react-hot-toast'


function App() {
    return (
        <>
            <Router />
            <Toaster />
        </>
    )
}

export default App