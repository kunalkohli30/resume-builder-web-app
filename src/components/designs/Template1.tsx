import React, { useEffect, useRef, useState } from "react";
import MainSpinner from "../MainSpinner";
import { useQuery } from "react-query";
import useUser from "../../hooks/useUser";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { db } from "../../config/firebaseConfig";
import { getTemplateDetailEditByUser } from "../../api";
import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";

import { TemplateOne } from "../../assets";
import {
    FaHouse,
    FaTrash,
    FaPenToSquare,
    FaPencil,
    FaPlus,
} from "react-icons/fa6";
import { BiSolidBookmarks } from "react-icons/bi";
import { BsFiletypePdf, BsFiletypePng, BsFiletypeJpg, BsFiletypeSvg } from "react-icons/bs";

import { AnimatePresence, motion } from "framer-motion";
import type {
    ResumeEducation,
    ResumeExperiences,
    ResumeSkills,
    ResumeData,
} from "../../models/model";
import { fadeInOutWithOpacity, opacityINOut } from "../../animation";

// ---------------------------
// Local types
// ---------------------------
interface FormDataShape {
    fullname: string;
    professionalTitle: string;
    personalDescription: string;
    refererName: string;
    refererRole: string;
    mobile: string;
    email: string;
    website: string;
    address: string;
}

interface ImageAsset {
    isImageLoading: boolean;
    imageURL: string | null; // data URL or real URL
}

type InputChangeEvt = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

