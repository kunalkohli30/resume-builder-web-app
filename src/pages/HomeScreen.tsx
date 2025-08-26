import { Suspense } from 'react'
import Header from '../components/Header'
import { MainSpinner } from '../components'
import { Outlet } from 'react-router-dom'


const HomeScreen = () => {
    return (
        <div className='w-full flex flex-col items-center justify-center bg-slate-200 min-h-screen relative'>
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