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
  AlertTriangle,
  Database,
  Search,
  LogOut,
  UserCheck,
  Filter,
  TrendingUp,
  Percent,
  BarChart3
} from 'lucide-react';

// Configuración oficial de tu proyecto Firebase
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

// Únicos correos con permisos de edición, costos/márgenes, dashboard de ventas y pedidos
const ADMIN_EMAILS = [
  'contacto@la-pajarita.com.mx',
  'eduardo@la-pajarita.com.mx'
];

const toDirectDriveImg = (url) => {
  if (!url) return '';
  const match = url.match(/\/d\/([^/]+)|id=([^&]+)/);
  const fileId = match ? (match[1] || match[2]) : null;
  return fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : url;
};

const LOGO_LA_PAJARITA_URL = 'https://drive.google.com/file/d/1Kutnzqe7wWMXIowoS7bpeiPO5nJT9K4K/view?usp=drive_link';

// Catálogo inicial migrado de "Inventario actualizado - Inventario a utilizar para cotizaciones___.csv"
const INITIAL_INVENTORY = [
  { sku: '100BLBANE400', descripcion: 'MI MANTELES 100X100 400 HJS. BALI NEGRO', stock: 0, precioPaq: 0, costoCaja: 0, costoUnidad: 0, uPq: 0, pCaja: 0, totalProdCaja: 0, cPalet: 0, volumen: 0, peso: 0, costoAdquisicion: 0 },
  { sku: '20AI2T', descripcion: 'SERV 20X20 AIRLAID 20 PAQ DE 70 HJS. BLANCO', stock: 0, precioPaq: 0, costoCaja: 0, costoUnidad: 0, uPq: 0, pCaja: 0, totalProdCaja: 0, cPalet: 0, volumen: 0, peso: 0, costoAdquisicion: 0 },
  { sku: '20AZM', descripcion: 'PAQ. SERV. 20x20 2/C MICROPUNTO PAPEL BASIC AZUL MAR 20PQ.100H. PLEGADO 1/4', stock: 82, precioPaq: 973.49, costoCaja: 973.49, costoUnidad: 9.73, uPq: 100, pCaja: 1, totalProdCaja: 100, cPalet: 24, volumen: 0.0085, peso: 0.05, costoAdquisicion: 681.44 },
  { sku: '20BLM', descripcion: 'PAQ. SERV. 20x20 2/C MICROPUNTO PAPEL BASIC 20PQ.100H. BLANCO PLEGADO 1/4', stock: 24, precioPaq: 973.49, costoCaja: 973.49, costoUnidad: 9.73, uPq: 100, pCaja: 1, totalProdCaja: 100, cPalet: 24, volumen: 0.0085, peso: 0.05, costoAdquisicion: 681.44 },
  { sku: '20GOM/20PG', descripcion: 'PAQ. SERV. 20x20 MICROPUNTO GO GREEN PAPEL RECICLADO 20 PQ.100H PLEGADO 1/4', stock: 75, precioPaq: 66.12, costoCaja: 1322.33, costoUnidad: 0.66, uPq: 100, pCaja: 20, totalProdCaja: 2000, cPalet: 60, volumen: 0.0013, peso: 3.6, costoAdquisicion: 925.63 },
  { sku: '20NEM/20PNE', descripcion: 'PAQ. SERV. 20x20 2/C MICROPUNTO PUNTA-PUNTA PAPEL BASIC 32PQ.100H. NEGRA PLEGADO 1/4', stock: 14, precioPaq: 86.84, costoCaja: 1736.87, costoUnidad: 0.87, uPq: 100, pCaja: 20, totalProdCaja: 2000, cPalet: 38, volumen: 0.0001, peso: 0.05, costoAdquisicion: 1215.81 },
  { sku: '20PAZ', descripcion: 'PAQ. SERV. 20x20 PUNTA-PUNTA DE PAPEL BASIC AZUL 32PQ.100H. PLEGADO 1/4', stock: 3, precioPaq: 86.84, costoCaja: 1736.87, costoUnidad: 0.87, uPq: 100, pCaja: 20, totalProdCaja: 2000, cPalet: 38, volumen: 0.0001, peso: 0.055, costoAdquisicion: 1215.81 },
  { sku: '20PBL', descripcion: 'PAQ. SERV. 20x20 PUNTA-PUNTA DE PAPEL BASIC BLANCA 32PQ.100H. PLEGADO 1/4', stock: 39, precioPaq: 41.32, costoCaja: 1322.33, costoUnidad: 0.41, uPq: 100, pCaja: 32, totalProdCaja: 3200, cPalet: 38, volumen: 0.0013, peso: 3.4, costoAdquisicion: 925.63 },
  { sku: '20PBLI2T', descripcion: 'PAQ. SERV. 20X20 PUNTA BCA 48 PAQ DE 100 HJS.', stock: 0, precioPaq: 0, costoCaja: 0, costoUnidad: 0, uPq: 100, pCaja: 0, totalProdCaja: 0, cPalet: 0, volumen: 0, peso: 0, costoAdquisicion: 0 },
  { sku: '20PG', descripcion: 'PAQ. SERV. 20x20 PUNTA-PUNTA GO GREEN PAPEL RECICLADO 32PQ.100H. PLEGADO 1/4', stock: 33, precioPaq: 41.32, costoCaja: 1322.33, costoUnidad: 0.41, uPq: 100, pCaja: 32, totalProdCaja: 3200, cPalet: 38, volumen: 0.0022, peso: 3.4, costoAdquisicion: 925.63 },
  { sku: '20PNE', descripcion: 'PAQ. SERV. 20x20 PUNTA-PUNTA PAPEL BASIC NEGRO 32PQ.100H. PLEGADO 1/4', stock: 33, precioPaq: 86.84, costoCaja: 1736.87, costoUnidad: 0.87, uPq: 100, pCaja: 20, totalProdCaja: 2000, cPalet: 38, volumen: 0.0001, peso: 0.05, costoAdquisicion: 1215.81 },
  { sku: '20PNEI', descripcion: 'PAQ. SERV. 20x20 PUNTA-PUNTA NEGRO IMPRESO 1 TINTA 48 PQ. 100', stock: 0, precioPaq: 0, costoCaja: 0, costoUnidad: 0, uPq: 100, pCaja: 0, totalProdCaja: 0, cPalet: 0, volumen: 0, peso: 0, costoAdquisicion: 0 },
  { sku: '20PNEPA', descripcion: 'PAQ. SERV. 20x20 PUNTA-PUNTA NEGRO 20PQ.120H. PLEGADO AMERICANO', stock: 3, precioPaq: 86.84, costoCaja: 1736.87, costoUnidad: 0.72, uPq: 120, pCaja: 20, totalProdCaja: 2400, cPalet: 38, volumen: 0.0001, peso: 0.05, costoAdquisicion: 1215.81 },
  { sku: '20ROM', descripcion: 'PAQ. SERV. 20x20 2/C MICROPUNTO PAPEL BASIC ROJO 20 PQ.100H. PLEGADO 1/4', stock: 90, precioPaq: 108.55, costoCaja: 1736.87, costoUnidad: 1.09, uPq: 100, pCaja: 16, totalProdCaja: 1600, cPalet: 38, volumen: 0.0022, peso: 3.6, costoAdquisicion: 1215.81 },
  { sku: '20VOM', descripcion: 'PAQ. SERV. 20x20 2/C MICROPUNTO PAPEL BASIC VERDE OSCURO 20PQ.100H. PLEGADO 1/4', stock: 56, precioPaq: 108.55, costoCaja: 1736.87, costoUnidad: 1.09, uPq: 100, pCaja: 16, totalProdCaja: 1600, cPalet: 38, volumen: 0.0022, peso: 3.4, costoAdquisicion: 1215.81 },
  { sku: '2535ago', descripcion: 'MANTELES 25X35 AIRLAID GO GREEN 800 UD.', stock: 70, precioPaq: 2785.39, costoCaja: 2785.39, costoUnidad: 3.48, uPq: 800, pCaja: 1, totalProdCaja: 800, cPalet: 24, volumen: 0.0022, peso: 2.9, costoAdquisicion: 1949.77 },
  { sku: '2535ANE', descripcion: 'MANTELES 25X35 AIRLAID NEGRO 800 UD.', stock: 71, precioPaq: 201.97, costoCaja: 4039.35, costoUnidad: 5.05, uPq: 800, pCaja: 20, totalProdCaja: 16000, cPalet: 24, volumen: 0.0022, peso: 2.8, costoAdquisicion: 2827.55 },
  { sku: '2535FAZ50', descripcion: 'MIL MANTELES 25x35 50 GR. BLANCO+AZUL', stock: 46, precioPaq: 204.88, costoCaja: 2458.56, costoUnidad: 0.2, uPq: 1000, pCaja: 12, totalProdCaja: 12000, cPalet: 24, volumen: 0.0022, peso: 1.8, costoAdquisicion: 1720.99 },
  { sku: '2535FNE50', descripcion: 'MIL MANTELES 25x35 50 GR. BLANCO+NEGRO', stock: 47, precioPaq: 102.44, costoCaja: 2458.56, costoUnidad: 0.1, uPq: 1000, pCaja: 24, totalProdCaja: 24000, cPalet: 24, volumen: 0.0022, peso: 1.8, costoAdquisicion: 1720.99 },
  { sku: '2535FRO50', descripcion: 'MIL MANTELES 25x35 50 GR. ROJO BLANCO+ROJO', stock: 46, precioPaq: 102.44, costoCaja: 2458.56, costoUnidad: 0.1, uPq: 1000, pCaja: 24, totalProdCaja: 24000, cPalet: 24, volumen: 0.0022, peso: 1.8, costoAdquisicion: 1720.99 },
  { sku: '25PBL', descripcion: 'PAQ. SERV. 25x25 PUNTA-PUNTA PAPEL BASIC BLANCA 63 PQ. 50 H. PLEGADO 1/4', stock: 0, precioPaq: 89.56, costoCaja: 1791.23, costoUnidad: 1.79, uPq: 50, pCaja: 20, totalProdCaja: 1000, cPalet: 38, volumen: 0.0013, peso: 2.8, costoAdquisicion: 1253.86 },
  { sku: '25PBLI', descripcion: 'PAQ. SERV. 25x25 PUNTA-PUNTA BLANCO', stock: 24, precioPaq: 89.56, costoCaja: 1791.23, costoUnidad: 1.79, uPq: 50, pCaja: 20, totalProdCaja: 1000, cPalet: 38, volumen: 0.0022, peso: 2.7, costoAdquisicion: 1253.86 },
  { sku: '25PG', descripcion: 'PAQ. SERV. 25x25 PUNTA-PUNTA PAPEL RECICLADO GO GREEN 63 PQ. 50 H. PLEGADO 1/4', stock: 55, precioPaq: 93.76, costoCaja: 1875.27, costoUnidad: 1.88, uPq: 50, pCaja: 20, totalProdCaja: 1000, cPalet: 38, volumen: 0.0022, peso: 2.8, costoAdquisicion: 1312.69 },
  { sku: '25PNE', descripcion: 'PAQ. SERV. 25x25 PUNTA-PUNTA PAPEL BASIC NEGRO 63 PQ. 50 H. PLEGADO 1/4', stock: 0, precioPaq: 204.85, costoCaja: 2458.23, costoUnidad: 4.1, uPq: 50, pCaja: 12, totalProdCaja: 600, cPalet: 38, volumen: 0.0013, peso: 2.8, costoAdquisicion: 1720.76 },
  { sku: '3040PBL', descripcion: 'PAQ. SERV. 30x40 PUNTA-PUNTA PAPEL BASIC BLANCA 48PQ. PAQ. 50 H. PLEGADO 1/6', stock: 0, precioPaq: 42.02, costoCaja: 2017.01, costoUnidad: 0.84, uPq: 50, pCaja: 48, totalProdCaja: 2400, cPalet: 38, volumen: 0.0022, peso: 3.1, costoAdquisicion: 1411.91 },
  { sku: '3040PBLI2T', descripcion: 'PAQ. SERV. 30X40 PUNTA BCA 24 PAQ DE 50 HJS.', stock: 0, precioPaq: 0, costoCaja: 0, costoUnidad: 0, uPq: 0, pCaja: 0, totalProdCaja: 0, cPalet: 0, volumen: 0, peso: 0, costoAdquisicion: 0 },
  { sku: '3040PBLNAAZ', descripcion: 'PAQ. SERV. 30x40 PUNTA-PUNTA NAPOLES AZUL 24PQ. PAQ. 50H. PLEGADO 1/6', stock: 1, precioPaq: 198.43, costoCaja: 1190.6, costoUnidad: 3.97, uPq: 50, pCaja: 6, totalProdCaja: 300, cPalet: 38, volumen: 0.0001, peso: 0.05, costoAdquisicion: 833.42 },
  { sku: '3040PBLNANE', descripcion: 'PAQ. SERV. 30x40 PUNTA-PUNTA NAPOLES NEGRO 24PQ. PAQ. 50H. PLEGADO 1/6', stock: 38, precioPaq: 198.43, costoCaja: 1190.6, costoUnidad: 3.97, uPq: 50, pCaja: 6, totalProdCaja: 300, cPalet: 38, volumen: 0.0001, peso: 0.05, costoAdquisicion: 833.42 },
  { sku: '3040PBLNARO', descripcion: 'PAQ. SERV. 30x40 PUNTA-PUNTA NAPOLES ROJO 24PQ. PAQ. 50H. PLEGADO 1/6', stock: 37, precioPaq: 198.43, costoCaja: 1190.6, costoUnidad: 3.97, uPq: 50, pCaja: 6, totalProdCaja: 300, cPalet: 38, volumen: 0.0001, peso: 0.05, costoAdquisicion: 833.42 },
  { sku: '3040PBLNAVE', descripcion: 'PAQ. SERV. 30x40 PUNTA-PUNTA NAPOLES VERDE 24PQ. PAQ. 50H. PLEGADO 1/6', stock: 1, precioPaq: 198.43, costoCaja: 1190.6, costoUnidad: 3.97, uPq: 50, pCaja: 6, totalProdCaja: 300, cPalet: 38, volumen: 0.0001, peso: 0.05, costoAdquisicion: 833.42 },
  { sku: '3040PG', descripcion: 'PAQ. SERV. 30x40 PUNTA-PUNTA PAPEL RECICLADO GO GREEN 48 PQ. PAQ. 50 H. PLEGADO 1/6', stock: 142, precioPaq: 98.85, costoCaja: 1976.99, costoUnidad: 1.98, uPq: 50, pCaja: 20, totalProdCaja: 1000, cPalet: 38, volumen: 0.0022, peso: 3.2, costoAdquisicion: 1383.89 },
  { sku: '332GTRNE', descripcion: 'PAQ. SERV. 33x33 2/C PUNTA-PUNTA PAPEL RECICLADO GO GREEN TRIPOLI NEGRO 42PQ. 100 H. PLEGADO 1/4', stock: 37, precioPaq: 68.08, costoCaja: 3267.63, costoUnidad: 0.68, uPq: 100, pCaja: 48, totalProdCaja: 4800, cPalet: 38, volumen: 0.0001, peso: 0.05, costoAdquisicion: 2287.34 },
  { sku: '4020PBL', descripcion: 'PAQ. SERV. 40x20 PUNTA-PUNTA PAPEL BASIC BLANCA 16PQ.100H. PLEGADO 1/4', stock: 57, precioPaq: 475.07, costoCaja: 950.14, costoUnidad: 4.75, uPq: 100, pCaja: 2, totalProdCaja: 200, cPalet: 38, volumen: 0.0013, peso: 3.1, costoAdquisicion: 665.1 },
  { sku: '4020PBU', descripcion: 'PAQ. SERV. 40x20 PUNTA-PUNTA PAPEL BASIC BURDEOS 16PQ.100H. PLEGADO 1/4', stock: 3, precioPaq: 66.34, costoCaja: 1592.13, costoUnidad: 0.66, uPq: 100, pCaja: 24, totalProdCaja: 2400, cPalet: 38, volumen: 0.0001, peso: 0.05, costoAdquisicion: 1114.49 },
  { sku: '4020PG', descripcion: 'PAQ. SERV. 40x20 PUNTA-PUNTA PAPEL RECICLADO GO GREEN 16PQ.100H. PLEGADO 1/4', stock: 17, precioPaq: 475.07, costoCaja: 950.14, costoUnidad: 4.75, uPq: 100, pCaja: 2, totalProdCaja: 200, cPalet: 38, volumen: 0.0022, peso: 3.2, costoAdquisicion: 665.1 },
  { sku: '4020PNE', descripcion: 'PAQ. SERV. 40x20 PUNTA-PUNTA PAPEL BASIC NEGRO 16PQ.100H. PLEGADO 1/4', stock: 21, precioPaq: 66.34, costoCaja: 1592.13, costoUnidad: 0.66, uPq: 100, pCaja: 24, totalProdCaja: 2400, cPalet: 38, volumen: 0.0013, peso: 3.1, costoAdquisicion: 1114.49 },
  { sku: '4032AKBLA', descripcion: 'PAQ. SERV. 40x32 AIRLAID BASIC BLANCO 20P.40 UND. PLEGADO KANGAROO', stock: 88, precioPaq: 130.6, costoCaja: 2611.97, costoUnidad: 3.26, uPq: 40, pCaja: 20, totalProdCaja: 800, cPalet: 38, volumen: 0.0013, peso: 2.9, costoAdquisicion: 1828.38 },
  { sku: '4032AKBLI', descripcion: 'PAQ. SERV. 40x32 AIRLAID KANGAROO 20P.40 UND. BLANCO IMPRESO (Confirmar Precio)', stock: 0, precioPaq: 108.83, costoCaja: 2611.97, costoUnidad: 2.72, uPq: 40, pCaja: 24, totalProdCaja: 960, cPalet: 24, volumen: 0.0013, peso: 2.8, costoAdquisicion: 1828.38 },
  { sku: '4032PKNE', descripcion: 'SERV PUNTA COLOR CANGURO NEGRO P/40 C-24', stock: 86, precioPaq: 0, costoCaja: 0, costoUnidad: 0, uPq: 40, pCaja: 24, totalProdCaja: 960, cPalet: 24, volumen: 0.0013, peso: 2.9, costoAdquisicion: 0 }
];

