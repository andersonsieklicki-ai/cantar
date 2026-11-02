// Configuração pública do Firebase para o Assistente Vocal.
// A segurança dos dados é aplicada pelas regras do Firestore e Storage, não por esta chave.
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js';

const firebaseConfig = {
  apiKey: 'AIzaSyBDnYuOlut0xrftafbAKqowp1iGdGnq63A',
  authDomain: 'cantar-ccd01.firebaseapp.com',
  projectId: 'cantar-ccd01',
  storageBucket: 'cantar-ccd01.firebasestorage.app',
  messagingSenderId: '271304102034',
  appId: '1:271304102034:web:85e27642bb27b04300564b'
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
