import type { FieldValue } from "firebase/firestore";
import type { UserInfo } from 'firebase/auth';

export interface createTemplateFormData {
    title: string;
    imageUrl: string;
}

export interface UserData extends UserInfo {
    collections?: string[];
    resumes?: ResumeData[];
}

export interface ImageAssetData {
    isImageLoading: boolean;
    uri: string | null;
    progress: number;
}

export type TemplateData = {
    _id: string;
    title: string;
    name: string;
    imageUrl: string;
    tags: string[];
    timestamp: FieldValue;
    favourites?: string[];
}

// resume data

export type ResumeFormData = {
    fullname: string;
    professionalTitle: string;
    personalDescription: string;
    refererName: string;
    refererRole: string;
    mobile: string;
    email: string;
    website: string;
    address: string;
};

export type ResumeEducation = {
    major: string;
    university: string;
}
export type ResumeExperiences = {
    year: string;
    title: string;
    companyAndLocation: string;
    description: string;
}
export type ResumeSkills = {
    title: string;
    percentage: string;
}

export type ResumeData = {
    _id: string | null;
    resume_id: string;
    formData: ResumeFormData
    education: ResumeEducation[];
    experiences: ResumeExperiences[];
    skills: ResumeSkills[];
    timeStamp: FieldValue;
    userProfilePic: string | null;
    imageURL: string | null | undefined;
}
