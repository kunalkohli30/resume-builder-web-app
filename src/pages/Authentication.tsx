import { useEffect } from 'react'
import { Logo } from '../assets'
import { Footer } from '../containers'
import { AuthButtonWithProvider, MainSpinner } from '../components'
import { FaGoogle, FaGithub } from 'react-icons/fa6'
import useUser from '../hooks/useUser'
import { useNavigate } from 'react-router-dom'
import {motion} from 'framer-motion';
import { fadeInOutWithOpacity } from '../animation'

const Authentication = () => {

    const {data, isLoading} = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        console.log('useffect running', data, isLoading);
        if(!isLoading && data) 
            navigate('/', {replace: true});     
    }, [data, isLoading])

    if(isLoading)
        return <MainSpinner />
    else if(!isLoading && data) {
        return null;
    }
    return (
        <motion.div {...fadeInOutWithOpacity} className='auth-section w-screen'>

            {/* Top section */}
            <img src={Logo} alt="Logo" className='w-12 h-auto object-contain' />

            {/*  Main section */}
            <div className="w-full flex flex-1 flex-col items-center justify-center gap-6">
                <h1 className='text-3xl lg:text-4xl text-blue-700 '>Welcome to Expressume</h1>
                <p className='text-base text-gray-600 '>express way to create resume</p>
                <h2 className='text-2xl text-gray-600'>Authenticate</h2>
                <div className='w-full lg:w-96 rounded-md  p-2 flex flex-col items-center justify-start gap-6'>
                    <AuthButtonWithProvider Icon={FaGoogle} label={'Signin with Google'} provider={"GoogleAuthProvider"}/>
                    <AuthButtonWithProvider Icon={FaGithub} label={'Signin with Github'} provider={"GithubAuthProvider"}/>

                </div>
            </div>

            {/* Footer section */}
            <Footer />
        </motion.div>
    )
}

export default Authentication