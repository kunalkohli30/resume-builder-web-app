import React, { useState } from 'react'
import useUser from '../hooks/useUser';
import { Logo } from '../assets'
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { PuffLoader } from 'react-spinners';
import { fadeInOutWithOpacity, slideMenuFromUpToDown } from '../animation';
import { auth } from '../config/firebaseConfig';
import { useQueryClient } from 'react-query';
import { adminIds } from '../utils/helpers';

const Header = () => {
    const { data, isError, isLoading, refetch } = useUser();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const queryClient = useQueryClient();
    const signout = () => {
        auth.signOut().then(() => {
            queryClient.setQueryData('user', null);
        });
    }

    return (
        <header className='w-full flex items-center justify-between px-4 py-3 lg:px-8 border-b
            border-gray-300 bg-bgPrimary z-50 gap-12 sticky top-0'>

            {/* logo */}
            <Link to="/">
                <img src={Logo} className='w-12 h-auto object-contain' />
            </Link>

            {/* input */}
            <div className="w-full border-gray-300 px-4 py-1 rounded-md flex items-center justify-between bg-gray-200">
                <input type='text' placeholder='Search here...' className='flex-1 h-10 bg-transparent text-base font-semibold outline-none border-none rounded-lg' />
            </div>

            {/* profile */}
            {/* show loader until profile data is being loaded from useUser hook(react query) */}
            <AnimatePresence>
                {isLoading ? (
                    <PuffLoader color='#498FCD' size={40} />
                ) : (
                    <>
                        {data ? (
                            // show profile image or initials if image is not available 
                            <motion.div {...fadeInOutWithOpacity} className='relative group ' onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                {data?.photoURL ? (
                                    <div className='w-12 h-12 overflow-hidden flex items-center justify-center cursor-pointer'>
                                        <img src={data.photoURL} referrerPolicy='no-referrer' alt="Profile" className='w-full h-full rounded-full object-cover' />
                                    </div>
                                ) : (
                                    <div className='w-12 h-12 flex items-center justify-center cursor-pointer bg-blue-700 rounded-full'>
                                        <p className='text-white text-2xl'>{data?.displayName?.charAt(0).toUpperCase()}</p>
                                    </div>
                                )}

                                {/* dropdown menu */}
                                <AnimatePresence>
                                    {isMenuOpen && <motion.div
                                        {...slideMenuFromUpToDown}
                                        onMouseLeave={() => setIsMenuOpen(false)}
                                        className="absolute  px-4 py-3 rounded-md bg-white right-0 top-14 flex flex-col items-center justify-start gap-3 w-64 pt-12 pb-6"
                                    >
                                        {data?.photoURL ? (
                                            <div className='w-20 h-20  flex items-center justify-center '>
                                                <img src={data.photoURL} referrerPolicy='no-referrer' alt="Profile" className='w-full h-full rounded-full object-cover' />
                                            </div>
                                        ) : (
                                            <div className='w-20 h-20 flex items-center justify-center  bg-blue-700 rounded-full'>
                                                <p className='text-white text-3xl'>{data?.displayName?.charAt(0).toUpperCase()}</p>
                                            </div>
                                        )}
                                        <p className='text-lg font-semibold text-txtDark'>{data?.displayName}</p>
                                        {/* menus */}
                                        <div className="w-full flex flex-col items-start gap-8 pt-6 pl-3">
                                            <Link to="/profile" className='w-full text-left text-base font-semibold text-txtDark hover:text-blue-700 transition-all duration-200 whitespace-nowrap'>Profile</Link>
                                            { adminIds.includes(data?.uid) &&
                                                <Link to="/template/create" className='w-full text-left text-base font-semibold text-txtDark hover:text-blue-700 transition-all duration-200 whitespace-nowrap'>Add New Template</Link>
                                            }
                                            <button onClick={signout} className='w-full text-left text-base font-semibold text-txtDark hover:text-blue-700 transition-all duration-200 cursor-pointer'>Logout</button>
                                        </div>
                                    </motion.div>
                                    }
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            <Link to="/auth">
                                <motion.button
                                    className='px-4 py-2 rounded-md border-gray-300 bg-gray-200 hover:shadow-md active:scale-95 duration-150 font-semibold'
                                    {...fadeInOutWithOpacity}
                                >
                                    Login
                                </motion.button>
                            </Link>
                        )}
                    </>
                )}
            </AnimatePresence>
        </header>
    )
}

export default Header