import { arrayRemove, arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import type { ResumeData, TemplateData, UserData } from '../models/model';
import { toast } from 'react-toastify';

export const getUserDetails = async () => {
    return new Promise<UserData>((resolve, reject) => {

        const authListenerUnsubscribe = auth.onAuthStateChanged((userCred) => {
            if (userCred) {
                const userData = userCred.providerData[0];
                const userDocRef = doc(db, "users", userData.uid);
                // Checking if the user document exists in firestore db or not. Is exists then return the data, 
                // else create a new document with user data and then return the data.
                const userDocListenerUnsubscribe = onSnapshot(userDocRef, (snapshot) => {
                    if (snapshot.exists()) {
                        resolve(snapshot.data() as UserData);
                    } else {
                        setDoc(userDocRef, userData)
                            .then(() => {
                                resolve(userData);
                            })
                            .catch((err) => reject(err));
                    }

                    // Clean up the Firestore listener once we have data
                    userDocListenerUnsubscribe();
                });

                // Optional: stop listening for auth state changes after first trigger
                authListenerUnsubscribe();
            } else {
                reject(new Error("User not authenticated"));
                authListenerUnsubscribe();
            }
        });
    });
}


export const getTemplates = async () => {


    return new Promise<TemplateData[]>(async (resolve) => {
        const templatesQuery = query(collection(db, "templates"),
            orderBy("timestamp", "asc")
        );
        const querySnapshot = await getDocs(templatesQuery);
        const templates = querySnapshot.docs.map((doc) => {
            // doc.data() is never undefined for query doc snapshots
            return doc.data() as TemplateData;
        });
        resolve(templates);

    })

    // Another way to get templates using onSnapshot method

    // return new Promise<templateData[]>((resolve, reject) => {
    //     const templatesQuery = query(collection(db, "templates"),
    //         orderBy("timestamp", "asc")
    //     );
    //     getTemplatesByTypeTwo();
    //     console.log('getting documents by onSnapshot method');

    //     const unsubscribe = onSnapshot(templatesQuery, (querySnapshot) => {
    //         const templates = querySnapshot.docs.map((doc) => doc.data());
    //         resolve(templates as templateData[]);
    //     });
    //     return unsubscribe;
    // });
}

// const getTemplatesByTypeTwo = async () => {
//     const templatesQuery = query(collection(db, "templates"),
//         orderBy("timestamp", "asc")
//     );
//     const querySnapshot = await getDocs(templatesQuery);
//     console.log('getting documents by other method');
//     querySnapshot.forEach((doc) => {
//         // doc.data() is never undefined for query doc snapshots
//         console.log(doc.id, " => ", doc.data());
//     });
// }

export const saveToCollections = async (user: UserData | undefined, templateData: TemplateData) => {

    if (user?.uid) {
        const docRef = doc(db, "users", user?.uid);
        console.log();
        if (!user?.collections?.includes(templateData._id)) {
            await updateDoc(docRef, {
                collections: arrayUnion(templateData._id)
            })
                .then(() => { toast.success("Template added to collections") })
                .catch((err) => { console.log('error', err); toast.error("Error: ", err.message) });
        } else {
            await updateDoc(docRef, {
                collections: arrayRemove(templateData._id)
            })
                .then(() => { toast.success("Template removed from collections") })
                .catch((err) => toast.error("Error: ", err.message));
        }
    }
}
export const saveToFavourites = async (user: UserData | undefined, templateData: TemplateData) => {

    if (user?.uid) {
        const docRef = doc(db, "templates", templateData?._id);
        // console.log( );
        if (!templateData?.favourites?.includes(user.uid)) {
            await updateDoc(docRef, {
                favourites: arrayUnion(user.uid)
            })
                .then(() => { toast.success("Template added to favourites") })
                .catch((err) => { console.log('error', err); toast.error("Error: ", err.message) });
        } else {
            await updateDoc(docRef, {
                favourites: arrayRemove(user.uid)
            })
                .then(() => { toast.success("Template removed from favourites") })
                .catch((err) => toast.error("Error: ", err.message));
        }
    }
}

export const getTemplateDetails = async (templateId: string | undefined) => {
    return new Promise<TemplateData>(async (resolve, reject) => {
        if (templateId) {
            const docRef = doc(db, 'templates', templateId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists())
                return resolve(docSnap.data() as TemplateData);
            return reject(new Error("Template does not exist"))
        }

        return reject(new Error("Please enter a valid template id"));
    })
}

export const getTemplateDetailEditByUser = (uid: string | undefined, id: string | undefined) => {
    return new Promise<ResumeData>((resolve) => {
        const unsubscribe = onSnapshot(
            doc(db, "users", uid ?? '', "resumes", id ?? ''),
            (doc) => {
                resolve(doc.data() as ResumeData);
            }
        );

        return unsubscribe;
    });
};

export const getSavedResumes = async (uid: string | undefined) => {
    return new Promise<ResumeData[]>(async (resolve, reject) => {
        if (!uid)
            return reject(new Error('avccfjknj'));

        const savedResumesQuery = query(collection(db, "users", uid, "resumes"));
        const savedResumesSnapshot = await getDocs(savedResumesQuery);
        const resumeData = savedResumesSnapshot.docs.map(doc => { return doc.data() as ResumeData });
        return resolve(resumeData);
    })
}