const Template1 = () => {
    // ---------------------------
    // Routing & params
    // ---------------------------
    const { pathname, search } = useLocation();
    const navigate = useNavigate();
    const templateName = pathname.split("/").slice(-1)[0] || "Template1";
    const searchParams = new URLSearchParams(search);
    const loadedTemplateId = searchParams.get("templateId");

    // ---------------------------
    // User context
    // ---------------------------
    // We only need uid; keep it minimal for TS.
    const { data: user } = useUser();

    // ---------------------------
    // Local state
    // ---------------------------
    const resumeRef = useRef<HTMLDivElement | null>(null);

    const [isEdit, setIsEdit] = useState<boolean>(false);

    const [imageAsset, setImageAsset] = useState<ImageAsset>({
        isImageLoading: false,
        imageURL: null,
    });

    const [formData, setFormData] = useState<FormDataShape>({
        fullname: "Karen Richards",
        professionalTitle: "Professional Title",
        personalDescription:
            "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Alia minus est culpa id corrupti nobis ullam harum, porro veniam facilis, obcaecati nulla magnam beatae quae at eos! Qui, similique laboriosam?",
        refererName: "Sara Taylore",
        refererRole: "Director | Company Name",
        mobile: "+91 0000-0000",
        email: "urname@gmail.com",
        website: "urwebsite.com",
        address: "your street address, ss, street, city/zip code - 1234",
    });

    const [experiences, setExperiences] = useState<ResumeExperiences[]>([
        {
            year: "2012 - 2014",
            title: "Job Position Here",
            companyAndLocation: "Company Name / Location here",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Corporis voluptatibus minima tenetur nostrum quo aliquam dolorum incidunt.",
        },
        {
            year: "2012 - 2014",
            title: "Job Position Here",
            companyAndLocation: "Company Name / Location here",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Corporis voluptatibus minima tenetur nostrum quo aliquam dolorum incidunt.",
        },
        {
            year: "2012 - 2014",
            title: "Job Position Here",
            companyAndLocation: "Company Name / Location here",
            description:
                "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Corporis voluptatibus minima tenetur nostrum quo aliquam dolorum incidunt.",
        },
    ]);

    const [skills, setSkills] = useState<ResumeSkills[]>([
        { title: "skill1", percentage: "75" },
        { title: "skill2", percentage: "75" },
        { title: "skill3", percentage: "75" },
        { title: "skill4", percentage: "75" },
        { title: "skill5", percentage: "75" },
    ]);

    const [education, setEducation] = useState<ResumeEducation[]>([
        { major: "ENTER YOUR MAJOR", university: "Name of your university / college 2005-2009" },
    ]);

    // ---------------------------
    // Load existing resume (React Query)
    // ---------------------------
    const resumeKey = `${templateName}-${user?.uid ?? "anon"}`;
    const {
        data: resumeDataResp,
        isLoading: resume_isLoading,
        isError: resume_isError,
        refetch: refetch_resumeData,
    } = useQuery<ResumeData | undefined>(
        ["templateEditedByUser", resumeKey],
        () => getTemplateDetailEditByUser(user?.uid, resumeKey) as Promise<ResumeData | undefined>,
        { enabled: Boolean(user?.uid) }
    );

    // if resume data exists for the user with selected template id in firebase datastore, set the details in formData
    useEffect(() => {
        if (!resumeDataResp) return;

        if (resumeDataResp.formData) {
            setFormData({ ...resumeDataResp.formData });
        }
        if (resumeDataResp.experiences) {
            setExperiences(resumeDataResp.experiences);
        }
        if (resumeDataResp.skills) {
            setSkills(resumeDataResp.skills);
        }
        if (resumeDataResp.education) {
            setEducation(resumeDataResp.education);
        }
        if (resumeDataResp.userProfilePic) {
            setImageAsset((prev) => ({ ...prev, imageURL: resumeDataResp.userProfilePic ?? null }));
        }
    }, [resumeDataResp]);

    // ---------------------------
    // Handlers
    // ---------------------------
    const handleChange = (e: InputChangeEvt) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const toggleEditable = () => {
        setIsEdit((prev) => !prev);
    };

    // image upload (data URL in state)
    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setImageAsset((prev) => ({ ...prev, isImageLoading: true }));
        const file = event.target.files?.[0];
        if (!file) {
            setImageAsset((prev) => ({ ...prev, isImageLoading: false }));
            return;
        }
        if (!isAllowed(file)) {
            toast.error("Invalid File Format");
            setImageAsset((prev) => ({ ...prev, isImageLoading: false }));
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev: ProgressEvent<FileReader>) => {
            const result = ev.target?.result;
            if (typeof result === "string") {
                setImageAsset({ isImageLoading: false, imageURL: result });
            } else {
                setImageAsset((prev) => ({ ...prev, isImageLoading: false }));
                toast.error("Failed to read image");
            }
        };
        reader.onerror = () => {
            setImageAsset((prev) => ({ ...prev, isImageLoading: false }));
            toast.error("Failed to load image");
        };
        reader.readAsDataURL(file);
    };

    const isAllowed = (file: File) => {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"] as const;
        return allowedTypes.includes(file.type as (typeof allowedTypes)[number]);
    };

    const deleteImageObject = () => {
        setImageAsset((prev) => ({ ...prev, imageURL: null }));
    };

    const handleExpChange = (index: number, e: InputChangeEvt) => {
        const { name, value } = e.target;
        const key = name as keyof ResumeExperiences;
        setExperiences((prev) => {
            const clone = [...prev];
            clone[index] = { ...clone[index], [key]: value } as ResumeExperiences;
            return clone;
        });
    };

    const removeExperience = (index: number) => {
        setExperiences((prev) => prev.filter((_, i) => i !== index));
    };

    const addExperience = () => {
        setExperiences((prev) => [
            ...prev,
            {
                year: "2012 - 2014",
                title: "Job Position Here",
                companyAndLocation: "Company Name / Location here",
                description:
                    "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Corporis voluptatibus minima tenetur nostrum quo aliquam dolorum incidunt.",
            },
        ]);
    };

    const handleSkillsChange = (index: number, e: InputChangeEvt) => {
        const { name, value } = e.target;
        const key = name as keyof ResumeSkills;
        setSkills((prev) => {
            const clone = [...prev];
            clone[index] = { ...clone[index], [key]: value } as ResumeSkills;
            return clone;
        });
    };

    const removeSkill = (index: number) => {
        setSkills((prev) => prev.filter((_, i) => i !== index));
    };

    const addSkill = () => {
        setSkills((prev) => [...prev, { title: "skill1", percentage: "75" }]);
    };

    const handleEducationChange = (index: number, e: InputChangeEvt) => {
        const { name, value } = e.target;
        const key = name as keyof ResumeEducation;
        setEducation((prev) => {
            const clone = [...prev];
            clone[index] = { ...clone[index], [key]: value } as ResumeEducation;
            return clone;
        });
    };

    const removeEducation = (index: number) => {
        setEducation((prev) => prev.filter((_, i) => i !== index));
    };

    const addEducation = () => {
        setEducation((prev) => [
            ...prev,
            { major: "ENTER YOUR MAJOR", university: "Name of your university / college 2005-2009" },
        ]);
    };

    // ---------------------------
    // Save
    // ---------------------------
    const saveFormData = async () => {
        if (!user?.uid) {
            toast.error("User not available. Please sign in again.");
            return;
        }
        const resume_id = `${templateName}-${user.uid}`;

        const imageURL = await getImage();
        const payload: ResumeData = {
            _id: loadedTemplateId,
            resume_id,
            formData,
            education,
            experiences,
            skills,
            timeStamp: serverTimestamp() as unknown as any, // Firestore FieldValue
            userProfilePic: imageAsset?.imageURL,
            imageURL: imageURL ?? undefined,
        };

        try {
            await setDoc(doc(db, "users", user.uid, "resumes", resume_id), payload);
            toast.success("Data Saved");
            refetch_resumeData();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            toast.error(`Error: ${msg}`);
        }
    };

    // Capture DOM as image (data URL)
    const getImage = async (): Promise<string | null> => {
        const element = resumeRef.current;
        if (!element) {
            console.error("Unable to capture content. The DOM element is null.");
            return null;
        }
        try {
            // Improve quality a bit for exports
            const dataUrl = await htmlToImage.toJpeg(element as HTMLElement, {
                quality: 0.95,
                pixelRatio: 2,
            });
            return dataUrl;
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            console.error("Oops, something went wrong!", msg);
            return null;
        }
    };

    // ---------------------------
    // Exports (stubs)
    // ---------------------------
    const generatePDF = async (): Promise<void> => {

        // Access the dom element using useRef
        const element = resumeRef.current;
        if (!element) {
            toast.error("Unable to capture content at the moment")
            return;
        }

        await htmlToImage.toPng(element as HTMLElement, { pixelRatio: 2 })
            .then((dataUrl) => {
                const a4Width = 210;
                const a4Height = 297;

                var pdf = new jsPDF({
                    orientation: 'p',
                    unit: 'mm',
                    format: [a4Width, a4Height],
                });

                const aspectRatio = a4Width / a4Height;
                const imgWidth = a4Width;
                const imgHeight = a4Width / aspectRatio;

                const verticalMargin = (a4Height - imgHeight / 2);
                pdf.addImage(dataUrl, 'PNG', 0, verticalMargin, imgWidth, imgHeight);
                pdf.save("resume.pdf");
            })
            .catch((err) => {
                toast.error(`Error: ${err.message}`);
            })
    };

    const generateImage = async (): Promise<void> => {

        // Access the dom element using useRef
        const element = resumeRef.current;
        if (!element) {
            toast.error("Unable to capture content at the moment")
            return;
        }

        htmlToImage.toJpeg(element).then(dataUrl => {
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = `${user?.displayName?.toLowerCase().trim().replace(' ', '_')}_resume.jpeg`;
            a.click();
        }).catch((err) => {
            toast.error(`Error: ${err.message}`);
        })
    };

    const generatePng = async (): Promise<void> => {

        // Access the dom element using useRef
        const element = resumeRef.current;
        if (!element) {
            toast.error("Unable to capture content at the moment")
            return;
        }
        htmlToImage.toPng(element).then(dataUrl => {
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = `${user?.displayName?.toLowerCase().trim().replace(' ', '_')}_resume.png`;
            a.click();
        }).catch((err) => {
            toast.error(`Error: ${err.message}`);
        })
        
    };

    const generateSvg = async (): Promise<void> => {

        // Access the dom element using useRef
        const element = resumeRef.current;
        if (!element) {
            toast.error("Unable to capture content at the moment")
            return;
        }

        htmlToImage.toSvg(element).then(dataUrl => {
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = `${user?.displayName?.toLowerCase().trim().replace(' ', '_')}_resume.svg`;
            a.click();
        }).catch((err) => {
            toast.error(`Error: ${err.message}`);
        })
    };

    // ---------------------------
    // Render
    // ---------------------------
    if (resume_isLoading) return <MainSpinner />;

    if (resume_isError) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center">
                <p className="text-lg text-txtPrimary font-semibold">Error while fetching the data</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col items-center justify-start gap-4">
            {/* bread crumb */}
            <div className="w-full flex items-center gap-2 px-4">
                <Link to={`/`} className="flex items-center justify-center gap-2 text-txtPrimary">
                    <FaHouse />
                    Home
                </Link>
                <p className="text-txtPrimary cursor-pointer" onClick={() => navigate(-1)}>
                    / Template1 /
                </p>
                <p>Edit</p>
            </div>

            <div className="w-full lg:w-[1200px] grid grid-cols-1 lg:grid-cols-12 px-6 lg:px-32">
                {/* template design */}
                <div className="col-span-12 px-4 py-6">
                    <div className="flex items-center justify-end w-full gap-12 mb-4">
                        <button
                            type="button"
                            className="flex items-center justify-center gap-1 px-3 py-1 rounded-md bg-gray-200 cursor-pointer"
                            onClick={toggleEditable}
                        >
                            {isEdit ? (
                                <FaPenToSquare className="text-sm text-txtPrimary" />
                            ) : (
                                <FaPencil className="text-sm text-txtPrimary" />
                            )}
                            <p className="text-sm text-txtPrimary">Edit</p>
                        </button>

                        <button
                            type="button"
                            className="flex items-center justify-center gap-1 px-3 py-1 rounded-md bg-gray-200 cursor-pointer"
                            onClick={saveFormData}
                        >
                            <BiSolidBookmarks className="text-sm text-txtPrimary" />
                            <p className="text-sm text-txtPrimary">Save</p>
                        </button>

                        <div className=" flex items-center justify-center gap-2">
                            <p className="text-sm text-txtPrimary">Download : </p>
                            <BsFiletypePdf className="text-2xl text-txtPrimary cursor-pointer" onClick={generatePDF} />
                            <BsFiletypePng className="text-2xl text-txtPrimary cursor-pointer" onClick={generatePng} />
                            <BsFiletypeJpg className="text-2xl text-txtPrimary cursor-pointer" onClick={generateImage} />
                            <BsFiletypeSvg className="text-2xl text-txtPrimary cursor-pointer" onClick={generateSvg} />
                        </div>
                    </div>

                    <div className="w-full h-auto grid grid-cols-12" ref={resumeRef}>
                        <div className="col-span-4 bg-black flex flex-col items-center justify-start">
                            <div className="w-full h-80 bg-gray-300 flex items-center justify-center">
                                {!imageAsset.imageURL ? (
                                    <React.Fragment>
                                        <label className=" w-full cursor-pointer h-full">
                                            <div className="w-full flex flex-col items-center justify-center h-full">
                                                <div className="w-full flex flex-col justify-center items-center cursor-pointer">
                                                    <img src={TemplateOne as string} className="w-full h-80 object-cover" alt="placeholder" />
                                                </div>
                                            </div>

                                            {isEdit && (
                                                <input
                                                    type="file"
                                                    className="w-0 h-0"
                                                    accept=".jpeg,.jpg,.png"
                                                    onChange={handleFileSelect}
                                                />
                                            )}
                                        </label>
                                    </React.Fragment>
                                ) : (
                                    <div className="relative w-full h-full overflow-hidden rounded-md">
                                        <img src={imageAsset.imageURL} alt="uploaded" className="w-full h-full object-cover" loading="lazy" />

                                        {isEdit && (
                                            <button
                                                type="button"
                                                className="absolute top-4 right-4 w-8 h-8 rounded-md flex items-center justify-center bg-red-500 cursor-pointer"
                                                onClick={deleteImageObject}
                                                aria-label="Delete profile"
                                            >
                                                <FaTrash className="text-sm text-white" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="w-full flex flex-col items-center justify-start pl-8 mt-4 gap-6">
                                <div className="w-full">
                                    <p className="uppercase text-lg font-semibold text-gray-100">Education</p>
                                    <div className="w-full h-[2px] bg-yellow-400 mt-2"></div>
                                    <AnimatePresence>
                                        {education?.map((edu, i) => (
                                            <motion.div key={i}
                                                {...opacityINOut(i)}
                                                className="w-full pl-4 mt-3 relative">
                                                <input
                                                    type="text"
                                                    name="major"
                                                    value={edu.major}
                                                    onChange={(e) => handleEducationChange(i, e)}
                                                    readOnly={!isEdit}
                                                    className={`bg-transparent outline-none border-none text-sm font-semibold uppercase  text-gray-100  ${isEdit && "text-yellow-400 w-full"
                                                        }`}
                                                />

                                                <textarea
                                                    className={`text-xs text-gray-200 mt-2  w-full  outline-none border-none ${isEdit ? "bg-[#1c1c1c]" : "bg-transparent"
                                                        }`}
                                                    name="university"
                                                    value={edu.university}
                                                    onChange={(e) => handleEducationChange(i, e)}
                                                    rows={2}
                                                    readOnly={!isEdit}
                                                    style={{ maxHeight: "auto", minHeight: "40px", resize: "none" }}
                                                />
                                                <AnimatePresence>
                                                    {isEdit && (
                                                        <motion.div {...fadeInOutWithOpacity} onClick={() => removeEducation(i)} className="cursor-pointer absolute right-2 top-0">
                                                            <FaTrash className="text-sm text-gray-100" />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                <AnimatePresence>
                                    {isEdit && (
                                        <motion.div {...fadeInOutWithOpacity} onClick={addEducation} className="cursor-pointer">
                                            <FaPlus className="text-base text-gray-100" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* reference */}
                                <div className="w-full">
                                    <p className="uppercase text-lg font-semibold text-gray-100">Reference</p>
                                    <div className="w-full h-[2px] bg-yellow-400 mt-2"></div>
                                    <div className="w-full pl-4 mt-3">
                                        <input
                                            value={formData.refererName}
                                            onChange={handleChange}
                                            name="refererName"
                                            type="text"
                                            readOnly={!isEdit}
                                            className={`bg-transparent outline-none border-none text-base tracking-widest capitalize text-gray-100 w-full ${isEdit && "bg-[#1c1c1c]"
                                                }`}
                                        />

                                        <input
                                            value={formData.refererRole}
                                            onChange={handleChange}
                                            name="refererRole"
                                            type="text"
                                            readOnly={!isEdit}
                                            className={`bg-transparent outline-none border-none text-xs capitalize text-gray-300 w-full ${isEdit && "bg-[#1c1c1c]"
                                                }`}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="w-full flex flex-col items-start justify-start mt-6 gap-6">
                                <div className="w-full grid grid-cols-12">
                                    <div className="col-span-3 w-full h-6 bg-yellow-400"></div>
                                    <div className="col-span-9">
                                        <div className="w-full h-6 bg-[rgba(45,45,45,0.6)] px-3 flex items-center">
                                            <p className="text-sm font-semibold text-gray-200">Phone</p>
                                        </div>
                                        <input
                                            value={formData.mobile}
                                            onChange={handleChange}
                                            name="mobile"
                                            type="text"
                                            readOnly={!isEdit}
                                            className={`bg-transparent outline-none border-none text-xs px-3 mt-2 text-gray-200 w-full ${isEdit && "bg-[#1c1c1c]"
                                                }`}
                                        />
                                    </div>
                                </div>

                                {/* email */}
                                <div className="w-full grid grid-cols-12">
                                    <div className="col-span-3 w-full h-6 bg-yellow-400"></div>
                                    <div className="col-span-9">
                                        <div className="w-full h-6 bg-[rgba(45,45,45,0.6)] px-3 flex items-center">
                                            <p className="text-sm font-semibold text-gray-200">Email</p>
                                        </div>
                                        <input
                                            value={formData.email}
                                            onChange={handleChange}
                                            name="email"
                                            type="text"
                                            readOnly={!isEdit}
                                            className={`bg-transparent outline-none border-none text-xs px-3 mt-2 text-gray-200 w-full ${isEdit && "bg-[#1c1c1c]"
                                                }`}
                                        />
                                    </div>
                                </div>

                                {/* website */}
                                <div className="w-full grid grid-cols-12">
                                    <div className="col-span-3 w-full h-6 bg-yellow-400"></div>
                                    <div className="col-span-9">
                                        <div className="w-full h-6 bg-[rgba(45,45,45,0.6)] px-3 flex items-center">
                                            <p className="text-sm font-semibold text-gray-200">Website</p>
                                        </div>

                                        <input
                                            value={formData.website}
                                            onChange={handleChange}
                                            name="website"
                                            type="text"
                                            readOnly={!isEdit}
                                            className={`bg-transparent outline-none border-none text-xs px-3 mt-2 text-gray-200 w-full ${isEdit && "bg-[#1c1c1c]"
                                                }`}
                                        />
                                    </div>
                                </div>

                                {/* address */}
                                <div className="w-full grid grid-cols-12">
                                    <div className="col-span-3 w-full h-6 bg-yellow-400"></div>
                                    <div className="col-span-9">
                                        <div className="w-full h-6 bg-[rgba(45,45,45,0.6)] px-3 flex items-center">
                                            <p className="text-sm font-semibold text-gray-200">Address</p>
                                        </div>

                                        <textarea
                                            className={`text-xs text-gray-200 mt-2 px-3  w-full  outline-none border-none ${isEdit ? "bg-[#1c1c1c]" : "bg-transparent"
                                                }`}
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            rows={2}
                                            readOnly={!isEdit}
                                            style={{ maxHeight: "auto", minHeight: "40px", resize: "none" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-8 flex flex-col items-center justify-start py-6 bg-white">
                            <div className="w-full py-6"></div>
                            {/* title */}
                            <div className="w-full px-8 py-6 bg-yellow-500">
                                <div className="flex items-center justify-start ">
                                    <input
                                        type="text"
                                        name="fullname"
                                        value={formData.fullname}
                                        onChange={handleChange}
                                        readOnly={!isEdit}
                                        className={`bg-transparent outline-none border-none text-3xl font-sans uppercase tracking-wider text-txtDark font-extrabold ${isEdit && "text-white w-full"
                                            }`}
                                    />
                                </div>

                                <input
                                    value={formData.professionalTitle}
                                    onChange={handleChange}
                                    name="professionalTitle"
                                    type="text"
                                    readOnly={!isEdit}
                                    className={`bg-transparent outline-none border-none text-xl tracking-widest uppercase text-txtPrimary w-full ${isEdit && "text-white"
                                        }`}
                                />
                            </div>

                            {/* about me */}
                            <div className="w-full px-8 py-6 flex flex-col items-start justify-start gap-6">
                                <div className="w-full">
                                    <p className="uppercase text-xl tracking-wider">About Me</p>
                                    <div className="w-full h-1 bg-txtDark my-3"></div>
                                    <textarea
                                        className={`text-base text-txtPrimary tracking-wider w-full  outline-none border-none ${isEdit ? "bg-gray-200" : "bg-transparent"
                                            }`}
                                        name="personalDescription"
                                        value={formData.personalDescription}
                                        onChange={handleChange}
                                        rows={4}
                                        readOnly={!isEdit}
                                        style={{ minHeight: "100px", width: "100%", height: "100px", resize: "none" }}
                                    />
                                </div>

                                {/* experience */}
                                <div className="w-full">
                                    <p className="uppercase text-xl tracking-wider">Work Experience</p>
                                    <div className="w-full h-1 bg-txtDark my-3"></div>
                                    <div className="w-full flex flex-col items-center justify-start gap-4">
                                        <AnimatePresence>
                                            {experiences?.map((exp, i) => (
                                                <motion.div {...opacityINOut(i)} className="w-full grid grid-cols-12" key={i}>
                                                    <div className="col-span-4">
                                                        <input
                                                            value={exp.year}
                                                            onChange={(e) => handleExpChange(i, e)}
                                                            name="year"
                                                            type="text"
                                                            readOnly={!isEdit}
                                                            className={` outline-none border-none text-base tracking-wide uppercase text-txtDark w-full ${isEdit ? "bg-gray-200" : "bg-transparent"
                                                                }`}
                                                        />
                                                    </div>
                                                    <div className="col-span-8 relative">
                                                        <AnimatePresence>
                                                            {isEdit && (
                                                                <motion.div {...fadeInOutWithOpacity} onClick={() => removeExperience(i)} className="cursor-pointer absolute right-0 top-2">
                                                                    <FaTrash className="text-base text-txtPrimary" />
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                        <input
                                                            value={exp.title}
                                                            onChange={(e) => handleExpChange(i, e)}
                                                            name="title"
                                                            type="text"
                                                            readOnly={!isEdit}
                                                            className={` outline-none border-none font-sans text-lg tracking-wide capitalize text-txtDark w-full ${isEdit ? "bg-gray-200" : "bg-transparent"
                                                                }`}
                                                        />

                                                        <input
                                                            value={exp.companyAndLocation}
                                                            onChange={(e) => handleExpChange(i, e)}
                                                            name="companyAndLocation"
                                                            type="text"
                                                            readOnly={!isEdit}
                                                            className={` outline-none border-none text-sm tracking-wide capitalize text-txtPrimary w-full ${isEdit ? "bg-gray-200" : "bg-transparent"
                                                                }`}
                                                        />

                                                        <textarea
                                                            className={`text-xs mt-4  text-txtPrimary tracking-wider w-full  outline-none border-none ${isEdit ? "bg-gray-200" : "bg-transparent"
                                                                }`}
                                                            name="description"
                                                            value={exp.description}
                                                            onChange={(e) => handleExpChange(i, e)}
                                                            rows={3}
                                                            readOnly={!isEdit}
                                                            style={{ maxHeight: "auto", minHeight: "60px", resize: "none" }}
                                                        />
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        <AnimatePresence>
                                            {isEdit && (
                                                <motion.div {...fadeInOutWithOpacity} onClick={addExperience} className="cursor-pointer">
                                                    <FaPlus className="text-base text-txtPrimary" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* skills */}
                                <div className="w-full">
                                    <p className="uppercase text-xl tracking-wider">Skills</p>
                                    <div className="w-full h-1 bg-txtDark my-3"></div>
                                    <div className="w-full flex flex-wrap items-center justify-start gap-4">
                                        <AnimatePresence>
                                            {skills?.map((skill, i) => (
                                                <motion.div key={i} {...opacityINOut(i)} className="flex-1" style={{ minWidth: 225 }}>
                                                    <div className="w-full flex items-center justify-between">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <input
                                                                value={skill.title}
                                                                onChange={(e) => handleSkillsChange(i, e)}
                                                                name="title"
                                                                type="text"
                                                                readOnly={!isEdit}
                                                                className={` outline-none border-none text-base tracking-wide capitalize font-semibold text-txtPrimary w-full ${isEdit ? "bg-gray-200" : "bg-transparent"
                                                                    }`}
                                                            />

                                                            <AnimatePresence>
                                                                {isEdit && (
                                                                    <motion.input
                                                                        {...fadeInOutWithOpacity}
                                                                        value={skill.percentage}
                                                                        onChange={(e) => handleSkillsChange(i, e)}
                                                                        name="percentage"
                                                                        type="text"
                                                                        className={` outline-none border-none text-base tracking-wide capitalize font-semibold text-txtPrimary w-16 ${isEdit ? "bg-gray-200" : "bg-transparent"
                                                                            }`}
                                                                    />
                                                                )}
                                                            </AnimatePresence>
                                                        </div>

                                                        <AnimatePresence>
                                                            {isEdit && (
                                                                <motion.div {...fadeInOutWithOpacity} onClick={() => removeSkill(i)} className="cursor-pointer ">
                                                                    <FaTrash className="text-base text-txtPrimary" />
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                    <div className="relative mt-2 w-full h-1 rounded-md bg-gray-400">
                                                        <div
                                                            className="h-full rounded-md bg-gray-600"
                                                            style={{ width: `${skill.percentage}%`, transition: "width 0.3s ease" }}
                                                        ></div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                    <AnimatePresence>
                                        {isEdit && (
                                            <div className="w-full  flex items-center justify-center py-4">
                                                <motion.div {...fadeInOutWithOpacity} onClick={addSkill} className="cursor-pointer">
                                                    <FaPlus className="text-base text-txtPrimary" />
                                                </motion.div>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Template1;
