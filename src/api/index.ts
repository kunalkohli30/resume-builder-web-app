import { collection, doc, getDocs, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import type { UserInfo } from 'firebase/auth';
import type { templateData } from '../models/model';

export const getUserDetails = async () => {
    return new Promise<UserInfo>((resolve, reject) => {
        console.log('getUserDetails called');

        const authListenerUnsubscribe = auth.onAuthStateChanged((userCred) => {
            if (userCred) {
                const userData = userCred.providerData[0];
                const userDocRef = doc(db, "users", userCred.uid);

                // Checking if the user document exists in firestore db or not. Is exists then return the data, 
                // else create a new document with user data and then return the data.
                const userDocListenerUnsubscribe = onSnapshot(userDocRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const userDataFromSnapshot = snapshot.data() as UserInfo;
                        resolve(snapshot.data() as UserInfo);
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

    console.log('getting documents by other method');

    return new Promise<templateData[]>(async (resolve, reject) => {
        const templatesQuery = query(collection(db, "templates"),
            orderBy("timestamp", "asc")
        );
        const querySnapshot = await getDocs(templatesQuery);
        const templates = querySnapshot.docs.map((doc) => {
            // doc.data() is never undefined for query doc snapshots
            return doc.data() as templateData;
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

const getTemplatesByTypeTwo = async () => {
    const templatesQuery = query(collection(db, "templates"),
        orderBy("timestamp", "asc")
    );
    const querySnapshot = await getDocs(templatesQuery);
    console.log('getting documents by other method');
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
    });
}