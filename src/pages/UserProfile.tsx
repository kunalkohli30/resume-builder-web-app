import { useEffect, useState } from 'react'
import useUser from '../hooks/useUser'
import { motion, AnimatePresence } from 'framer-motion';
import useTemplates from '../hooks/useTemplates';
import { TemplateDesignPin } from '../components';
import type { ResumeData, TemplateData } from '../models/model';
import { Link, useNavigate } from 'react-router-dom';
import { NoData } from '../assets';
import { fadeInOutWithOpacity, scaleInOut } from '../animation';
import { getSavedResumes } from '../api';
import { useQuery } from 'react-query';

const UserProfile = () => {

    const navigate = useNavigate();

    const { data: user, isLoading: userIsLoading } = useUser();
    const { data: templates } = useTemplates();

    const [activeTab, setActiveTab] = useState<'collections' | 'resumes'>('collections');

    const { data: savedResumes } = useQuery<ResumeData[]>(
        "savedResumes",
        async () => getSavedResumes(user?.uid),
        // to ensure that getSavedResumes runs after user data is fetched
        {
            enabled: !!user?.uid && !userIsLoading,   // 💡 wait until user is ready
            refetchOnWindowFocus: false,
        }
    )

    // Get all the templates for the template ids present in user.collections
    const collectionTemplates = user?.collections?.length ?
        user?.collections.map(userTempId => templates?.find(templates => userTempId === templates._id))
            .filter(template => !!template)
        : undefined;

    useEffect(() => {
        if (!userIsLoading && !user)
            navigate("/auth", { replace: true });
    }, [])

    return (
        <div className='w-full flex flex-col items-center justify-start py-12'>
            {/* Top image, name and buttons */}
            <div className='w-full  '>
                <img src="https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    className='w-full object-cover h-72'
                />
                <div className="w-full -mt-10  flex items-center justify-center flex-col gap-4">
                    {/* user pic */}
                    {user?.photoURL ? (
                        <div className='  w-full flex items-center justify-center '>
                            <img src={user.photoURL} referrerPolicy='no-referrer' alt="Profile" className='w-24 h-24 rounded-full object-cover' />
                        </div>
                    ) : (
                        <>
                            <div className=' w-full flex items-center justify-center'>
                                <img src='https://cdn.pixabay.com/photo/2017/07/18/23/23/user-2517433_1280.png' className='w-24 h-24 rounded-full object-cover' />
                            </div>
                        </>
                    )}
                    {/* name */}
                    <p className='text-4xl text-txtDark font-bold font-mooli'>{user?.displayName}</p>
                </div>

                {/* tabs */}
                <div className='flex items-center justify-center mt-12 gap-1'>
                    <div className={`px-4 py-2 flex items-center justify-center gap-2 group cursor-pointer  font-cabin rounded-2xl text-xl 
                        ${activeTab === 'collections' && 'bg-white shadow-md text-blue-600 scale-110'}`}
                        onClick={() => setActiveTab('collections')}
                    >
                        <p>Collections</p>
                    </div>
                    <div className={`px-4 py-2 flex items-center justify-center gap-2 group cursor-pointer  font-cabin rounded-2xl text-xl 
                        ${activeTab === 'resumes' && 'bg-white shadow-md text-blue-600 scale-110'}`}
                        onClick={() => setActiveTab('resumes')}
                    >
                        <p>My Resumes</p>
                    </div>
                </div>
            </div>
            <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 px-12 py-6 gap-6 mt-16'>
                <AnimatePresence>
                    {activeTab === "collections" && (
                        <>
                            {
                                collectionTemplates && collectionTemplates?.length > 0 ? (
                                    <RenderTemplateWithAnimation templates={collectionTemplates} />
                                ) : (
                                    <AnimatePresence >
                                        <motion.div {...fadeInOutWithOpacity} className='col-span-12 w-full flex flex-col items-center justify-center gap-3'>
                                            <img src={NoData} className='w-32 h-auto object-contain' />
                                            <p className='mt-2 font-semibold text-xl'>No Data</p>
                                        </motion.div>
                                    </AnimatePresence>
                                )

                            }
                        </>
                    )}
                    {activeTab === "resumes" && (
                        <AnimatePresence>
                            {
                                savedResumes && savedResumes?.length > 0 ?
                                    savedResumes.map((savedRes, index) => (
                                        <motion.div
                                            key={savedRes._id}
                                            {...scaleInOut(index)}
                                            transition={{ease: 'easeInOut'}}
                                        >
                                            <Link to={`/resume/${savedRes.resume_id.split('-')[0]}`}>
                                                <img src={savedResumes[0]?.imageURL ?? ''} />
                                            </Link>
                                        </motion.div>
                                    )) : (
                                        <AnimatePresence >
                                            <motion.div {...fadeInOutWithOpacity} className='col-span-12 w-full flex flex-col items-center justify-center gap-3'>
                                                <img src={NoData} className='w-32 h-auto object-contain' />
                                                <p className='mt-2 font-semibold text-xl'>No Data</p>
                                            </motion.div>
                                        </AnimatePresence>
                                    )

                            }
                        </AnimatePresence>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
};

const RenderTemplateWithAnimation = ({ templates }: { templates: TemplateData[] | undefined }) => {
    return (
        <>
            {templates && templates.length ? (
                <>
                    <AnimatePresence>
                        {templates.map((template, index) => (
                            <TemplateDesignPin key={template._id} data={template} index={index} />
                        ))}
                    </AnimatePresence>
                </>
            ) : (
                <>
                    <p>No data found</p>
                </>
            )}
        </>
    )
}

export default UserProfile