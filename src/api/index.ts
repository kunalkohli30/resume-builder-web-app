import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import type { UserInfo } from 'firebase/auth';

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
