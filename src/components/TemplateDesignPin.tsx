import React, { useState } from 'react'
import type { TemplateData } from '../models/model'
import { AnimatePresence, motion } from 'framer-motion';
import { fadeInOutWithOpacity, scaleInOut } from '../animation';
import { BiFolderPlus, BiHeart, BiSolidFolderPlus, BiSolidHeart } from 'react-icons/bi';
import type { IconType } from 'react-icons';
import useUser from '../hooks/useUser';
import { saveToCollections, saveToFavourites } from '../api';
import useTemplates from '../hooks/useTemplates';
import { useNavigate } from 'react-router-dom';

import useSavedResumes from '../hooks/useSavedResumes';
import {  MdArrowForwardIos } from 'react-icons/md';

interface iProps {
    data: TemplateData;
    index: number

}
interface innerBoxCardProps {
    label: string;
    Icon: IconType;
    onHandle: (e: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => void;
}
const TemplateDesignPin = ({ data, index }: iProps) => {

    const [isHovered, setIsHovered] = useState(false);

    const { data: user, refetch } = useUser();
    const { refetch: templatesRefetch } = useTemplates();
    const { data: savedResumes } = useSavedResumes();

    const navigate = useNavigate();

    const addToCollection = async (e: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
        e.stopPropagation();        // if stop propagation is not added, then the click event will bubble up to the parent div and navigate to the details page as the parent div has an onClick event which navigates to the resumedetails page
        await saveToCollections(user, data);
        refetch();
    }

    const addToFavourites = async (e: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
        e.stopPropagation();
        await saveToFavourites(user, data);
        templatesRefetch();
    }

    // useEffect(() => {

    // }, []);

    return (
        <motion.div
            key={data._id}
            {...scaleInOut(index)}
            transition={{ delay: index * 0.3, ease: "easeInOut" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className='group'
        >
            <div className="w-full h-[500px] 2xl:h-[740px] rounded-md bg-gray-200 overflow-hidden relative ring-3 ring-slate-200 hover:ring-indigo-300 ">
                <img src={data.imageUrl} className='w-full h-full rounded-xl  object-cover' />
                {isHovered &&
                    <AnimatePresence >
                        <motion.div
                            {...fadeInOutWithOpacity}
                            className='absolute inset-0  bg-[rgba(0,0,0,0.4)] flex flex-col justify-between px-4 py-3 z-30 cursor-pointer'
                            onClick={() => navigate(`/resumeDetails/${data._id}`, { replace: true })}
                        >
                            <div className='flex flex-col items-end justify-start w-full gap-8'>
                                {!!savedResumes?.find(res => res.resume_id.split('-')[0] === data.name) && <span className="absolute left-4 top-4 z-10 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-800 shadow-sm">
                                    In progress
                                </span>}
                                <InnerBoxCard
                                    label={user?.collections?.includes(data._id) ? "Added to collections" : "Add to collections"}
                                    Icon={user?.collections?.includes(data._id) ? BiSolidFolderPlus : BiFolderPlus}
                                    onHandle={addToCollection} />
                                <InnerBoxCard
                                    label={user && data.favourites?.includes(user?.uid) ? "Added to favourites" : "Add to favourites"}
                                    Icon={user && data.favourites?.includes(user?.uid) ? BiSolidHeart : BiHeart}
                                    onHandle={addToFavourites} />
                            </div>
                            <div className='flex items-center justify-between px-3 py-4 rounded-lg w-full  mb-7 relative border-2 bg-indigo-50 text-indigo-600 '>
                                <p className='text-sm 2xl:text-base '>
                                    {!!savedResumes?.find(res => res.resume_id.split('-')[0] === data.name) ? 'Continue editing your resume' : 'Start with this template'}
                                </p>
                                <MdArrowForwardIos className=' font-semibold text-lg' />
                            </div>
                        </motion.div>
                    </AnimatePresence>
                }
            </div>
            <div className='mt-3 px-2   '>
                <p className='text-slate-900 font-semibold font-display text-xl transition-colors group-hover:text-indigo-600'>{data.title}</p>
            </div>
        </motion.div >
    )
}

const InnerBoxCard = ({ label, Icon, onHandle }: innerBoxCardProps) => {

    const [showLabel, setshowLabel] = useState(false);
    return (
        <div onClick={e => onHandle(e)}
            className='w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center hover:shadow-md  relative'
            onMouseEnter={() => setshowLabel(true)}
            onMouseLeave={() => setshowLabel(false)}
        >
            <Icon className='text-gray-400 text-xl' />
            {showLabel &&
                <AnimatePresence >
                    <motion.div
                        className='px-2 py-3 rounded-md bg-gray-200 absolute -left-40
                        after:w-2 after:h-2 after:bg-gray-200 after:absolute after:-right-1 after:top-[14px] after:rotate-45 after:translate-y-1/2'
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.4 }}
                    >
                        <p className='whitespace-nowrap text-gray-500 text-sm'>{label}</p>
                    </motion.div>
                </AnimatePresence>}
        </div>
    )
}

export default TemplateDesignPin;