const INITIAL_CLIENTS = [
  { id: 'siha-partner', nombre: 'SIHA PARTNER S.A. DE C.V', tipo: 'Distribuidor', descuento: 30, contacto: 'Compras', telefono: '', correo: '', rfc: '', direccion: '25 DE FEBRERO DE 1861 NO. 1413, LEYES DE REFORMA' },
  { id: 'cliente-directo', nombre: 'Cliente Directo General', tipo: 'Cliente Directo', descuento: 0, contacto: 'Mostrador', telefono: '', correo: '', rfc: 'XAXX010101000', direccion: 'Ciudad de México' }
];

const INITIAL_EJECUTIVOS = [
  { id: 'marijose', nombre: 'Marijose Arroyo', firmaUrl: 'https://drive.google.com/file/d/1Bxe53Y0ZlDICugfk7gKO6JNJKnAB0m5A/view?usp=sharing' },
  { id: 'ileana', nombre: 'Ileana Fernández', firmaUrl: 'https://drive.google.com/file/d/16yyQCd_ozUjKo4CWx6pJH9SGmJG0UUtM/view?usp=drive_link' },
  { id: 'mariana', nombre: 'Mariana De Garay', firmaUrl: 'https://drive.google.com/file/d/1AeZMjg8z3F8HQerI55UwWZrKbzmCYKy7/view?usp=drive_link' },
  { id: 'erika', nombre: 'Erika Vázquez', firmaUrl: 'https://drive.google.com/file/d/128UjQVzaESauNjhuL_9pC_4uvfGxvkAg/view?usp=drive_link' },
  { id: 'eduardo', nombre: 'Eduardo Casahonda', firmaUrl: 'https://drive.google.com/file/d/1nC74Zu9s8n6s1SjFVAKAQuZsBHGQx5ks/view?usp=drive_link' }
];

const MODALIDADES_IMPRESION = [
  { id: 'sin', label: 'Sin impresión', short: 'Sin impresión' },
  { id: '1tinta', label: '1 Tinta (+25%)', short: '1 Tinta' },
  { id: '2tintas', label: '2 Tintas (+30%)', short: '2 Tintas' },
  { id: '1tintamx', label: '1 Tinta México (+$0.70/paq)', short: '1 Tinta MX' },
  { id: '2tintasmx', label: '2 Tintas México (+$1.00/paq)', short: '2 Tintas MX' }
];

const TAMANOS_FILTER = ['Todos', '20x20', '25x25', '25x35', '30x40', '33x33', '40x20', '40x32', '100x100'];
const MATERIALES_FILTER = ['Todos', 'Airlaid', 'Novotela', 'Drylace', 'Punta-Punta', 'Micropunto', 'Go Green'];

const DEFAULT_NOTAS = `Contamos con inventario en México de las servilletas cotizadas.
Pedidos mínimos de 1 caja.
*ESTOS PRECIOS NO INCLUYEN IVA, PODRÁN VARIAR SEGÚN TIPO DE CAMBIO Y VOLUMEN
Precios más IVA.
TIEMPO DE ENTREGA: Por Definir.
POLÍTICA DE COMPRA: 50% Anticipo
ENVÍOS: Entrega en CDMX sin costo, una sola ubicación en pedidos mayores a 10 cajas. Entrega de paquetes en cajas cerradas.
No incluye ningún tipo de personalización no especificada.
Cotización válida por 15 días hábiles.
La existencias para entrega inmediata pueden variar.`;

const formatCurrency = (val, decimals = 2) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(Number(val) || 0);

const parseNumberClean = (val) => {
  if (val === undefined || val === null) return 0;
  const s = String(val).trim();
  if (!s || s.startsWith('#') || s.toUpperCase().includes('NO HAY')) return 0;
  const cleaned = s.replace(/[$,]/g, '').trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};

const extractSize = (sku, desc) => {
  const text = `${sku} ${desc}`.toLowerCase();
  for (const t of TAMANOS_FILTER.slice(1)) {
    if (text.includes(t)) return t;
  }
  return 'Otro';
};

const extractMaterial = (sku, desc) => {
  const text = `${sku} ${desc}`.toLowerCase();
  if (text.includes('airlaid') || sku.toLowerCase().includes('ak') || sku.toLowerCase().includes('ai') || sku.toLowerCase().includes('ago') || sku.toLowerCase().includes('ane')) return 'Airlaid';
  if (text.includes('novotela')) return 'Novotela';
  if (text.includes('drylace')) return 'Drylace';
  if (text.includes('punta-punta') || text.includes('punta')) return 'Punta-Punta';
  if (text.includes('micropunto')) return 'Micropunto';
  if (text.includes('go green')) return 'Go Green';
  return 'Basic / Otro';
};

const parseCsvLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventario');

  const [inventory, setInventory] = useState([]);
  const [clients, setClients] = useState([]);
  const [ejecutivos, setEjecutivos] = useState(INITIAL_EJECUTIVOS);
  const [orders, setOrders] = useState([]);
  const [loadingSeed, setLoadingSeed] = useState(false);

  // Filtros globales
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSize, setFilterSize] = useState('Todos');
  const [filterMaterial, setFilterMaterial] = useState('Todos');

  // Filtros Dashboard de Ventas
  const todayStr = new Date().toISOString().split('T')[0];
  const [salesMode, setSalesMode] = useState('mensual'); // 'mensual' | 'anual'
  const [salesYear, setSalesYear] = useState(String(new Date().getFullYear()));
  const [salesMonth, setSalesMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [reportType, setReportType] = useState('general'); // 'general' | 'distribuidor' | 'vendedor'
  const [selectedDistributorReport, setSelectedDistributorReport] = useState('Todos');
  const [selectedSellerReport, setSelectedSellerReport] = useState('Todos');

  // Modales Admin
  const [newProd, setNewProd] = useState({
    sku: '', descripcion: '', stock: 0, precioPaq: 0, costoCaja: 0, costoUnidad: 0,
    uPq: 0, pCaja: 0, totalProdCaja: 0, cPalet: 0, volumen: 0, peso: 0, costoAdquisicion: 0
  });
  const [showProdModal, setShowProdModal] = useState(false);

  const [newClient, setNewClient] = useState({ nombre: '', tipo: 'Distribuidor', descuento: 30, contacto: '', telefono: '', correo: '', rfc: '', direccion: '' });
  const [showClientModal, setShowClientModal] = useState(false);

  const [newEjec, setNewEjec] = useState({ nombre: '', firmaUrl: '' });
  const [showEjecModal, setShowEjecModal] = useState(false);

  // Estado Cotizador (con fecha editable igual que Pedido)
  const [cotFolio, setCotFolio] = useState(1001);
  const [cotFecha, setCotFecha] = useState(todayStr);
  const [cotClientId, setCotClientId] = useState('');
  const [cotClienteManual, setCotClienteManual] = useState('');
  const [cotContactoManual, setCotContactoManual] = useState('');
  const [cotTelefonoManual, setCotTelefonoManual] = useState('');
  const [cotCorreoManual, setCotCorreoManual] = useState('');
  const [cotDireccionManual, setCotDireccionManual] = useState('');
  const [cotImpresion, setCotImpresion] = useState('sin');
  const [cotEjecutivoId, setCotEjecutivoId] = useState('marijose');
  const [cotNotas, setCotNotas] = useState(DEFAULT_NOTAS);
  const [cotItems, setCotItems] = useState([{ sku: '', unidadVenta: 'caja', cantidad: 1 }]);

  // Estado Orden de Pedido
  const [ordFolio, setOrdFolio] = useState(188);
  const [ordFecha, setOrdFecha] = useState(todayStr);
  const [ordClientId, setOrdClientId] = useState('');
  const [ordRecoge, setOrdRecoge] = useState('NO');
  const [ordEnvio, setOrdEnvio] = useState(0);
  const [ordEjecutivo, setOrdEjecutivo] = useState('Ileana Fernández');
  const [ordItems, setOrdItems] = useState([{ sku: '', cajas: 1, customDesc: null }]);

  const isAdmin = useMemo(() => {
    if (!user?.email) return false;
    return ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(user.email.toLowerCase());
  }, [user]);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
  }, []);

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      alert('No se pudo iniciar sesión con Google: ' + err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    if (!user) return;
    const unsubInv = onSnapshot(collection(db, 'inventario'), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => a.sku.localeCompare(b.sku));
      setInventory(list);
    });
    const unsubCli = onSnapshot(collection(db, 'clientes'), (snap) => {
      setClients(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsubEjec = onSnapshot(collection(db, 'ejecutivos'), (snap) => {
      if (!snap.empty) {
        setEjecutivos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    });
    let unsubOrd = () => {};
    if (isAdmin) {
      unsubOrd = onSnapshot(collection(db, 'pedidos'), (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.folio || 0) - (a.folio || 0));
        setOrders(list);
        if (list.length > 0) {
          const maxFolio = Math.max(...list.map((o) => Number(o.folio) || 187));
          setOrdFolio(maxFolio + 1);
        }
      });
    }
    return () => {
      unsubInv();
      unsubCli();
      unsubEjec();
      unsubOrd();
    };
  }, [user, isAdmin]);

  const handleSelectCotClient = (id) => {
    setCotClientId(id);
    const found = clients.find((c) => c.id === id);
    if (found) {
      setCotClienteManual(found.nombre || '');
      setCotContactoManual(found.contacto || '');
      setCotTelefonoManual(found.telefono || '');
      setCotCorreoManual(found.correo || '');
      setCotDireccionManual(found.direccion || '');
    } else {
      setCotClienteManual('');
      setCotContactoManual('');
      setCotTelefonoManual('');
      setCotCorreoManual('');
      setCotDireccionManual('');
    }
  };

  const seedDatabase = async () => {
    if (!isAdmin) return;
    setLoadingSeed(true);
    try {
      const batch = writeBatch(db);
      INITIAL_INVENTORY.forEach((item) => {
        const safeId = item.sku.replace(/\//g, '_');
        batch.set(doc(db, 'inventario', safeId), item);
      });
      INITIAL_CLIENTS.forEach((cli) => {
        batch.set(doc(db, 'clientes', cli.id), cli);
      });
      INITIAL_EJECUTIVOS.forEach((ej) => {
        batch.set(doc(db, 'ejecutivos', ej.id), ej);
      });
      await batch.commit();
      alert('Catálogo de 129 SKUs, distribuidores y las 5 firmas cargados en Firebase.');
    } catch (e) {
      alert('Error al cargar datos iniciales: ' + e.message);
    } finally {
      setLoadingSeed(false);
    }
  };

  // Importación segura usando los títulos de tu CSV y sin alterar otros datos
  const handleCsvUpload = (e) => {
    if (!isAdmin) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = String(evt.target.result || '');
      const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
      if (lines.length < 2) return alert('El archivo CSV está vacío.');

      // Busca la fila que contenga 'sku' como encabezado (útil si tiene filas superiores de búsqueda)
      let headerRowIdx = lines.findIndex((l) => {
        const cols = parseCsvLine(l).map((c) => c.toLowerCase().trim());
        return cols.includes('sku');
      });
      if (headerRowIdx === -1) headerRowIdx = 0;

      const rawHeaders = parseCsvLine(lines[headerRowIdx]).map((h) => h.toLowerCase().trim());
      const findCol = (...names) => {
        for (const n of names) {
          const i = rawHeaders.indexOf(n.toLowerCase());
          if (i !== -1) return i;
        }
        return -1;
      };

      const idxSku = findCol('sku');
      const idxDesc = findCol('descripción', 'descripcion');
      const idxStock = findCol('stock');
      const idxPrecioPaq = findCol('precio por paq', 'preciopaq');
      const idxCostoCaja = findCol('costo por caja', 'costocaja');
      const idxCostoUnidad = findCol('costo unidad', 'costounidad');
      const idxUPq = findCol('u/pq', 'upq');
      const idxPCaja = findCol('p/caja', 'pcaja');
      const idxTotalProd = findCol('total de prod en caja', 'totalprodcaja');
      const idxCPalet = findCol('c/palet', 'cpalet');
      const idxVolumen = findCol('volumen');
      const idxPeso = findCol('peso');
      const idxAdq = findCol('costo adquisicion', 'costo adquisición', 'costoadquisicion');

      if (idxSku === -1 || idxDesc === -1) {
        return alert('El CSV debe incluir al menos las columnas SKU y Descripción.');
      }

      const batch = writeBatch(db);
      let count = 0;

      for (let i = headerRowIdx + 1; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i]);
        const sku = cols[idxSku] || '';
        const descripcion = cols[idxDesc] || '';
        if (!sku || !descripcion || sku.toLowerCase() === 'sku') continue;

        const existing = inventory.find((p) => p.sku.toLowerCase() === sku.toLowerCase());
        const stock = idxStock !== -1 && cols[idxStock] !== '' ? parseNumberClean(cols[idxStock]) : (existing?.stock ?? 0);
        const costoCaja = idxCostoCaja !== -1 && cols[idxCostoCaja] !== '' ? parseNumberClean(cols[idxCostoCaja]) : (existing?.costoCaja ?? 0);
        const pCaja = idxPCaja !== -1 && cols[idxPCaja] !== '' ? parseNumberClean(cols[idxPCaja]) : (existing?.pCaja ?? 0);
        const precioPaq =
          idxPrecioPaq !== -1 && cols[idxPrecioPaq] !== '' && !String(cols[idxPrecioPaq]).includes('#') && !String(cols[idxPrecioPaq]).toUpperCase().includes('NO HAY')
            ? parseNumberClean(cols[idxPrecioPaq])
            : (pCaja > 0 && costoCaja > 0 ? Number((costoCaja / pCaja).toFixed(2)) : (existing?.precioPaq ?? 0));
        const costoUnidad = idxCostoUnidad !== -1 && cols[idxCostoUnidad] !== '' ? parseNumberClean(cols[idxCostoUnidad]) : (existing?.costoUnidad ?? 0);
        const uPq = idxUPq !== -1 && cols[idxUPq] !== '' ? parseNumberClean(cols[idxUPq]) : (existing?.uPq ?? 0);
        const totalProdCaja = idxTotalProd !== -1 && cols[idxTotalProd] !== '' ? parseNumberClean(cols[idxTotalProd]) : (existing?.totalProdCaja ?? 0);
        const cPalet = idxCPalet !== -1 && cols[idxCPalet] !== '' ? parseNumberClean(cols[idxCPalet]) : (existing?.cPalet ?? 0);
        const volumen = idxVolumen !== -1 && cols[idxVolumen] !== '' ? parseNumberClean(cols[idxVolumen]) : (existing?.volumen ?? 0);
        const peso = idxPeso !== -1 && cols[idxPeso] !== '' ? parseNumberClean(cols[idxPeso]) : (existing?.peso ?? 0);
        const costoAdquisicion = idxAdq !== -1 && cols[idxAdq] !== '' ? parseNumberClean(cols[idxAdq]) : (existing?.costoAdquisicion ?? Number((costoCaja * 0.7).toFixed(2)));

        const safeId = existing?.id || sku.replace(/\//g, '_');
        batch.set(
          doc(db, 'inventario', safeId),
          {
            sku,
            descripcion,
            stock,
            precioPaq,
            costoCaja,
            costoUnidad,
            uPq,
            pCaja,
            totalProdCaja,
            cPalet,
            volumen,
            peso,
            costoAdquisicion
          },
          { merge: true }
        );
        count++;
      }

      await batch.commit();
      e.target.value = '';
      alert(`Se actualizaron ${count} productos sin alterar el resto de tu inventario.`);
    };
    reader.readAsText(file);
  };

  const exportToCSV = (filename, rows) => {
    if (!rows.length) return alert('No hay registros para exportar.');
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map((r) => headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const adjustStock = async (item, delta) => {
    if (!isAdmin) return;
    const newStock = Math.max(0, (Number(item.stock) || 0) + delta);
    await updateDoc(doc(db, 'inventario', item.id), { stock: newStock });
  };

  const handleUpdateAdquisicion = async (item, nuevoCostoAdq) => {
    if (!isAdmin) return;
    await updateDoc(doc(db, 'inventario', item.id), {
      costoAdquisicion: Number(nuevoCostoAdq) || 0
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!isAdmin || !newProd.sku) return;
    const safeId = newProd.sku.trim().replace(/\//g, '_');
    const cCaja = Number(newProd.costoCaja) || 0;
    const pC = Number(newProd.pCaja) || 0;
    const pPaq = Number(newProd.precioPaq) || (cCaja > 0 && pC > 0 ? Number((cCaja / pC).toFixed(2)) : 0);
    await setDoc(doc(db, 'inventario', safeId), {
      ...newProd,
      sku: newProd.sku.trim(),
      stock: Number(newProd.stock) || 0,
      precioPaq: pPaq,
      costoCaja: cCaja,
      costoUnidad: Number(newProd.costoUnidad) || 0,
      uPq: Number(newProd.uPq) || 0,
      pCaja: pC,
      totalProdCaja: Number(newProd.totalProdCaja) || 0,
      cPalet: Number(newProd.cPalet) || 0,
      volumen: Number(newProd.volumen) || 0,
      peso: Number(newProd.peso) || 0,
      costoAdquisicion: Number(newProd.costoAdquisicion) || 0
    });
    setNewProd({
      sku: '', descripcion: '', stock: 0, precioPaq: 0, costoCaja: 0, costoUnidad: 0,
      uPq: 0, pCaja: 0, totalProdCaja: 0, cPalet: 0, volumen: 0, peso: 0, costoAdquisicion: 0
    });
    setShowProdModal(false);
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    if (!isAdmin || !newClient.nombre) return;
    const id = newClient.nombre.toLowerCase().replace(/[^a-z0-9]/g, '-');
    await setDoc(doc(db, 'clientes', id), {
      ...newClient,
      descuento: Number(newClient.descuento) || 0
    });
    setNewClient({ nombre: '', tipo: 'Distribuidor', descuento: 30, contacto: '', telefono: '', correo: '', rfc: '', direccion: '' });
    setShowClientModal(false);
  };

  const handleSaveEjecutivo = async (e) => {
    e.preventDefault();
    if (!isAdmin || !newEjec.nombre) return;
    const id = newEjec.nombre.toLowerCase().replace(/[^a-z0-9]/g, '-');
    await setDoc(doc(db, 'ejecutivos', id), { id, ...newEjec });
    setNewEjec({ nombre: '', firmaUrl: '' });
    setShowEjecModal(false);
  };

  const handleDeleteOrder = async (order) => {
    if (!isAdmin) return;
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar el Pedido #${order.folio} de "${order.cliente}"? Se regresarán las cajas al stock del inventario.`
    );
    if (!confirmar) return;

    try {
      const batch = writeBatch(db);
      if (Array.isArray(order.partidas)) {
        order.partidas.forEach((line) => {
          const cajasARegresar = Number(line.cajas) || 0;
          if (cajasARegresar > 0) {
            const docId = line.prodId || String(line.sku || '').replace(/\//g, '_');
            if (docId) {
              batch.update(doc(db, 'inventario', docId), {
                stock: increment(cajasARegresar)
              });
            }
          }
        });
      }
      batch.delete(doc(db, 'pedidos', order.id));
      await batch.commit();
      alert(`Pedido #${order.folio} eliminado y stock devuelto al inventario.`);
    } catch (err) {
      alert('Error al eliminar el pedido: ' + err.message);
    }
  };

  const filteredInventory = useMemo(() => {
    return inventory.filter((p) => {
      const matchText =
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
      const size = extractSize(p.sku, p.descripcion);
      const mat = extractMaterial(p.sku, p.descripcion);
      const matchSize = filterSize === 'Todos' || size === filterSize;
      const matchMat = filterMaterial === 'Todos' || mat.toLowerCase() === filterMaterial.toLowerCase();
      return matchText && matchSize && matchMat;
    });
  }, [inventory, searchTerm, filterSize, filterMaterial]);

  // Cálculos Cotizador
  const selectedCotClient = useMemo(
    () => clients.find((c) => c.id === cotClientId) || { descuento: 0 },
    [clients, cotClientId]
  );

  const calcLineCotizacion = (prod, unidadVenta, cantidad) => {
    if (!prod) return { precioNormalUnidad: 0, precioUnitarioPieza: 0, totalUds: 0, importeNormal: 0 };
    const costoCajaBase = Number(prod.costoCaja) || 0;
    const pCaja = Number(prod.pCaja) || 1;
    const uPq = Number(prod.uPq) || 0;
    const precioPaqBase = Number(prod.precioPaq) > 0 ? Number(prod.precioPaq) : (pCaja > 0 ? costoCajaBase / pCaja : costoCajaBase);

    const baseSeleccionada = unidadVenta === 'paquete' ? precioPaqBase : costoCajaBase;
    const paqEnSeleccion = unidadVenta === 'paquete' ? 1 : pCaja;
    const totalUds = unidadVenta === 'paquete' ? uPq * cantidad : uPq * pCaja * cantidad;

    let precioConImpresion = baseSeleccionada;
    switch (cotImpresion) {
      case '1tinta':
        precioConImpresion = baseSeleccionada * 1.25;
        break;
      case '2tintas':
        precioConImpresion = baseSeleccionada * 1.30;
        break;
      case '1tintamx':
        precioConImpresion = baseSeleccionada + 0.70 * paqEnSeleccion;
        break;
      case '2tintasmx':
        precioConImpresion = baseSeleccionada + 1.00 * paqEnSeleccion;
        break;
      default:
        precioConImpresion = baseSeleccionada;
    }

    const importeNormal = precioConImpresion * cantidad;
    const precioUnitarioPieza = totalUds > 0 ? importeNormal / totalUds : 0;

    return {
      precioNormalUnidad: precioConImpresion,
      precioUnitarioPieza,
      totalUds,
      importeNormal
    };
  };

  const cotSubtotalNormal = useMemo(() => {
    return cotItems.reduce((acc, row) => {
      const prod = inventory.find((p) => p.sku === row.sku);
      const { importeNormal } = calcLineCotizacion(prod, row.unidadVenta, Number(row.cantidad) || 0);
      return acc + importeNormal;
    }, 0);
  }, [cotItems, inventory, cotImpresion]);

  const descuentoPctCot = Number(selectedCotClient.descuento) || 0;
  const cotDescuentoMonto = cotSubtotalNormal * (descuentoPctCot / 100);
  const cotSubtotalNeto = cotSubtotalNormal - cotDescuentoMonto;
  const cotIva = cotSubtotalNeto * 0.16;
  const cotTotalGeneral = cotSubtotalNeto + cotIva;

  // Cálculos Orden de Pedido
  const selectedOrdClient = useMemo(
    () => clients.find((c) => c.id === ordClientId) || null,
    [clients, ordClientId]
  );

  const ordSubtotal = useMemo(() => {
    return ordItems.reduce((acc, row) => {
      const prod = inventory.find((p) => p.sku === row.sku);
      if (!prod) return acc;
      const descPct = row.customDesc !== null ? Number(row.customDesc) : Number(selectedOrdClient?.descuento || 0);
      const precioFinal = (Number(prod.costoCaja) || 0) * (1 - descPct / 100);
      return acc + precioFinal * (Number(row.cajas) || 0);
    }, 0);
  }, [ordItems, inventory, selectedOrdClient]);

  const ordIva = (ordSubtotal + (Number(ordEnvio) || 0)) * 0.16;
  const ordTotal = ordSubtotal + (Number(ordEnvio) || 0) + ordIva;

  const handleConfirmOrder = async () => {
    if (!isAdmin) return;
    if (!selectedOrdClient) return alert('Selecciona un Cliente o Distribuidor.');
    const validLines = ordItems
      .map((row) => {
        const prod = inventory.find((p) => p.sku === row.sku);
        if (!prod || (Number(row.cajas) || 0) <= 0) return null;
        const descPct = row.customDesc !== null ? Number(row.customDesc) : Number(selectedOrdClient.descuento || 0);
        const precioFinal = (Number(prod.costoCaja) || 0) * (1 - descPct / 100);
        const costoAdq = Number(prod.costoAdquisicion) || 0;
        return {
          prodId: prod.id,
          sku: prod.sku,
          descripcion: prod.descripcion,
          stockActual: Number(prod.stock) || 0,
          cajas: Number(row.cajas),
          descuentoPct: descPct,
          precioFinal,
          costoAdquisicion: costoAdq,
          subtotal: precioFinal * Number(row.cajas),
          utilidadLinea: (precioFinal - costoAdq) * Number(row.cajas)
        };
      })
      .filter(Boolean);

    if (!validLines.length) return alert('Agrega al menos un SKU con cantidad de cajas.');
    const sinStock = validLines.find((l) => l.cajas > l.stockActual);
    if (sinStock) {
      return alert(`Stock insuficiente para ${sinStock.sku}. Disponible: ${sinStock.stockActual} cajas.`);
    }

    const utilidadTotal = validLines.reduce((s, l) => s + (Number(l.utilidadLinea) || 0), 0);

    const batch = writeBatch(db);
    const orderRef = doc(collection(db, 'pedidos'));
    batch.set(orderRef, {
      folio: Number(ordFolio),
      fecha: ordFecha || todayStr,
      cliente: selectedOrdClient.nombre,
      direccion: selectedOrdClient.direccion || '',
      recogeBodega: ordRecoge,
      ejecutivo: ordEjecutivo,
      usuarioCorreo: user?.email || '',
      partidas: validLines,
      subtotal: ordSubtotal,
      envio: Number(ordEnvio) || 0,
      iva: ordIva,
      total: ordTotal,
      utilidadEstimada: utilidadTotal,
      estatus: 'Confirmado'
    });

    validLines.forEach((line) => {
      batch.update(doc(db, 'inventario', line.prodId), {
        stock: increment(-line.cajas)
      });
    });

    await batch.commit();
    setOrdItems([{ sku: '', cajas: 1, customDesc: null }]);
    setOrdEnvio(0);
    alert(`Venta / Pedido #${ordFolio} confirmado y stock actualizado.`);
  };

  // Analítica de Ventas (Pedidos = Ventas) para Dashboard Admin
  const availableYears = useMemo(() => {
    const years = new Set([String(new Date().getFullYear())]);
    orders.forEach((o) => {
      if (o.fecha) years.add(String(o.fecha).slice(0, 4));
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [orders]);

  const filteredSales = useMemo(() => {
    return orders.filter((o) => {
      const f = String(o.fecha || '');
      const y = f.slice(0, 4);
      const m = f.slice(5, 7);
      if (salesMode === 'anual') {
        return y === salesYear;
      }
      return y === salesYear && m === salesMonth;
    });
  }, [orders, salesMode, salesYear, salesMonth]);

  const distributorSummary = useMemo(() => {
    const map = {};
    filteredSales.forEach((o) => {
      const key = o.cliente || 'Sin Cliente';
      if (!map[key]) {
        map[key] = { cliente: key, ordenes: 0, cajas: 0, subtotal: 0, total: 0, utilidad: 0 };
      }
      const cajasOrden = Array.isArray(o.partidas) ? o.partidas.reduce((s, p) => s + (Number(p.cajas) || 0), 0) : 0;
      const utilOrden = Array.isArray(o.partidas)
        ? o.partidas.reduce((s, p) => s + ((Number(p.precioFinal) - (Number(p.costoAdquisicion) || 0)) * (Number(p.cajas) || 0)), 0)
        : (Number(o.utilidadEstimada) || 0);
      map[key].ordenes += 1;
      map[key].cajas += cajasOrden;
      map[key].subtotal += Number(o.subtotal) || 0;
      map[key].total += Number(o.total) || 0;
      map[key].utilidad += utilOrden;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filteredSales]);

  const sellerSummary = useMemo(() => {
    const map = {};
    filteredSales.forEach((o) => {
      const key = o.ejecutivo || 'Sin Ejecutivo';
      if (!map[key]) {
        map[key] = { vendedor: key, ordenes: 0, cajas: 0, subtotal: 0, total: 0, utilidad: 0 };
      }
      const cajasOrden = Array.isArray(o.partidas) ? o.partidas.reduce((s, p) => s + (Number(p.cajas) || 0), 0) : 0;
      const utilOrden = Array.isArray(o.partidas)
        ? o.partidas.reduce((s, p) => s + ((Number(p.precioFinal) - (Number(p.costoAdquisicion) || 0)) * (Number(p.cajas) || 0)), 0)
        : (Number(o.utilidadEstimada) || 0);
      map[key].ordenes += 1;
      map[key].cajas += cajasOrden;
      map[key].subtotal += Number(o.subtotal) || 0;
      map[key].total += Number(o.total) || 0;
      map[key].utilidad += utilOrden;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filteredSales]);

  const salesKpis = useMemo(() => {
    const totalVentas = filteredSales.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const subtotalVentas = filteredSales.reduce((s, o) => s + (Number(o.subtotal) || 0), 0);
    const totalCajas = filteredSales.reduce(
      (s, o) => s + (Array.isArray(o.partidas) ? o.partidas.reduce((c, p) => c + (Number(p.cajas) || 0), 0) : 0),
      0
    );
    const utilidadTotal = filteredSales.reduce(
      (s, o) =>
        s +
        (Array.isArray(o.partidas)
          ? o.partidas.reduce((u, p) => u + ((Number(p.precioFinal) - (Number(p.costoAdquisicion) || 0)) * (Number(p.cajas) || 0)), 0)
          : (Number(o.utilidadEstimada) || 0)),
      0
    );
    const margenPct = subtotalVentas > 0 ? (utilidadTotal / subtotalVentas) * 100 : 0;
    return { totalVentas, subtotalVentas, totalCajas, utilidadTotal, margenPct, numVentas: filteredSales.length };
  }, [filteredSales]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-black text-sm">
        Verificando sesión...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-6">
          <div className="flex flex-col items-center">
            <img
              src={toDirectDriveImg(LOGO_LA_PAJARITA_URL)}
              alt="La Pajarita"
              className="h-16 object-contain mb-2"
              referrerPolicy="no-referrer"
            />
            <p className="text-xs uppercase tracking-widest text-gray-500">Sistema Operativo Interno</p>
          </div>
          <p className="text-xs text-black">
            Inicia sesión con tu cuenta de Google para consultar el catálogo o gestionar operaciones.
          </p>
          <button
            onClick={handleGoogleLogin}
            style={{ backgroundColor: '#2B5A45' }}
            className="w-full py-3 px-4 hover:opacity-95 text-white font-semibold rounded-xl shadow transition"
          >
            Iniciar sesión con Google
          </button>
        </div>
      </div>
    );
  }

  const ejecutivoActual = ejecutivos.find((e) => e.id === cotEjecutivoId) || ejecutivos[0];
  const modalidadShort = MODALIDADES_IMPRESION.find((m) => m.id === cotImpresion)?.short || 'Sin impresión';

  const availableTabs = isAdmin
    ? [
        { id: 'inventario', label: 'Inventario', icon: Package },
        { id: 'margenes', label: 'Costos y Márgenes', icon: TrendingUp },
        { id: 'dashboard', label: 'Dashboard Ventas', icon: BarChart3 },
        { id: 'cotizador', label: 'Cotizador', icon: FileText },
        { id: 'clientes', label: 'Distribuidores', icon: Users },
        { id: 'ejecutivos', label: 'Ejecutivos y Firmas', icon: UserCheck },
        { id: 'pedido', label: 'Nueva Orden', icon: ShoppingCart },
        { id: 'record', label: 'Récord Pedidos', icon: History }
      ]
    : [
        { id: 'inventario', label: 'Catálogo Inventario', icon: Package },
        { id: 'cotizador', label: 'Cotizador', icon: FileText }
      ];

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Barra superior (oculta al imprimir) */}
      <header style={{ backgroundColor: '#2B5A45' }} className="text-white px-6 py-3.5 shadow-md no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white px-2.5 py-1 rounded">
              <img
                src={toDirectDriveImg(LOGO_LA_PAJARITA_URL)}
                alt="La Pajarita"
                className="h-8 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">Sistema Operativo Interno</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-semibold bg-white/20 text-white">
                  {isAdmin ? 'Administrador' : 'Consulta / Cotizador'}
                </span>
              </div>
              <p className="text-xs text-white/80">{user.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {availableTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    activeTab === tab.id ? 'bg-white text-black font-bold shadow' : 'bg-black/20 text-white hover:bg-black/30'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-red-900/70 hover:bg-red-800 text-white"
            >
              <LogOut className="w-3.5 h-3.5" /> Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 bg-white">
        {isAdmin && inventory.length === 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-300 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 no-print">
            <div>
              <h2 className="font-semibold text-black">Base de datos lista para inicializarse</h2>
              <p className="text-sm text-gray-700">Carga automáticamente tus 129 SKUs, distribuidores y las 5 firmas digitales[cite: 1].</p>
            </div>
            <button
              onClick={seedDatabase}
              disabled={loadingSeed}
              style={{ backgroundColor: '#2B5A45' }}
              className="flex items-center gap-2 text-white px-4 py-2.5 rounded-lg font-medium text-sm"
            >
              <Database className="w-4 h-4" />
              {loadingSeed ? 'Cargando...' : 'Cargar Catálogo Inicial'}
            </button>
          </div>
        )}

        {/* TAB 1: INVENTARIO (Títulos de tu CSV + Precio por Paq antes de Costo por Caja) */}
        {activeTab === 'inventario' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por SKU o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-black bg-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-black" />
                  <select
                    value={filterSize}
                    onChange={(e) => setFilterSize(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-black"
                  >
                    {TAMANOS_FILTER.map((t) => (
                      <option key={t} value={t}>Tamaño: {t}</option>
                    ))}
                  </select>
                  <select
                    value={filterMaterial}
                    onChange={(e) => setFilterMaterial(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-black"
                  >
                    {MATERIALES_FILTER.map((m) => (
                      <option key={m} value={m}>Material: {m}</option>
                    ))}
                  </select>
                </div>

                {isAdmin && (
                  <div className="flex flex-wrap gap-2">
                    <label
                      title="Importa CSV con tus títulos: SKU, Descripción, STOCK, Precio por Paq, Costo por Caja, Costo Unidad, U/PQ, P/CAJA..."
                      className="flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-black px-3 py-2 rounded-lg text-xs font-medium cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" /> Importar CSV
                      <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
                    </label>
                    <button
                      onClick={() =>
                        exportToCSV(
                          'inventario_la_pajarita.csv',
                          inventory.map((p) => ({
                            SKU: p.sku,
                            Descripción: p.descripcion,
                            STOCK: p.stock,
                            'Precio por Paq': p.precioPaq,
                            'Costo por Caja': p.costoCaja,
                            'Costo Unidad': p.costoUnidad,
                            'U/PQ': p.uPq,
                            'P/CAJA': p.pCaja,
                            'Total de Prod en Caja': p.totalProdCaja,
                            'C/PALET': p.cPalet,
                            Volumen: p.volumen,
                            Peso: p.peso
                          }))
                        )
                      }
                      className="flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-black px-3 py-2 rounded-lg text-xs font-medium"
                    >
                      <Download className="w-3.5 h-3.5" /> CSV
                    </button>
                    <button
                      onClick={() => setShowProdModal(true)}
                      style={{ backgroundColor: '#2B5A45' }}
                      className="flex items-center gap-1.5 text-white px-3 py-2 rounded-lg text-xs font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" /> Nuevo SKU
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-xs text-left whitespace-nowrap">
                <thead style={{ backgroundColor: '#2B5A45' }} className="text-white uppercase text-[11px]">
                  <tr>
                    <th className="px-3 py-3">SKU</th>
                    <th className="px-3 py-3">Descripción</th>
                    <th className="px-3 py-3 text-center">STOCK</th>
                    <th className="px-3 py-3 text-right">Precio por Paq</th>
                    <th className="px-3 py-3 text-right">Costo por Caja</th>
                    <th className="px-3 py-3 text-right">Costo Unidad</th>
                    <th className="px-3 py-3 text-center">U/PQ</th>
                    <th className="px-3 py-3 text-center">P/CAJA</th>
                    <th className="px-3 py-3 text-center">Total de Prod en Caja</th>
                    <th className="px-3 py-3 text-center">C/PALET</th>
                    <th className="px-3 py-3 text-right">Volumen</th>
                    <th className="px-3 py-3 text-right">Peso</th>
                    {isAdmin && <th className="px-3 py-3 text-right">Valor Stock</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white text-black">
                  {filteredInventory.map((item) => {
                    const pPaq = Number(item.precioPaq) > 0
                      ? Number(item.precioPaq)
                      : (Number(item.pCaja) > 0 ? Number(item.costoCaja) / Number(item.pCaja) : Number(item.costoCaja) || 0);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5 font-mono font-bold text-black">{item.sku}</td>
                        <td className="px-3 py-2.5 text-[11px] text-black max-w-xs truncate" title={item.descripcion}>{item.descripcion}</td>
                        <td className="px-3 py-2.5">
                          {isAdmin ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button onClick={() => adjustStock(item, -1)} className="px-1.5 py-0.5 border border-gray-300 rounded hover:bg-gray-100">-</button>
                              <span className={`font-bold min-w-[2rem] text-center ${item.stock <= 5 ? 'text-red-600' : 'text-black'}`}>
                                {item.stock}
                              </span>
                              <button onClick={() => adjustStock(item, 1)} className="px-1.5 py-0.5 border border-gray-300 rounded hover:bg-gray-100">+</button>
                            </div>
                          ) : (
                            <div className="text-center font-bold text-black">{item.stock}</div>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold text-black">{formatCurrency(pPaq)}</td>
                        <td className="px-3 py-2.5 text-right font-medium text-black">{formatCurrency(item.costoCaja)}</td>
                        <td className="px-3 py-2.5 text-right text-black">{formatCurrency(item.costoUnidad, 4)}</td>
                        <td className="px-3 py-2.5 text-center text-black">{item.uPq || 0}</td>
                        <td className="px-3 py-2.5 text-center text-black">{item.pCaja || 0}</td>
                        <td className="px-3 py-2.5 text-center text-black">{(Number(item.totalProdCaja) || 0).toLocaleString('es-MX')}</td>
                        <td className="px-3 py-2.5 text-center text-black">{item.cPalet || 0}</td>
                        <td className="px-3 py-2.5 text-right text-black">{item.volumen || 0}</td>
                        <td className="px-3 py-2.5 text-right text-black">{item.peso || 0}</td>
                        {isAdmin && (
                          <td className="px-3 py-2.5 text-right font-bold text-black">
                            {formatCurrency((Number(item.stock) || 0) * (Number(item.costoCaja) || 0))}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: COSTOS Y MÁRGENES (Solo Admin) */}
        {isAdmin && activeTab === 'margenes' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-wrap justify-between items-center gap-3">
              <div>
                <h2 className="font-bold text-lg text-black flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#2B5A45]" /> Control de Costos y Márgenes de Ganancia
                </h2>
                <p className="text-xs text-gray-600">
                  Compara <strong>Precio de Adquisición</strong> vs. <strong>Precio de Venta</strong> por caja y calcula margen en <strong>$</strong> y <strong>%</strong>.
                </p>
              </div>
              <button
                onClick={() =>
                  exportToCSV(
                    'costos_y_margenes_la_pajarita.csv',
                    filteredInventory.map((p) => {
                      const venta = Number(p.costoCaja) || 0;
                      const adq = Number(p.costoAdquisicion) || 0;
                      const margenPesos = venta - adq;
                      const margenPct = venta > 0 ? (margenPesos / venta) * 100 : 0;
                      return {
                        SKU: p.sku,
                        Descripción: p.descripcion,
                        STOCK: p.stock,
                        'Precio Adquisición ($)': adq.toFixed(2),
                        'Precio Venta Caja ($)': venta.toFixed(2),
                        'Margen ($)': margenPesos.toFixed(2),
                        'Margen (%)': margenPct.toFixed(1) + '%',
                        'Utilidad Potencial Stock ($)': (margenPesos * (Number(p.stock) || 0)).toFixed(2)
                      };
                    })
                  )
                }
                style={{ backgroundColor: '#2B5A45' }}
                className="flex items-center gap-2 text-white px-3.5 py-2 rounded-lg text-xs font-medium"
              >
                <Download className="w-4 h-4" /> Exportar Reporte Márgenes (CSV)
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead style={{ backgroundColor: '#2B5A45' }} className="text-white uppercase text-[11px]">
                  <tr>
                    <th className="px-3 py-3">SKU</th>
                    <th className="px-3 py-3">Descripción</th>
                    <th className="px-3 py-3 text-center">STOCK</th>
                    <th className="px-3 py-3 text-right">Precio Adquisición</th>
                    <th className="px-3 py-3 text-right">Precio Venta (Caja)</th>
                    <th className="px-3 py-3 text-right">Margen ($)</th>
                    <th className="px-3 py-3 text-right">Margen (%)</th>
                    <th className="px-3 py-3 text-right">Utilidad en Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white text-black">
                  {filteredInventory.map((item) => {
                    const venta = Number(item.costoCaja) || 0;
                    const adq = Number(item.costoAdquisicion) || 0;
                    const margenPesos = venta - adq;
                    const margenPct = venta > 0 ? (margenPesos / venta) * 100 : 0;
                    const utilidadStock = margenPesos * (Number(item.stock) || 0);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5 font-mono font-bold">{item.sku}</td>
                        <td className="px-3 py-2.5 max-w-xs truncate" title={item.descripcion}>{item.descripcion}</td>
                        <td className="px-3 py-2.5 text-center font-semibold">{item.stock}</td>
                        <td className="px-3 py-2.5 text-right">
                          <input
                            type="number"
                            step="0.01"
                            defaultValue={adq}
                            onBlur={(e) => handleUpdateAdquisicion(item, e.target.value)}
                            className="w-24 border border-gray-300 rounded px-2 py-1 text-right bg-white text-black font-medium"
                          />
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold">{formatCurrency(venta)}</td>
                        <td className={`px-3 py-2.5 text-right font-bold ${margenPesos < 0 ? 'text-red-600' : 'text-black'}`}>
                          {formatCurrency(margenPesos)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-bold">
                          <span className={`px-2 py-0.5 rounded text-[11px] ${margenPct < 20 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'}`}>
                            {margenPct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-bold">{formatCurrency(utilidadStock)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DASHBOARD DE VENTAS (Pedidos = Ventas, Mensual/Anual, Distribuidor y Vendedor) */}
        {isAdmin && activeTab === 'dashboard' && (
          <div className="space-y-5">
            <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-3 border-b border-gray-200 pb-3">
                <div>
                  <h2 className="font-bold text-lg text-black flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#2B5A45]" /> Dashboard de Ventas y Reportes Comerciales
                  </h2>
                  <p className="text-xs text-gray-600">
                    Cada pedido confirmado se registra como venta. Filtra por mes/año o anual general y descarga reportes por distribuidor o vendedor.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      exportToCSV(
                        salesMode === 'anual'
                          ? `ventas_anual_general_${salesYear}.csv`
                          : `ventas_mensual_${salesYear}_${salesMonth}.csv`,
                        filteredSales.map((o) => ({
                          Folio: o.folio,
                          Fecha: o.fecha,
                          Distribuidor_Cliente: o.cliente,
                          Vendedor_Ejecutivo: o.ejecutivo,
                          Cajas: Array.isArray(o.partidas) ? o.partidas.reduce((s, p) => s + (Number(p.cajas) || 0), 0) : 0,
                          Subtotal: Number(o.subtotal || 0).toFixed(2),
                          Envio: Number(o.envio || 0).toFixed(2),
                          IVA: Number(o.iva || 0).toFixed(2),
                          Total: Number(o.total || 0).toFixed(2)
                        }))
                      )
                    }
                    style={{ backgroundColor: '#2B5A45' }}
                    className="flex items-center gap-1.5 text-white px-3.5 py-2 rounded-lg text-xs font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    {salesMode === 'anual' ? `Descargar Anual (${salesYear})` : `Descargar Mes (${salesYear}-${salesMonth})`}
                  </button>
                </div>
              </div>

              {/* Controles de periodo y tipo de reporte */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="block font-bold mb-1">Periodo</label>
                  <select
                    value={salesMode}
                    onChange={(e) => setSalesMode(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 bg-white text-black font-semibold"
                  >
                    <option value="mensual">Mensual (Mes y Año)</option>
                    <option value="anual">Anual General</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Año</label>
                  <select
                    value={salesYear}
                    onChange={(e) => setSalesYear(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 bg-white text-black"
                  >
                    {availableYears.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                {salesMode === 'mensual' && (
                  <div>
                    <label className="block font-bold mb-1">Mes</label>
                    <select
                      value={salesMonth}
                      onChange={(e) => setSalesMonth(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 bg-white text-black"
                    >
                      <option value="01">Enero</option>
                      <option value="02">Febrero</option>
                      <option value="03">Marzo</option>
                      <option value="04">Abril</option>
                      <option value="05">Mayo</option>
                      <option value="06">Junio</option>
                      <option value="07">Julio</option>
                      <option value="08">Agosto</option>
                      <option value="09">Septiembre</option>
                      <option value="10">Octubre</option>
                      <option value="11">Noviembre</option>
                      <option value="12">Diciembre</option>
                    </select>
                  </div>
                )}

                <div className={salesMode === 'mensual' ? 'md:col-span-2' : 'md:col-span-3'}>
                  <label className="block font-bold mb-1">Vista de Reporte</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setReportType('general')}
                      className={`flex-1 py-2 px-3 rounded-lg border font-semibold ${reportType === 'general' ? 'bg-[#2B5A45] text-white border-[#2B5A45]' : 'bg-white text-black border-gray-300'}`}
                    >
                      Ventas Generales
                    </button>
                    <button
                      onClick={() => setReportType('distribuidor')}
                      className={`flex-1 py-2 px-3 rounded-lg border font-semibold ${reportType === 'distribuidor' ? 'bg-[#2B5A45] text-white border-[#2B5A45]' : 'bg-white text-black border-gray-300'}`}
                    >
                      Por Distribuidor
                    </button>
                    <button
                      onClick={() => setReportType('vendedor')}
                      className={`flex-1 py-2 px-3 rounded-lg border font-semibold ${reportType === 'vendedor' ? 'bg-[#2B5A45] text-white border-[#2B5A45]' : 'bg-white text-black border-gray-300'}`}
                    >
                      Por Vendedor
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-600 block">Ventas Totales (c/IVA)</span>
                <span className="text-2xl font-bold text-black">{formatCurrency(salesKpis.totalVentas)}</span>
                <span className="text-[11px] text-gray-500 block mt-1">{salesKpis.numVentas} ventas registradas</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-600 block">Cajas Vendidas</span>
                <span className="text-2xl font-bold text-black">{salesKpis.totalCajas.toLocaleString('es-MX')}</span>
                <span className="text-[11px] text-gray-500 block mt-1">Subtotal s/IVA: {formatCurrency(salesKpis.subtotalVentas)}</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-600 block">Utilidad Estimada ($)</span>
                <span className="text-2xl font-bold text-[#2B5A45]">{formatCurrency(salesKpis.utilidadTotal)}</span>
                <span className="text-[11px] text-gray-500 block mt-1">Basado en precio de adquisición</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-600 block">Margen Promedio (%)</span>
                <span className="text-2xl font-bold text-black flex items-center gap-1">
                  {salesKpis.margenPct.toFixed(1)}% <Percent className="w-4 h-4 text-[#2B5A45]" />
                </span>
                <span className="text-[11px] text-gray-500 block mt-1">Periodo: {salesMode === 'anual' ? `Año ${salesYear}` : `${salesYear}-${salesMonth}`}</span>
              </div>
            </div>

            {/* Reporte General */}
            {reportType === 'general' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead style={{ backgroundColor: '#2B5A45' }} className="text-white uppercase text-[11px]">
                    <tr>
                      <th className="px-4 py-3">Folio</th>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Distribuidor / Cliente</th>
                      <th className="px-4 py-3">Vendedor / Ejecutivo</th>
                      <th className="px-4 py-3 text-center">Cajas</th>
                      <th className="px-4 py-3 text-right">Subtotal</th>
                      <th className="px-4 py-3 text-right">Total Venta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white text-black">
                    {filteredSales.map((o) => {
                      const cajas = Array.isArray(o.partidas) ? o.partidas.reduce((s, p) => s + (Number(p.cajas) || 0), 0) : 0;
                      return (
                        <tr key={o.id}>
                          <td className="px-4 py-2.5 font-bold">#{o.folio}</td>
                          <td className="px-4 py-2.5">{o.fecha}</td>
                          <td className="px-4 py-2.5 font-semibold">{o.cliente}</td>
                          <td className="px-4 py-2.5">{o.ejecutivo}</td>
                          <td className="px-4 py-2.5 text-center">{cajas}</td>
                          <td className="px-4 py-2.5 text-right">{formatCurrency(o.subtotal)}</td>
                          <td className="px-4 py-2.5 text-right font-bold">{formatCurrency(o.total)}</td>
                        </tr>
                      );
                    })}
                    {filteredSales.length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                          No hay ventas registradas para el periodo seleccionado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Reporte por Distribuidor */}
            {reportType === 'distribuidor' && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">Distribuidor:</span>
                    <select
                      value={selectedDistributorReport}
                      onChange={(e) => setSelectedDistributorReport(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-white text-black"
                    >
                      <option value="Todos">Todos los Distribuidores</option>
                      {distributorSummary.map((d) => (
                        <option key={d.cliente} value={d.cliente}>{d.cliente}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      const rows = selectedDistributorReport === 'Todos'
                        ? distributorSummary
                        : distributorSummary.filter((d) => d.cliente === selectedDistributorReport);
                      exportToCSV(
                        `reporte_distribuidores_${salesMode}_${salesYear}${salesMode === 'mensual' ? `_${salesMonth}` : ''}.csv`,
                        rows.map((r) => ({
                          Distribuidor: r.cliente,
                          Periodo: salesMode === 'anual' ? salesYear : `${salesYear}-${salesMonth}`,
                          Ventas: r.ordenes,
                          Cajas: r.cajas,
                          Subtotal: r.subtotal.toFixed(2),
                          Total: r.total.toFixed(2),
                          Utilidad_Estimada: r.utilidad.toFixed(2)
                        }))
                      );
                    }}
                    style={{ backgroundColor: '#2B5A45' }}
                    className="flex items-center gap-1.5 text-white px-3.5 py-2 rounded-lg text-xs font-semibold"
                  >
                    <Download className="w-4 h-4" /> Descargar Reporte Distribuidor (CSV)
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead style={{ backgroundColor: '#2B5A45' }} className="text-white uppercase text-[11px]">
                      <tr>
                        <th className="px-4 py-3">Distribuidor / Cliente</th>
                        <th className="px-4 py-3 text-center">Órdenes</th>
                        <th className="px-4 py-3 text-center">Cajas</th>
                        <th className="px-4 py-3 text-right">Subtotal</th>
                        <th className="px-4 py-3 text-right">Total Comprado</th>
                        <th className="px-4 py-3 text-right">Utilidad Est.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white text-black">
                      {(selectedDistributorReport === 'Todos'
                        ? distributorSummary
                        : distributorSummary.filter((d) => d.cliente === selectedDistributorReport)
                      ).map((row) => (
                        <tr key={row.cliente}>
                          <td className="px-4 py-2.5 font-bold">{row.cliente}</td>
                          <td className="px-4 py-2.5 text-center">{row.ordenes}</td>
                          <td className="px-4 py-2.5 text-center">{row.cajas}</td>
                          <td className="px-4 py-2.5 text-right">{formatCurrency(row.subtotal)}</td>
                          <td className="px-4 py-2.5 text-right font-bold">{formatCurrency(row.total)}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-[#2B5A45]">{formatCurrency(row.utilidad)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Reporte por Vendedor / Ejecutivo */}
            {reportType === 'vendedor' && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">Vendedor / Ejecutivo:</span>
                    <select
                      value={selectedSellerReport}
                      onChange={(e) => setSelectedSellerReport(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-white text-black"
                    >
                      <option value="Todos">Todos los Vendedores</option>
                      {sellerSummary.map((s) => (
                        <option key={s.vendedor} value={s.vendedor}>{s.vendedor}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      const rows = selectedSellerReport === 'Todos'
                        ? sellerSummary
                        : sellerSummary.filter((s) => s.vendedor === selectedSellerReport);
                      exportToCSV(
                        `reporte_vendedores_${salesMode}_${salesYear}${salesMode === 'mensual' ? `_${salesMonth}` : ''}.csv`,
                        rows.map((r) => ({
                          Vendedor: r.vendedor,
                          Periodo: salesMode === 'anual' ? salesYear : `${salesYear}-${salesMonth}`,
                          Ventas: r.ordenes,
                          Cajas: r.cajas,
                          Subtotal: r.subtotal.toFixed(2),
                          Total_Vendido: r.total.toFixed(2),
                          Utilidad_Estimada: r.utilidad.toFixed(2)
                        }))
                      );
                    }}
                    style={{ backgroundColor: '#2B5A45' }}
                    className="flex items-center gap-1.5 text-white px-3.5 py-2 rounded-lg text-xs font-semibold"
                  >
                    <Download className="w-4 h-4" /> Descargar Reporte Vendedor (CSV)
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead style={{ backgroundColor: '#2B5A45' }} className="text-white uppercase text-[11px]">
                      <tr>
                        <th className="px-4 py-3">Vendedor / Ejecutivo</th>
                        <th className="px-4 py-3 text-center">Ventas</th>
                        <th className="px-4 py-3 text-center">Cajas</th>
                        <th className="px-4 py-3 text-right">Subtotal</th>
                        <th className="px-4 py-3 text-right">Total Vendido</th>
                        <th className="px-4 py-3 text-right">Utilidad Est.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white text-black">
                      {(selectedSellerReport === 'Todos'
                        ? sellerSummary
                        : sellerSummary.filter((s) => s.vendedor === selectedSellerReport)
                      ).map((row) => (
                        <tr key={row.vendedor}>
                          <td className="px-4 py-2.5 font-bold">{row.vendedor}</td>
                          <td className="px-4 py-2.5 text-center">{row.ordenes}</td>
                          <td className="px-4 py-2.5 text-center">{row.cajas}</td>
                          <td className="px-4 py-2.5 text-right">{formatCurrency(row.subtotal)}</td>
                          <td className="px-4 py-2.5 text-right font-bold">{formatCurrency(row.total)}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-[#2B5A45]">{formatCurrency(row.utilidad)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: COTIZADOR (Con Fecha igual que en Pedido) */}
        {activeTab === 'cotizador' && (
          <div className="space-y-4">
            <div className="no-print bg-white p-4 rounded-xl border border-gray-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
                <h2 className="font-bold text-black">Configuración de Cotización</h2>
                <button
                  onClick={() => window.print()}
                  style={{ backgroundColor: '#2B5A45' }}
                  className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-95"
                >
                  <Printer className="w-4 h-4" /> Imprimir / Guardar PDF Horizontal
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-black mb-1">Cliente / Distribuidor Base</label>
                  <select
                    value={cotClientId}
                    onChange={(e) => handleSelectCotClient(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white text-black"
                  >
                    <option value="">-- Cliente Nuevo / Sin Descuento --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black mb-1">Modalidad de Impresión</label>
                  <select
                    value={cotImpresion}
                    onChange={(e) => setCotImpresion(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white font-semibold text-black"
                  >
                    {MODALIDADES_IMPRESION.map((m) => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black mb-1">Ejecutivo que Firma</label>
                  <select
                    value={cotEjecutivoId}
                    onChange={(e) => setCotEjecutivoId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white text-black"
                  >
                    {ejecutivos.map((ej) => (
                      <option key={ej.id} value={ej.id}>{ej.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black mb-1">Filtrar catálogo de SKUs</label>
                  <div className="flex gap-1">
                    <select
                      value={filterSize}
                      onChange={(e) => setFilterSize(e.target.value)}
                      className="w-1/2 border border-gray-300 rounded-lg p-2 text-xs bg-white text-black"
                    >
                      {TAMANOS_FILTER.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select
                      value={filterMaterial}
                      onChange={(e) => setFilterMaterial(e.target.value)}
                      className="w-1/2 border border-gray-300 rounded-lg p-2 text-xs bg-white text-black"
                    >
                      {MATERIALES_FILTER.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* DOCUMENTO DE COTIZACIÓN */}
            <div className="bg-white border border-gray-300 max-w-6xl mx-auto p-6 space-y-5 text-black">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-gray-300 pb-4">
                <div className="shrink-0">
                  <img
                    src={toDirectDriveImg(LOGO_LA_PAJARITA_URL)}
                    alt="Logo La Pajarita"
                    className="h-16 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 flex-1 text-xs">
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-black">NOMBRE CLIENTE</span>
                    <input
                      type="text"
                      placeholder="Nombre o Razón Social"
                      value={cotClienteManual}
                      onChange={(e) => setCotClienteManual(e.target.value)}
                      className="w-full font-bold text-black bg-white border-b border-gray-300 focus:border-black outline-none py-0.5"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-black">NOMBRE DE CONTACTO</span>
                    <input
                      type="text"
                      placeholder="Nombre de contacto"
                      value={cotContactoManual}
                      onChange={(e) => setCotContactoManual(e.target.value)}
                      className="w-full text-black bg-white border-b border-gray-300 focus:border-black outline-none py-0.5"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-black">TELÉFONO</span>
                    <input
                      type="text"
                      placeholder="Teléfono"
                      value={cotTelefonoManual}
                      onChange={(e) => setCotTelefonoManual(e.target.value)}
                      className="w-full text-black bg-white border-b border-gray-300 focus:border-black outline-none py-0.5"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-black">CORREO</span>
                    <input
                      type="text"
                      placeholder="correo@cliente.com"
                      value={cotCorreoManual}
                      onChange={(e) => setCotCorreoManual(e.target.value)}
                      className="w-full text-black bg-white border-b border-gray-300 focus:border-black outline-none py-0.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <span className="block text-[10px] font-bold uppercase text-black">DIRECCIÓN DE ENVÍO</span>
                    <input
                      type="text"
                      placeholder="Ciudad / Dirección de entrega"
                      value={cotDireccionManual}
                      onChange={(e) => setCotDireccionManual(e.target.value)}
                      className="w-full text-black bg-white border-b border-gray-300 focus:border-black outline-none py-0.5"
                    />
                  </div>
                </div>

                <div className="text-right shrink-0 flex flex-col justify-between">
                  <div>
                    <span
                      style={{ backgroundColor: '#2B5A45' }}
                      className="inline-block text-white text-xs font-bold tracking-widest px-3 py-1 uppercase"
                    >
                      COTIZACIÓN
                    </span>
                    <p className="text-[11px] text-black mt-1">
                      Folio: <input type="number" value={cotFolio} onChange={(e) => setCotFolio(e.target.value)} className="w-16 text-right font-bold text-black bg-white" />
                    </p>
                  </div>
                  <div className="mt-2">
                    <span className="block text-[10px] font-bold uppercase text-black">FECHA DE COTIZACIÓN</span>
                    <input
                      type="date"
                      value={cotFecha}
                      onChange={(e) => setCotFecha(e.target.value)}
                      className="text-xs font-semibold text-black bg-white border-b border-gray-300 text-right outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse bg-white text-black">
                  <thead>
                    <tr style={{ backgroundColor: '#2B5A45' }} className="text-white uppercase text-[10px]">
                      <th className="p-2 text-left">SKU</th>
                      <th className="p-2 text-left">Producto</th>
                      <th className="p-2 text-center">Presentación</th>
                      <th className="p-2 text-center">Cant.</th>
                      <th className="p-2 text-center">Uds x Paq</th>
                      <th className="p-2 text-center">Paq x Caja</th>
                      <th className="p-2 text-center">Total Uds</th>
                      <th className="p-2 text-right">Precio Unitario</th>
                      <th className="p-2 text-right">Precio Paq/Caja</th>
                      <th className="p-2 text-center">Impresión</th>
                      <th className="p-2 text-right">Total Importe</th>
                      <th className="p-2 no-print"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 border-b border-gray-300 bg-white text-black">
                    {cotItems.map((row, idx) => {
                      const prod = inventory.find((p) => p.sku === row.sku);
                      const calc = calcLineCotizacion(prod, row.unidadVenta, Number(row.cantidad) || 0);
                      return (
                        <tr key={idx} className="bg-white">
                          <td className="p-1.5 font-mono font-bold text-black">
                            <select
                              value={row.sku}
                              onChange={(e) => {
                                const up = [...cotItems];
                                up[idx].sku = e.target.value;
                                setCotItems(up);
                              }}
                              className="border border-gray-300 rounded p-1 font-mono text-[11px] w-28 bg-white text-black"
                            >
                              <option value="">SKU...</option>
                              {filteredInventory.map((p) => (
                                <option key={p.sku} value={p.sku}>{p.sku}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-1.5 text-[10px] leading-tight max-w-[190px] text-black">{prod?.descripcion || '-'}</td>
                          <td className="p-1.5 text-center">
                            <select
                              value={row.unidadVenta}
                              onChange={(e) => {
                                const up = [...cotItems];
                                up[idx].unidadVenta = e.target.value;
                                setCotItems(up);
                              }}
                              className="border border-gray-300 rounded p-1 text-[10px] bg-white text-black"
                            >
                              <option value="caja">Caja</option>
                              <option value="paquete">Paquete</option>
                            </select>
                          </td>
                          <td className="p-1.5 text-center">
                            <input
                              type="number"
                              min="1"
                              value={row.cantidad}
                              onChange={(e) => {
                                const up = [...cotItems];
                                up[idx].cantidad = e.target.value;
                                setCotItems(up);
                              }}
                              className="border border-gray-300 rounded p-1 w-12 text-center font-semibold bg-white text-black"
                            />
                          </td>
                          <td className="p-1.5 text-center text-black">{prod?.uPq || 0}</td>
                          <td className="p-1.5 text-center text-black">{prod?.pCaja || 0}</td>
                          <td className="p-1.5 text-center font-medium text-black">{calc.totalUds.toLocaleString('es-MX')}</td>
                          <td className="p-1.5 text-right text-black">{formatCurrency(calc.precioUnitarioPieza, 4)}</td>
                          <td className="p-1.5 text-right font-medium text-black">{formatCurrency(calc.precioNormalUnidad)}</td>
                          <td className="p-1.5 text-center text-[10px] text-black">{modalidadShort}</td>
                          <td className="p-1.5 text-right font-bold text-black">{formatCurrency(calc.importeNormal)}</td>
                          <td className="p-1.5 text-center no-print">
                            <button onClick={() => setCotItems(cotItems.filter((_, i) => i !== idx))} className="text-red-600">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <button
                onClick={() => setCotItems([...cotItems, { sku: '', unidadVenta: 'caja', cantidad: 1 }])}
                className="no-print flex items-center gap-1 text-xs text-black font-bold hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar renglón
              </button>

              <div className="flex flex-col md:flex-row justify-between items-start gap-6 pt-2">
                <div className="flex-1 space-y-4">
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-black mb-1">NOTAS:</span>
                    <textarea
                      rows="10"
                      value={cotNotas}
                      onChange={(e) => setCotNotas(e.target.value)}
                      className="no-print w-full text-[10px] leading-relaxed text-black border border-gray-300 rounded p-2 bg-white"
                    />
                    <div className="hidden print:block text-[10px] leading-relaxed text-black whitespace-pre-line">
                      {cotNotas}
                    </div>
                  </div>

                  {/* Únicamente la imagen de la firma digital */}
                  <div className="pt-2">
                    {ejecutivoActual?.firmaUrl && (
                      <img
                        src={toDirectDriveImg(ejecutivoActual.firmaUrl)}
                        alt="Firma autorizada"
                        className="h-20 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                </div>

                <div className="w-full md:w-64 shrink-0 self-end">
                  <table className="w-full text-xs border border-gray-300 bg-white text-black">
                    <tbody className="divide-y divide-gray-300">
                      <tr className="bg-white">
                        <td className="p-2 font-bold text-black">SUBTOTAL</td>
                        <td className="p-2 text-right font-semibold text-black">{formatCurrency(cotSubtotalNormal)}</td>
                      </tr>
                      {cotDescuentoMonto > 0 && (
                        <tr className="bg-white">
                          <td className="p-2 font-bold text-black">DESCUENTO</td>
                          <td className="p-2 text-right font-semibold text-black">- {formatCurrency(cotDescuentoMonto)}</td>
                        </tr>
                      )}
                      <tr className="bg-white">
                        <td className="p-2 font-bold text-black">IVA (16%)</td>
                        <td className="p-2 text-right font-semibold text-black">{formatCurrency(cotIva)}</td>
                      </tr>
                      <tr style={{ backgroundColor: '#2B5A45' }} className="text-white">
                        <td className="p-2.5 font-bold">TOTAL GENERAL</td>
                        <td className="p-2.5 text-right font-bold text-sm">{formatCurrency(cotTotalGeneral)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DISTRIBUIDORES (Solo Admin) */}
        {isAdmin && activeTab === 'clientes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
              <h2 className="font-bold text-lg text-black">Clientes y Distribuidores</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => exportToCSV('clientes_distribuidores.csv', clients)}
                  className="flex items-center gap-2 bg-white border border-gray-300 text-black px-3 py-2 rounded-lg text-xs"
                >
                  <Download className="w-4 h-4" /> Exportar CSV
                </button>
                <button
                  onClick={() => setShowClientModal(true)}
                  style={{ backgroundColor: '#2B5A45' }}
                  className="flex items-center gap-2 text-white px-3 py-2 rounded-lg text-xs"
                >
                  <Plus className="w-4 h-4" /> Nuevo Cliente
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead style={{ backgroundColor: '#2B5A45' }} className="text-white text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Razón Social</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3 text-center">% Descuento</th>
                    <th className="px-4 py-3">Contacto</th>
                    <th className="px-4 py-3">Correo / Teléfono</th>
                    <th className="px-4 py-3">Dirección</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white text-black">
                  {clients.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-3 font-semibold">{c.nombre}</td>
                      <td className="px-4 py-3">{c.tipo}</td>
                      <td className="px-4 py-3 text-center font-bold">{c.descuento}%</td>
                      <td className="px-4 py-3">{c.contacto}</td>
                      <td className="px-4 py-3 text-xs">{c.correo} {c.telefono && `• ${c.telefono}`}</td>
                      <td className="px-4 py-3 text-xs">{c.direccion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: EJECUTIVOS Y FIRMAS (Solo Admin) */}
        {isAdmin && activeTab === 'ejecutivos' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
              <div>
                <h2 className="font-bold text-lg text-black">Ejecutivos y Firmas Digitales</h2>
                <p className="text-xs text-gray-600">Las 5 firmas ya están precargadas; puedes actualizar cualquier enlace de Google Drive aquí.</p>
              </div>
              <button
                onClick={() => setShowEjecModal(true)}
                style={{ backgroundColor: '#2B5A45' }}
                className="flex items-center gap-2 text-white px-3 py-2 rounded-lg text-xs"
              >
                <Plus className="w-4 h-4" /> Agregar Ejecutivo
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ejecutivos.map((ej) => (
                <div key={ej.id} className="bg-white p-4 rounded-xl border border-gray-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-black">{ej.nombre}</h3>
                    <button
                      onClick={() => deleteDoc(doc(db, 'ejecutivos', ej.id))}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="border border-gray-200 rounded p-2 bg-white h-24 flex items-center justify-center">
                    {ej.firmaUrl ? (
                      <img src={toDirectDriveImg(ej.firmaUrl)} alt={ej.nombre} className="max-h-20 object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-xs text-gray-400">Sin firma cargada</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: SOLICITUD DE PEDIDO A BODEGA (Solo Admin) */}
        {isAdmin && activeTab === 'pedido' && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 max-w-6xl mx-auto space-y-6 text-black">
            <div className="flex flex-wrap justify-between items-center border-b border-gray-300 pb-4 gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={toDirectDriveImg(LOGO_LA_PAJARITA_URL)}
                  alt="La Pajarita"
                  className="h-12 object-contain"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h2 className="text-xl font-bold text-black">Solicitud de Pedido a Bodega</h2>
                  <p className="text-xs text-gray-600">Descuenta automáticamente existencias y registra la venta en el dashboard</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => window.print()}
                  className="no-print flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-black px-3.5 py-2 rounded-lg text-xs font-semibold"
                >
                  <Printer className="w-4 h-4" /> Descargar / Imprimir PDF
                </button>
                <div className="text-right">
                  <span className="text-xs text-gray-600 block">Folio Pedido</span>
                  <span className="text-xl font-bold text-black">#{ordFolio}</span>
                  <div className="mt-1">
                    <input
                      type="date"
                      value={ordFecha}
                      onChange={(e) => setOrdFecha(e.target.value)}
                      className="text-xs font-semibold text-black bg-white border border-gray-300 rounded px-2 py-0.5"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="no-print flex flex-wrap items-center gap-2 bg-white p-3 rounded-lg border border-gray-200 text-xs">
              <span className="font-semibold text-black">Filtrar SKUs:</span>
              <input
                type="text"
                placeholder="Buscar SKU o palabra..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 bg-white text-black"
              />
              <select value={filterSize} onChange={(e) => setFilterSize(e.target.value)} className="border border-gray-300 rounded px-2 py-1 bg-white text-black">
                {TAMANOS_FILTER.map((t) => <option key={t} value={t}>Tamaño: {t}</option>)}
              </select>
              <select value={filterMaterial} onChange={(e) => setFilterMaterial(e.target.value)} className="border border-gray-300 rounded px-2 py-1 bg-white text-black">
                {MATERIALES_FILTER.map((m) => <option key={m} value={m}>Material: {m}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg border border-gray-200">
              <div>
                <label className="block text-xs font-semibold text-black mb-1">Cliente / Distribuidor *</label>
                <select
                  value={ordClientId}
                  onChange={(e) => setOrdClientId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white text-black"
                >
                  <option value="">-- Seleccionar --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre} ({c.descuento}% desc)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-black mb-1">¿Recoge en Bodega?</label>
                <select
                  value={ordRecoge}
                  onChange={(e) => setOrdRecoge(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white text-black"
                >
                  <option value="NO">NO (Requiere envío)</option>
                  <option value="SI">SÍ (Recoge cliente)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-black mb-1">Ejecutivo Responsable</label>
                <select
                  value={ordEjecutivo}
                  onChange={(e) => setOrdEjecutivo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm bg-white text-black"
                >
                  {ejecutivos.map((ej) => (
                    <option key={ej.id} value={ej.nombre}>{ej.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm bg-white text-black">
                <thead style={{ backgroundColor: '#2B5A45' }} className="text-white text-xs uppercase">
                  <tr>
                    <th className="p-2 text-left">SKU</th>
                    <th className="p-2 text-left">Producto</th>
                    <th className="p-2 text-center">Stock</th>
                    <th className="p-2 text-center">Cajas</th>
                    <th className="p-2 text-center">% Desc</th>
                    <th className="p-2 text-right">Precio Final</th>
                    <th className="p-2 text-right">Subtotal</th>
                    <th className="p-2 no-print"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 border-b border-gray-300">
                  {ordItems.map((row, idx) => {
                    const prod = inventory.find((p) => p.sku === row.sku);
                    const descPct = row.customDesc !== null ? Number(row.customDesc) : Number(selectedOrdClient?.descuento || 0);
                    const precioFinal = prod ? (Number(prod.costoCaja) || 0) * (1 - descPct / 100) : 0;
                    const excede = prod && Number(row.cajas) > Number(prod.stock);
                    return (
                      <tr key={idx}>
                        <td className="p-2">
                          <select
                            value={row.sku}
                            onChange={(e) => {
                              const up = [...ordItems];
                              up[idx].sku = e.target.value;
                              setOrdItems(up);
                            }}
                            className="border border-gray-300 rounded p-1.5 font-mono text-sm w-36 bg-white text-black"
                          >
                            <option value="">SKU...</option>
                            {filteredInventory.map((p) => (
                              <option key={p.sku} value={p.sku}>{p.sku}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2 text-xs text-black">{prod?.descripcion || '-'}</td>
                        <td className="p-2 text-center font-semibold">
                          {prod ? (
                            <span className={excede ? 'text-red-600' : 'text-black'}>
                              {prod.stock} {excede && <AlertTriangle className="w-3.5 h-3.5 inline" />}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            min="1"
                            value={row.cajas}
                            onChange={(e) => {
                              const up = [...ordItems];
                              up[idx].cajas = e.target.value;
                              setOrdItems(up);
                            }}
                            className="border border-gray-300 rounded p-1 w-20 text-center bg-white text-black"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={descPct}
                            onChange={(e) => {
                              const up = [...ordItems];
                              up[idx].customDesc = e.target.value;
                              setOrdItems(up);
                            }}
                            className="border border-gray-300 rounded p-1 w-16 text-center bg-white text-black"
                          />
                        </td>
                        <td className="p-2 text-right text-black">{formatCurrency(precioFinal)}</td>
                        <td className="p-2 text-right font-bold text-black">{formatCurrency(precioFinal * (Number(row.cajas) || 0))}</td>
                        <td className="p-2 text-center no-print">
                          <button onClick={() => setOrdItems(ordItems.filter((_, i) => i !== idx))} className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setOrdItems([...ordItems, { sku: '', cajas: 1, customDesc: null }])}
              className="no-print flex items-center gap-1 text-sm text-black font-semibold hover:underline"
            >
              <Plus className="w-4 h-4" /> Agregar SKU al pedido
            </button>

            <div className="flex flex-col md:flex-row justify-between items-end gap-6 pt-4 border-t border-gray-300">
              <button
                onClick={handleConfirmOrder}
                style={{ backgroundColor: '#2B5A45' }}
                className="no-print flex items-center gap-2 hover:opacity-95 text-white px-6 py-3 rounded-xl font-bold shadow"
              >
                <CheckCircle2 className="w-5 h-5" /> Confirmar Pedido y Descontar Inventario
              </button>

              <div className="w-full md:w-80 bg-white p-4 rounded-lg border border-gray-300 space-y-2 text-black ml-auto">
                <div className="flex justify-between text-sm">
                  <span>Subtotal Productos:</span>
                  <span className="font-medium">{formatCurrency(ordSubtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Costo de Envío:</span>
                  <input
                    type="number"
                    min="0"
                    value={ordEnvio}
                    onChange={(e) => setOrdEnvio(e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 w-28 text-right bg-white text-black"
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA (16%):</span>
                  <span className="font-medium">{formatCurrency(ordIva)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2 text-black">
                  <span>Total Pedido:</span>
                  <span>{formatCurrency(ordTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: RÉCORD DE PEDIDOS (Solo Admin) */}
        {isAdmin && activeTab === 'record' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
              <h2 className="font-bold text-lg text-black">Récord Histórico de Órdenes Confirmadas</h2>
              <button
                onClick={() =>
                  exportToCSV(
                    'record_pedidos_la_pajarita.csv',
                    orders.map((o) => ({
                      Folio: o.folio,
                      Fecha: o.fecha,
                      Cliente: o.cliente,
                      Ejecutivo: o.ejecutivo,
                      Recoge: o.recogeBodega,
                      Subtotal: o.subtotal,
                      Envio: o.envio,
                      IVA: o.iva,
                      Total: o.total
                    }))
                  )
                }
                style={{ backgroundColor: '#2B5A45' }}
                className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-xs"
              >
                <Download className="w-4 h-4" /> Descargar Récord (CSV)
              </button>
            </div>

            <div className="space-y-3">
              {orders.map((ord) => (
                <div key={ord.id} className="bg-white p-4 rounded-xl border border-gray-200 text-black">
                  <div className="flex flex-wrap justify-between items-center border-b border-gray-200 pb-2 mb-2 gap-3">
                    <div>
                      <span className="font-bold mr-3">Pedido #{ord.folio}</span>
                      <span className="font-semibold">{ord.cliente}</span>
                      <span className="text-xs text-gray-600 ml-3">{ord.fecha} • Ejecutivo: {ord.ejecutivo}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right font-bold">
                        Total: {formatCurrency(ord.total)}{' '}
                        <span className="text-xs font-normal text-gray-600">(Envío: {formatCurrency(ord.envio)})</span>
                      </div>
                      <button
                        onClick={() => handleDeleteOrder(ord)}
                        title="Eliminar pedido y regresar stock al inventario"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Eliminar
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-black space-y-1">
                    {ord.partidas?.map((p, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span><strong>{p.sku}</strong> — {p.descripcion} ({p.cajas} cajas, {p.descuentoPct}% desc)</span>
                        <span>{formatCurrency(p.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-center text-gray-500 py-8">Aún no hay pedidos registrados en el historial.</p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modales exclusivos de Administrador */}
      {isAdmin && showProdModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveProduct} className="bg-white rounded-xl p-6 max-w-md w-full space-y-3 text-black">
            <h3 className="font-bold text-lg">Agregar / Actualizar SKU</h3>
            <input required placeholder="SKU" value={newProd.sku} onChange={(e) => setNewProd({ ...newProd, sku: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
            <input required placeholder="Descripción" value={newProd.descripcion} onChange={(e) => setNewProd({ ...newProd, descripcion: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs">STOCK (Cajas)</label>
                <input type="number" value={newProd.stock} onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
              </div>
              <div>
                <label className="text-xs">Precio por Paq ($)</label>
                <input type="number" step="0.01" value={newProd.precioPaq} onChange={(e) => setNewProd({ ...newProd, precioPaq: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
              </div>
              <div>
                <label className="text-xs">Costo por Caja ($)</label>
                <input type="number" step="0.01" value={newProd.costoCaja} onChange={(e) => setNewProd({ ...newProd, costoCaja: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
              </div>
              <div>
                <label className="text-xs">Precio Adquisición ($)</label>
                <input type="number" step="0.01" value={newProd.costoAdquisicion} onChange={(e) => setNewProd({ ...newProd, costoAdquisicion: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
              </div>
              <div>
                <label className="text-xs">U/PQ</label>
                <input type="number" value={newProd.uPq} onChange={(e) => setNewProd({ ...newProd, uPq: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
              </div>
              <div>
                <label className="text-xs">P/CAJA</label>
                <input type="number" value={newProd.pCaja} onChange={(e) => setNewProd({ ...newProd, pCaja: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowProdModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancelar</button>
              <button type="submit" style={{ backgroundColor: '#2B5A45' }} className="px-4 py-2 text-sm text-white rounded-lg font-medium">Guardar</button>
            </div>
          </form>
        </div>
      )}

      {isAdmin && showClientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveClient} className="bg-white rounded-xl p-6 max-w-md w-full space-y-3 text-black">
            <h3 className="font-bold text-lg">Nuevo Cliente o Distribuidor</h3>
            <input required placeholder="Razón Social o Nombre" value={newClient.nombre} onChange={(e) => setNewClient({ ...newClient, nombre: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
            <div className="grid grid-cols-2 gap-3">
              <select value={newClient.tipo} onChange={(e) => setNewClient({ ...newClient, tipo: e.target.value })} className="border border-gray-300 rounded p-2 text-sm bg-white">
                <option value="Distribuidor">Distribuidor</option>
                <option value="Cliente Directo">Cliente Directo</option>
              </select>
              <input type="number" placeholder="% Descuento" value={newClient.descuento} onChange={(e) => setNewClient({ ...newClient, descuento: e.target.value })} className="border border-gray-300 rounded p-2 text-sm bg-white" />
            </div>
            <input placeholder="Contacto" value={newClient.contacto} onChange={(e) => setNewClient({ ...newClient, contacto: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
            <input placeholder="Correo" value={newClient.correo} onChange={(e) => setNewClient({ ...newClient, correo: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
            <input placeholder="Teléfono" value={newClient.telefono} onChange={(e) => setNewClient({ ...newClient, telefono: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
            <input placeholder="Dirección de Entrega" value={newClient.direccion} onChange={(e) => setNewClient({ ...newClient, direccion: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowClientModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancelar</button>
              <button type="submit" style={{ backgroundColor: '#2B5A45' }} className="px-4 py-2 text-sm text-white rounded-lg font-medium">Guardar</button>
            </div>
          </form>
        </div>
      )}

      {isAdmin && showEjecModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveEjecutivo} className="bg-white rounded-xl p-6 max-w-md w-full space-y-3 text-black">
            <h3 className="font-bold text-lg">Agregar Ejecutivo y Firma</h3>
            <input required placeholder="Nombre Completo" value={newEjec.nombre} onChange={(e) => setNewEjec({ ...newEjec, nombre: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
            <input required placeholder="Enlace de Firma en Google Drive" value={newEjec.firmaUrl} onChange={(e) => setNewEjec({ ...newEjec, firmaUrl: e.target.value })} className="w-full border border-gray-300 rounded p-2 text-sm bg-white" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowEjecModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancelar</button>
              <button type="submit" style={{ backgroundColor: '#2B5A45' }} className="px-4 py-2 text-sm text-white rounded-lg font-medium">Guardar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
