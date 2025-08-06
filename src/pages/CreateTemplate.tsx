import React, { useEffect, useState } from 'react'
import { type imageAssetData, type createTemplateFormData, type templateData } from '../models/model';
import { PuffLoader } from 'react-spinners';
import { FaTrash, FaUpload } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import { db, storage } from '../config/firebaseConfig';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { adminIds, initialTags } from '../utils/helpers';
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import useTemplates from '../hooks/useTemplates';
import { data, replace, useNavigate } from 'react-router-dom';
import useUser from '../hooks/useUser';
const CreateTemplate = () => {

    const [formData, setFormData] = useState<createTemplateFormData>({ title: '', imageUrl: '' });
    const [imageAsset, setImageAsset] = useState<imageAssetData>({
        isImageLoading: false,
        uri: null,
        progress: 0
    });
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const { data: templatesData, isError: templatesError, isLoading: templatesIsLoading, refetch: templatesRefetch } = useTemplates();
    const { data, isLoading } = useUser();

    const navigate = useNavigate();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImageAsset(prev => ({ ...prev, isImageLoading: true }));
        const file = e.target.files?.[0];

        if (file && isAllowed(file)) {
            const storageRef = ref(storage, `Templates/${Date.now()}-${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                'state_changed',
                (snapshot) => setImageAsset(prev => ({ ...prev, progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100 })),      // to check the progress of upload
                (err) => {                                                                                                                  // in case error occurs
                    if (err.message.includes('storage/unauthorized'))
                        toast.error('Error: authorization revoke')
                    else
                        toast.error('Error while uploading image')
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {                     // to get the download url of uploaded image
                        setImageAsset((prev) => ({ ...prev, uri: downloadURL }));
                    })
                    toast.success('Image uploaded successfully');
                    setTimeout(() => {
                        setImageAsset(prev => ({ ...prev, isImageLoading: false })); // reset the image asset state after 2 seconds
                    }, 2000);
                }
            );
        } else {
            toast.info('Please select a valid image file (jpeg, jpg, png)');
        }
    }



    const isAllowed = (file: File) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        return allowedTypes.includes(file.type);
    }

    const deleteImageObject = async () => {
        setImageAsset(prev => ({ ...prev, isImageLoading: true }));     //loading is set to true while deleting the image
        const deleteRef = ref(storage, imageAsset?.uri ?? undefined);
        deleteObject(deleteRef).then(() => {
            toast.success('Image removed');
            setTimeout(() => {
                setImageAsset({ uri: null, progress: 0, isImageLoading: false }); // reset the image asset state after 2 seconds
            }, 2000);
        })
    }

    const pushToCloud = async () => {
        console.log('pushtocloud')
        const timestamp = serverTimestamp();
        const id = `${Date.now()}`
        const _doc = {
            _id: id,
            title: formData.title,
            imageUrl: imageAsset.uri,
            tags: selectedTags,
            name: templatesData && templatesData?.length > 0 ? `Template${templatesData.length + 1}` : `Template1`,
            timestamp: timestamp
        }
        console.log(_doc);
        await setDoc(doc(db, "templates", id), _doc).then(() => {
            setFormData({ title: '', imageUrl: '' });
            setImageAsset((prev) => ({ ...prev, uri: null }));
            setSelectedTags([]);
            templatesRefetch();
            toast.success('Template created successfully');
        }).catch((err) => {
            console.error('Error while creating template:', err);
            toast.error('Error while creating template');
        });
    }

    const handleSelectTags = (tag: string) => {
        // if tag is already selected, remove it from selectedTags, else add it
        if (selectedTags.includes(tag))
            setSelectedTags(prev => prev.filter(t => t !== tag));
        else
            setSelectedTags(prev => [...prev, tag]);
    }

    // to remove the template from the cloud
    const removeTemplate = async (template: templateData) => {
        const deleteRef = ref(storage, template.imageUrl);
        await deleteObject(deleteRef).then(async () => {
            await deleteDoc(doc(db, "templates", template._id)).then(() => {
                toast.success('Template deleted successfully');
                templatesRefetch();
            }).catch((err) => {
                toast.error(`Error: ${err.message}`)
            });
        })
    }

    useEffect(() => {
        if (data && !isLoading && !adminIds.includes(data.uid)) {
            navigate('/', { replace: true }); // redirect to home page if user is not admin
        }
    }, [])

    return (
        <div className='w-full px-4 lg:px-10 2xl:px-32 py-4 grid grid-cols-1 lg:grid-cols-12'>


            {/* Left container */}
            <div className='col-span-12 lg:col-span-4  2xl:col-span-3 w-full flex flex-1 justify-start items-center flex-col gap-4 px-2'>
                <div>
                    <p className='text-lg text-txtPrimary'> Create a new template</p>
                </div>

                {/* Template id section */}
                <div className='w-full flex items-center justify-end'>
                    <p className='text-base text-txtLight uppercase font-semibold'>
                        Temp ID: {templatesData && templatesData?.length > 0 ? `TEMPLATE${templatesData.length + 1}` : `TEMPLATE1`}
                    </p>
                </div>

                {/* Template title section */}
                <input type='text' placeholder='Template title' value={formData.title}
                    className='px-4 w-full py-3 rounded-md bg-transparent border border-gray-300 text-lg text-txtPrimary focus:text-txtDark focus:shadow-md outline-none'
                    onChange={e => setFormData(prevVal => ({ ...prevVal, title: e.target.value }))}
                />

                {/* File Uploader */}
                <div className="w-full backdrop-blur-md h-[420px] lg:h-[620px] 2xl:h-[720px] border border-gray-300 flex items-center justify-center">
                    {
                        imageAsset.isImageLoading ? (
                            <>
                                <div className='flex flex-col items-center justify-center gap-4'>
                                    <PuffLoader color='#498FCD' size={40} />
                                    <p>{imageAsset?.progress.toFixed(2)}%</p>
                                </div>
                            </>
                        ) : (
                            <>
                                {!imageAsset.uri ? (
                                    <>
                                        <label className='w-full cursor-pointer h-full'>
                                            <div className='flex  items-center justify-center h-full w-full'>
                                                <div className='flex flex-col items-center justify-center gap-4'>
                                                    <FaUpload className='text-2xl ' />
                                                    <p className='text-txtLight text-lg font-semibold'>Click to upload image</p>
                                                </div>
                                            </div>
                                            <input type='file' className='w-0 h-0 ' accept='.jpeg, .jpg, .png' onChange={handleFileSelect} />
                                        </label>
                                    </>
                                ) : (
                                    <>
                                        <div className='w-full h-full overflow-hidden relative rounded-md'>
                                            <img src={imageAsset.uri} className='w-full h-full object-cover' alt="Uploaded Template" loading='lazy' />
                                            {/* Delete action */}
                                            <div
                                                className='absolute top-4 right-4 w-8 h-8 bg-red-500 flex justify-center items-center rounded-lg cursor-pointer hover:bg-red-600 active:scale-90 hover:scale-110 duration-150'
                                                onClick={deleteImageObject}
                                            >
                                                <FaTrash className='text-white' />
                                            </div>
                                        </div>

                                    </>
                                )}

                            </>
                        )
                    }
                </div>

                {/* Tags section */}
                <div className="w-full flex items-cemter flex-wrap gap-2 mt-4">
                    {initialTags.map((tag, index) => (
                        <div key={index} onClick={() => handleSelectTags(tag)}
                            className={`py-2 px-3 border border-gray-300 rounded-2xl cursor-pointer text-sm font-semibold 
                                ${selectedTags.includes(tag) ? 'bg-blue-500 text-white ' : ''}`}
                        >
                            <p> {tag}</p>
                        </div>
                    ))}
                </div>

                {/* Submit button */}
                <button className='w-full bg-blue-700 text-white rounded-md py-3 cursor-pointer' onClick={pushToCloud}>
                    Save
                </button>
            </div>

            {/* Right container */}
            <div className='col-span-12 lg:col-span-8 2xl:col-span-9 px-2 w-full flex-1'>
                {templatesIsLoading ? (
                    <>
                        <div className='flex  items-center justify-center w-full h-screen'>
                            <PuffLoader color='#498FCD' size={40} />
                            {/* <p>{imageAsset?.progress.toFixed(2)}%</p> */}
                        </div>
                    </>
                ) : (
                    <>
                        {templatesData && templatesData?.length > 0 ? (
                            <>
                                <div className='w-full h-full grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4'>
                                    {templatesData.map((template) => (
                                        <div key={template._id} className='relative w-full h-[500px] rounded-md overflow-hidden'>
                                            <img src={template.imageUrl} className='w-full h-full object-contain' />
                                            <div
                                                className='absolute top-4 right-4 w-8 h-8 bg-red-500 flex justify-center items-center rounded-lg cursor-pointer hover:bg-red-600 active:scale-90 hover:scale-110 duration-150'
                                                onClick={() => removeTemplate(template)}
                                            >
                                                <FaTrash className='text-white' />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className='flex  flex-col items-center justify-center w-full h-screen gap-2'>
                                    <PuffLoader color='#498FCD' size={40} />
                                    <p>{imageAsset?.progress.toFixed(2)}%</p>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div >
    )
}

export default CreateTemplate