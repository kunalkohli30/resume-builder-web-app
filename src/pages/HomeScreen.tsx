import React, { Suspense } from 'react'
import Header from '../components/Header'
import { MainSpinner } from '../components'
import { Outlet, Route, Routes } from 'react-router-dom'
import { HomeContainer } from '../containers'
import { CreateTemplate } from '../pages'

const HomeScreen = () => {
    return (
        <div className='w-full flex flex-col items-center justify-center'>
            {/* Header */}
            <Header />

            {/* Main content */}
            <main className='w-full'>
                <Suspense fallback={<MainSpinner />} >
                    <Outlet />
                </Suspense>
            </main>

        </div>
    )
}

export default HomeScreen