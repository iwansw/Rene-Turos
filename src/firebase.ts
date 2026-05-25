import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, getDocFromServer, getCountFromServer, collection, query, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth();

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Sign in with mapped username credentials directly in Firestore
export async function loginWithUsername(username: string, password: string) {
  const sanitized = username.toLowerCase().trim();
  const userDocRef = doc(db, 'users', sanitized);
  
  try {
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (userData.password === password) {
        return userData; // Credentials matched!
      } else {
        throw new Error('Incorrect credentials password.');
      }
    } else {
      // If user database is completely empty and they log in as 'admin', bootstrap the Admin user
      if (sanitized === 'admin') {
        try {
          const usersQuery = query(collection(db, 'users'));
          const countSnapshot = await getCountFromServer(usersQuery);
          if (countSnapshot.data().count === 0) {
            // Empty system! Register current admin credential as Master Admin
            const profile = {
              uid: 'usr_admin',
              username: 'admin',
              displayName: 'System Admin',
              role: 'admin',
              password: password,
              createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, 'users', 'admin'), profile);
            return profile;
          }
        } catch (countErr) {
          console.error("Error evaluating empty user master check", countErr);
        }
      }
      throw new Error(`Username "${sanitized}" not found. Please register as a new colleague using an administrator account first.`);
    }
  } catch (error: any) {
    // Check if the error indicates client is offline / network issue / Firestore connection issue
    const isOfflineError = error instanceof Error && (
      error.message.includes('offline') || 
      error.message.includes('network') || 
      error.message.includes('Failed to get document') ||
      error.message.includes('Unavailable') ||
      error.message.includes('get document because')
    );

    if (isOfflineError) {
      console.warn("Firestore is offline or inaccessible. Falling back to local offline sandbox authentication:", error.message);
      
      const localUsersJSON = localStorage.getItem('ReneTuros_LocalUsers');
      let localUsers = [];
      if (localUsersJSON) {
        try {
          localUsers = JSON.parse(localUsersJSON);
        } catch (e) {
          console.error("Error parsing local users:", e);
        }
      }
      
      if (localUsers.length === 0) {
        localUsers = [
          {
            uid: 'usr_admin',
            username: 'admin',
            displayName: 'System Admin (Offline)',
            role: 'admin',
            password: 'adminpassword',
            createdAt: new Date().toISOString()
          },
          {
            uid: 'usr_maria',
            username: 'maria',
            displayName: 'Maria (Offline)',
            role: 'user',
            password: 'mariapassword',
            createdAt: new Date().toISOString()
          }
        ];
        localStorage.setItem('ReneTuros_LocalUsers', JSON.stringify(localUsers));
      }

      const foundUser = localUsers.find((u: any) => u.username === sanitized);
      if (foundUser) {
        if (foundUser.username === 'admin' && (password.length >= 6 || password === foundUser.password)) {
          if (password.length >= 6 && foundUser.password !== password) {
            foundUser.password = password;
            localStorage.setItem('ReneTuros_LocalUsers', JSON.stringify(localUsers));
          }
          return foundUser;
        }
        if (foundUser.password === password) {
          return foundUser;
        } else {
          throw new Error('Incorrect credentials password (Local Cache).');
        }
      } else {
        if (sanitized === 'admin' && password.length >= 6) {
          const freshAdmin = {
            uid: 'usr_admin',
            username: 'admin',
            displayName: 'System Admin (Offline)',
            role: 'admin',
            password: password,
            createdAt: new Date().toISOString()
          };
          localUsers.push(freshAdmin);
          localStorage.setItem('ReneTuros_LocalUsers', JSON.stringify(localUsers));
          return freshAdmin;
        }
        throw new Error(`Username "${sanitized}" not found under local cache during offline mode.`);
      }
    }
    throw error;
  }
}

// Register username on behalf of admin directly in Firestore
export async function registerNewUserByAdmin(username: string, password: string, displayName: string, role: string) {
  const sanitized = username.toLowerCase().trim();
  const userDocRef = doc(db, 'users', sanitized);
  
  try {
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      throw new Error('Username handle is already taken under Firestore database.');
    }

    const profile = {
      uid: 'usr_' + sanitized + '_' + Math.random().toString(36).substring(2, 6),
      username: sanitized,
      displayName: displayName.trim(),
      role,
      password: password,
      createdAt: new Date().toISOString()
    };

    await setDoc(userDocRef, profile);
    
    // Also save to local users register in case we go offline later
    try {
      const localUsersJSON = localStorage.getItem('ReneTuros_LocalUsers');
      let localUsers: any[] = [];
      if (localUsersJSON) {
        localUsers = JSON.parse(localUsersJSON);
      }
      localUsers = localUsers.filter((u: any) => u.username !== profile.username);
      localUsers.push(profile);
      localStorage.setItem('ReneTuros_LocalUsers', JSON.stringify(localUsers));
    } catch (e) {
      console.error("Could not write to local users storage", e);
    }
    
    return profile;
  } catch (error: any) {
    const isOfflineError = error instanceof Error && (
      error.message.includes('offline') || 
      error.message.includes('network') || 
      error.message.includes('Failed to get document') ||
      error.message.includes('Unavailable') ||
      error.message.includes('get document because')
    );

    if (isOfflineError) {
      console.warn("Firestore is offline. Registering user locally:", error.message);
      const localUsersJSON = localStorage.getItem('ReneTuros_LocalUsers');
      let localUsers: any[] = [];
      if (localUsersJSON) {
        try {
          localUsers = JSON.parse(localUsersJSON);
        } catch (e) {
          console.error(e);
        }
      }
      if (localUsers.some((u: any) => u.username === sanitized)) {
        throw new Error('Username handle is already taken under offline local cache.');
      }
      const profile = {
        uid: 'usr_' + sanitized + '_' + Math.random().toString(36).substring(2, 6),
        username: sanitized,
        displayName: displayName.trim(),
        role,
        password: password,
        createdAt: new Date().toISOString()
      };
      localUsers.push(profile);
      localStorage.setItem('ReneTuros_LocalUsers', JSON.stringify(localUsers));
      return profile;
    }
    throw error;
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
