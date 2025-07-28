import React from 'react'
import type { IconType } from 'react-icons'
import { FaChevronRight } from 'react-icons/fa6'
import { GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { getUserDetails } from '../api';
import useUser from '../hooks/useUser';
type iProps = {
    Icon: IconType,
    label: string,
    provider: 'GoogleAuthProvider' | 'GithubAuthProvider'
}
const AuthButtonWithProvider = ({ Icon, label, provider }: iProps) => {

    const googleAuthProvider = new GoogleAuthProvider();
    const githubAuthProvider = new GithubAuthProvider();

    const { refetch } = useUser();

    const handleClick = async () => {
        console.log("API KEY:", import.meta.env.VITE_APP_API_KEY);
        switch (provider) {
            case "GoogleAuthProvider":
                console.log('Google auth clicked');
                await signInWithPopup(auth, googleAuthProvider).then((result) => {
                    refetch();
                    console.log('Google auth successful', result);
                }).catch((error) => {
                    console.error('Google auth error', error);
                });
                break;
            case "GithubAuthProvider":
                console.log('Github auth clicked');
                await signInWithPopup(auth, githubAuthProvider).then((result) => {
                    refetch();
                    console.log('Github auth successful', result);
                }).catch((error) => {
                    console.error('Github auth error', error);
                });
                break;
        }
    }

    return (
        <div className='w-full px-4 py-3 rounded-lg border-2 border-blue-700
            flex items-center justify-between cursor-pointer group hover:bg-blue-700
            active:scale-95 duration-150 hover:shadow-md hover:text-white'
            onClick={handleClick}
        >
            <Icon className='text-txtPrimary text-xl' />
            <p>{label}</p>
            <FaChevronRight className='text-txtPrimary text-base' />
        </div>
    )
}

export default AuthButtonWithProvider