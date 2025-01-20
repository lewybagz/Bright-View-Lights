import { 
   createUserWithEmailAndPassword, 
   getAuth,
   fetchSignInMethodsForEmail
 } from 'firebase/auth';
 import { 
   doc, 
   setDoc, 
   getDoc, 
   collection, 
   getDocs 
 } from 'firebase/firestore';
 import { db } from './firebase';
 
 // Default password for new users
 const DEFAULT_PASSWORD = 'Welcome123!';
 
 // Check if the user would be the first user in the system
 async function isFirstUser(): Promise<boolean> {
   const usersSnapshot = await getDocs(collection(db, 'users'));
   return usersSnapshot.empty;
 }
 
 // Create a new user with the given email
 export async function createNewUser(email: string): Promise<void> {
   try {
     // Check if email already exists
     const signInMethods = await fetchSignInMethodsForEmail(getAuth(), email);
     if (signInMethods.length > 0) {
       throw new Error('Email already exists');
     }
 
     // Create auth user
     const userCredential = await createUserWithEmailAndPassword(
       getAuth(),
       email,
       DEFAULT_PASSWORD
     );
 
     // Determine if this is the first user (will be admin if so)
     const isAdmin = await isFirstUser();
 
     // Create user document in Firestore
     await setDoc(doc(db, 'users', userCredential.user.uid), {
       id: userCredential.user.uid,
       email,
       role: isAdmin ? 'admin' : 'installer', // Default to installer if not first user
       createdAt: new Date(),
       isActive: true
     });
 
   } catch (error) {
     console.error('Error creating user:', error);
     throw error;
   }
 }
 
 // Check if current user is admin
 export async function checkIsAdmin(userId: string): Promise<boolean> {
   const userDoc = await getDoc(doc(db, 'users', userId));
   return userDoc.exists() && userDoc.data()?.role === 'admin';
 }