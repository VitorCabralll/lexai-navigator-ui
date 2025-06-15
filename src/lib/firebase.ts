
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Verificar se todas as variáveis de ambiente estão definidas
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
const isFirebaseConfigured = missingVars.length === 0;

if (!isFirebaseConfigured) {
  console.warn('Firebase não configurado. Variáveis de ambiente faltando:', missingVars);
  console.warn('Para configurar Firebase, copie .env.local.example para .env.local e preencha com suas credenciais');
}

// Inicializar Firebase apenas se estiver configurado
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();

    // Configurar provedor Google
    googleProvider.addScope('email');
    googleProvider.addScope('profile');

    console.log('Firebase inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar Firebase:', error);
  }
}

// Exportar com verificação de segurança
export { auth, db, storage, googleProvider, isFirebaseConfigured };

// Funções auxiliares para verificar se o Firebase está configurado
export const requireFirebase = () => {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase não está configurado. Verifique suas variáveis de ambiente.');
  }
};

export const getFirebaseAuth = () => {
  requireFirebase();
  return auth!;
};

export const getFirebaseDb = () => {
  requireFirebase();
  return db!;
};

export const getFirebaseStorage = () => {
  requireFirebase();
  return storage!;
};

export const getGoogleProvider = () => {
  requireFirebase();
  return googleProvider!;
};
