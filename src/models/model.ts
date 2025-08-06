import type { FieldValue } from "firebase/firestore";

export interface createTemplateFormData {
    title: string;
    imageUrl: string;
}

export interface imageAssetData{
    isImageLoading: boolean;
    uri: string | null;
    progress: number;
}

export type templateData = {
    _id: string;
    title: string;
    name: string;
    imageUrl: string;
    tags: string[];
    timestamp: FieldValue;
}