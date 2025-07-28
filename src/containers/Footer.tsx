import React from 'react'
import { Logo } from '../assets'
import { Link } from 'react-router-dom'


const Footer = () => {
    return (
        <div className='w-full flex justify-between items-center border-t border-gray-300'>
            <div className='flex items-center justify-between gap-3 py-3'>
                <img src={Logo} alt="Logo" className='w-8 h-auto object-contain' />
                <p> Expressume</p>
            </div>
            <div className='flex justify-center items-center gap-3'>
                <Link to={"/"} className='text-blue-700 text-sm font-semibold'>Home</Link>
                <Link to={"/"} className='text-blue-700 text-sm font-semibold'>Contact</Link>
                <Link to={"/"} className='text-blue-700 text-sm whitespace-nowrap font-semibold'>Privacy Policy</Link>
            </div>
        </div>
    )
}

export default Footer