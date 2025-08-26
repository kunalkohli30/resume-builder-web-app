import React from 'react'
import { useQuery } from 'react-query';
import {  Link, useParams } from 'react-router-dom'
import { getTemplateDetails, saveToCollections, saveToFavourites } from '../api';
import { toast } from 'react-toastify';
import { MainSpinner, TemplateDesignPin } from '../components';
import { FaHouse } from 'react-icons/fa6';
import { BiFolderPlus, BiHeart, BiSolidFolderPlus, BiSolidHeart } from 'react-icons/bi';
import useUser from '../hooks/useUser';
import useTemplates from '../hooks/useTemplates';
import { AnimatePresence } from 'framer-motion';

const TemplateDesign = () => {

    const { templateId } = useParams();
    const { data: user, refetch: userRefetch } = useUser();
    const { data: templates } = useTemplates();
    const { data, isLoading, isError, refetch: templatesRefetch } = useQuery(
        ["template", templateId],
        async () => {
            try {
                return await getTemplateDetails(templateId);
            } catch (error: any) {
                console.log('error occurred while fetching template details from firestore: ', error.message);
                toast.error('Template not found');
            }
        }
    )

    const addToCollection = async (e: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
        e.stopPropagation();        // if stop propagation is not added, then the click event will bubble up to the parent div and navigate to the details page as the parent div has an onClick event which navigates to the resumedetails page
        if (data) {
            await saveToCollections(user, data);
            userRefetch();
        }
    }

    const addToFavourites = async () => {
        if (data) {
            await saveToFavourites(user, data);
            templatesRefetch();
        }
    }

    if (isLoading)
        return <MainSpinner />;

    if (isError || !data) {
        return (
            <div className='w-full h-[60vh] flex flex-col items-center justify-center'>
                <p className='text-lg text-gray-600 font-semibold'>Error while fetching the data... Please try again later</p>
            </div>
        )
    }

    return (
        <div className='w-full  flex flex-col items-center justify-start px-4 py-12'>

            {/* Bread crumb */}
            <div className='w-full flex items-center pb-8 gap-2'>
                <Link to="/" className="flex gap-2 items-center text-gray-600">
                    <FaHouse /> Home
                </Link>
                <p>/</p>
                <p className='font-semibold'>{data?.name}</p>
            </div>

            {/* Main template design screen layout  */}
            <div className='grid grid-cols-1 lg:grid-cols-12 w-full'>

                {/* Left section */}
                <div className='col-span-1 lg:col-span-8 flex flex-col items-start justify-start gap-4'>

                    {/* Load the template image*/}
                    <img src={data?.imageUrl} className='w-full h-auto object-contain rounded-xl' />

                    {/* Title section */}
                    <div className='w-full flex flex-col gap-2'>
                        <div className='w-full flex items-center justify-between '>
                            {/* title */}
                            <p className='font-semibold text-gray-600 '>{data?.title}</p>
                            {/* likes */}
                            {data?.favourites?.length ?
                                (
                                    <div className="flex items-center justify-center gap-1 text-xl font-semibold">
                                        <BiSolidHeart className='text-red-500' />
                                        <p>{data?.favourites?.length ?? ""} likes</p>
                                    </div>
                                ) : ""
                            }

                        </div>

                        {/* Collection favourite options */}
                        <div className='flex gap-4'>
                            {user &&
                                <div className='flex items-center  gap-3'>
                                    {user?.collections?.includes(data?._id) ? (
                                        <>
                                            <div
                                                onClick={addToCollection}
                                                className='flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 gap-2 hover:bg-gray-200 cursor-pointer '>
                                                <BiSolidFolderPlus className='text-gray-600' />
                                                <p className='text-sm text-gray-600 whitespace-nowrap'>Remove from collections</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div
                                                onClick={addToCollection}
                                                className='flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 gap-2 hover:bg-gray-200 cursor-pointer '>
                                                <BiFolderPlus className='text-gray-600' />
                                                <p className='text-sm text-gray-600 whitespace-nowrap'>Add to  collections</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            }
                            {user &&
                                <div className='flex items-center  gap-3'>
                                    {data?.favourites?.includes(data?._id) ? (
                                        <>
                                            <div
                                                onClick={addToFavourites}
                                                className='flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 gap-2 hover:bg-gray-200 cursor-pointer '>
                                                <BiSolidHeart className='text-gray-600' />
                                                <p className='text-sm text-gray-600 whitespace-nowrap'>Remove from favourites</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div
                                                onClick={addToFavourites}
                                                className='flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 gap-2 hover:bg-gray-200 cursor-pointer '>
                                                <BiHeart className='text-gray-600' />
                                                <p className='text-sm text-gray-600 whitespace-nowrap'>Add to  favourites</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            }
                        </div>
                    </div>
                </div>

                {/* Right section */}
                <div className='col-span-1 lg:col-span-4 w-full flex flex-col items-center justify-start px-3 gap-6'>

                    {/* Discover more section */}
                    <div className='w-full h-72 bg-blue-200 rounded-md overflow-hidden relative'
                        style={{
                            background: "url(https://cdn.pixabay.com/photo/2017/09/25/17/25/chart-2785920_1280.jpg)", backgroundPosition: "center",
                            backgroundSize: "cover"
                        }}
                    >
                        <div className='absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.4)]'>
                            <Link to={"/"} className='px-4 py-2 rounded-md border-2 border-gray-50 text-white'>
                                Discover More
                            </Link>
                        </div>

                    </div>

                    {/* edit the template */}
                    {/* localhost:3000/resume/professional/1233445 */}
                    {user && (
                        <Link
                            to={`/resume/${data?.name}?templateId=${templateId}`}
                            className='w-full px-4 py-3 rounded-md flex items-center justify-center bg-emerald-500 cursor-pointer'
                        >
                            <p className='text-white font-semibold text-lg'>Edit this template</p>
                        </Link>
                    )}

                    {/* Tags */}
                    <div className='w-full flex items-center justify-start flex-wrap gap-2'>
                        {data.tags.map((tag, index) => (
                            <p className='px-2 py-1 text-xs border border-gray-300 rounded-md whitespace-nowrap'
                                key={index}>
                                {tag}
                            </p>
                        ))}
                    </div>
                </div>
            </div>

            {/* similar templates */}
            {templates && (
                <div className='w-full py-8 flex flex-col items-start justify-start gap-4'>
                    <p className='text-lg font-semibold text-gray-800 '>
                        You might also like
                    </p>

                    <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3'>

                        <AnimatePresence>
                            {templates.filter((templ) => templ._id !== templateId).map((template, index) => (
                                <TemplateDesignPin key={template._id} data={template} index={index} />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )
            }
        </div>
    )
}

export default TemplateDesign