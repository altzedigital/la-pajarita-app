import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  increment
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  Package,
  Users,
  FileText,
  ShoppingCart,
  History,
  Download,
  Upload,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  Database,
  Search,
  LogOut,
  UserCheck,
  Filter,
  TrendingUp,
  Percent,
  BarChart3,
  Image as ImageIcon,
  MessageSquare,
  CreditCard,
  X,
  ClipboardList,
  ArrowUpRight,
  Edit3,
  BookmarkCheck,
  Eye,
  EyeOff
} from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyBsQrX4RUaePouyRQt_Gw8m76_G7Ndf6n8",
  authDomain: "la-pajarita-sistema.firebaseapp.com",
  projectId: "la-pajarita-sistema",
  storageBucket: "la-pajarita-sistema.firebasestorage.app",
  messagingSenderId: "924671440601",
  appId: "1:924671440601:web:876981e4f60ddf74e570c8",
  measurementId: "G-B3CB7T1Z22"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const ADMIN_EMAILS = [
  'contacto@la-pajarita.com.mx',
  'eduardo@la-pajarita.com.mx'
];

const ESTADOS_MEXICO = [
  'AGUASCALIENTES', 'BAJA CALIFORNIA', 'BAJA CALIFORNIA SUR', 'CAMPECHE',
  'CHIAPAS', 'CHIHUAHUA', 'CIUDAD DE MÉXICO', 'COAHUILA', 'COLIMA',
  'DURANGO', 'ESTADO DE MÉXICO', 'GUANAJUATO', 'GUERRERO', 'HIDALGO',
  'JALISCO', 'MICHOACÁN', 'MORELOS', 'NAYARIT', 'NUEVO LEÓN', 'OAXACA',
  'PUEBLA', 'QUERÉTARO', 'QUINTANA ROO', 'SAN LUIS POTOSÍ', 'SINALOA',
  'SONORA', 'TABASCO', 'TAMAULIPAS', 'TLAXCALA', 'VERACRUZ', 'YUCATÁN',
  'ZACATECAS'
];

const EMPTY_ADDRESS = {
  calle: '',
  numExt: '',
  numInt: '',
  colonia: '',
  cp: '',
  municipio: '',
  estado: ''
};

const toUpper = (v) => String(v || '').toUpperCase();

const formatStructuredAddress = (addr) => {
  if (!addr || typeof addr !== 'object') return '';
