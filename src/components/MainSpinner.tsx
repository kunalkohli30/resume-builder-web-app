import React from 'react'
import { PuffLoader } from 'react-spinners'

const MainSpinner = () => {
    return (
        <div className='h-screen w-screen flex justify-center items-center'>
            <PuffLoader color='#498FCD' size={80}/>
        </div>
    )
}

export default MainSpinner