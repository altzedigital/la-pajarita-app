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
  Filter
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

// Únicos correos con permisos de edición, precios, valor de stock y pedidos
const ADMIN_EMAILS = [
  'contacto@la-pajarita.com.mx',
  'eduardo@la-pajarita.com.mx'
];

// Helper para convertir links de Drive en URL directa que nunca se rompe en <img>
const toDirectDriveImg = (url) => {
  if (!url) return '';
  const match = url.match(/\/d\/([^/]+)|id=([^&]+)/);
  const fileId = match ? (match[1] || match[2]) : null;
  return fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : url;
};

// Catálogo inicial migrado de tu inventario (39 SKUs)
const INITIAL_INVENTORY = [
  { sku: '100BLBANE400', descripcion: 'MI MANTELES 100X100 400 HJS. BALI NEGRO', stock: 0, costoCaja: 0, uPq: 0, pCaja: 0 },
  { sku: '20AI2T', descripcion: 'SERV 20X20 AIRLAID 20 PAQ DE 70 HJS. BLANCO', stock: 0, costoCaja: 0, uPq: 0, pCaja: 0 },
  { sku: '20AZM', descripcion: 'PAQ. SERV. 20x20 2/C MICROPUNTO PAPEL BASIC AZUL MAR 20PQ.100H. PLEGADO 1/4', stock: 82, costoCaja: 973.49, uPq: 100, pCaja: 1 },
  { sku: '20BLM', descripcion: 'PAQ. SERV. 20x20 2/C MICROPUNTO PAPEL BASIC 20PQ.100H. BLANCO PLEGADO 1/4', stock: 24, costoCaja: 973.49, uPq: 100, pCaja: 1 },
  { sku: '20GOM/20PG', descripcion: 'PAQ. SERV. 20x20 MICROPUNTO GO GREEN PAPEL RECICLADO 20 PQ.100H PLEGADO 1/4', stock: 75, costoCaja: 1322.33, uPq: 100, pCaja: 20 },
  { sku: '20NEM/20PNE', descripcion: 'PAQ. SERV. 20x20 2/C MICROPUNTO PUNTA-PUNTA PAPEL BASIC 32PQ.100H. NEGRA PLEGADO 1/4', stock: 14, costoCaja: 1736.87, uPq: 100, pCaja: 20 },
  { sku: '20PAZ', descripcion: 'PAQ. SERV. 20x20 PUNTA-PUNTA DE PAPEL BASIC AZUL 32PQ.100H. PLEGADO 1/4', stock: 3, costoCaja: 1736.87, uPq: 100, pCaja: 20 },
  { sku: '20PBL', descripcion: 'PAQ. SERV. 20x20 PUNTA-PUNTA DE PAPEL BASIC BLANCA 32PQ.100H. PLEGADO 1/4', stock: 39, costoCaja: 1322.33, uPq: 100, pCaja: 32 },
  { sku: '20PBLI2T', descripcion: 'PAQ. SERV. 20X20 PUNTA BCA 48 PAQ DE 100 HJS.', stock: 0, costoCaja: 0, uPq: 0, pCaja: 0 },
  { sku: '20PG', descripcion: 'PAQ. SERV. 20x20 PUNTA-PUNTA GO GREEN PAPEL RECICLADO 32PQ.100H. PLEGADO 1/4', stock: 33, costoCaja: 1322.33, uPq: 100, pCaja: 32 },
  { sku: '20PNE', descripcion: 'PAQ. SERV. 20x20 PUNTA-PUNTA PAPEL BASIC NEGRO 32PQ.100H. PLEGADO 1/4', stock: 33, costoCaja: 1736.87, uPq: 100, pCaja: 20 },
  { sku: '20PNEI', descripcion: 'PAQ. SERV. 20x20 PUNTA-PUNTA NEGRO IMPRESO 1 TINTA 48 PQ. 100', stock: 0, costoCaja: 0, uPq: 100, pCaja: 0 },
  { sku: '20PNEPA', descripcion: 'PAQ. SERV. 20x20 PUNTA-PUNTA NEGRO 20PQ.120H. PLEGADO AMERICANO', stock: 3, costoCaja: 1736.87, uPq: 120, pCaja: 20 },
  { sku: '20ROM', descripcion: 'PAQ. SERV. 20x20 2/C MICROPUNTO PAPEL BASIC ROJO 20 PQ.100H. PLEGADO 1/4', stock: 90, costoCaja: 1736.87, uPq: 100, pCaja: 16 },
  { sku: '20VOM', descripcion: 'PAQ. SERV. 20x20 2/C MICROPUNTO PAPEL BASIC VERDE OSCURO 20PQ.100H. PLEGADO 1/4', stock: 56, costoCaja: 1736.87, uPq: 100, pCaja: 16 },
  { sku: '2535ago', descripcion: 'MANTELES 25X35 AIRLAID GO GREEN 800 UD.', stock: 70, costoCaja: 2785.39, uPq: 800, pCaja: 1 },
  { sku: '2535ANE', descripcion: 'MANTELES 25X35 AIRLAID NEGRO 800 UD.', stock: 71, costoCaja: 4039.35, uPq: 800, pCaja: 20 },
  { sku: '2535FAZ50', descripcion: 'MIL MANTELES 25x35 50 GR. BLANCO+AZUL', stock: 46, costoCaja: 2458.56, uPq: 1000, pCaja: 12 },
  { sku: '2535FNE50', descripcion: 'MIL MANTELES 25x35 50 GR. BLANCO+NEGRO', stock: 47, costoCaja: 2458.56, uPq: 1000, pCaja: 24 },
  { sku: '2535FRO50', descripcion: 'MIL MANTELES 25x35 50 GR. ROJO BLANCO+ROJO', stock: 46, costoCaja: 2458.56, uPq: 1000, pCaja: 24 },
  { sku: '25PBL', descripcion: 'PAQ. SERV. 25x25 PUNTA-PUNTA PAPEL BASIC BLANCA 63 PQ. 50 H. PLEGADO 1/4', stock: 0, costoCaja: 1791.23, uPq: 50, pCaja: 20 },
  { sku: '25PBLI', descripcion: 'PAQ. SERV. 25x25 PUNTA-PUNTA BLANCO', stock: 24, costoCaja: 1791.23, uPq: 50, pCaja: 20 },
  { sku: '25PG', descripcion: 'PAQ. SERV. 25x25 PUNTA-PUNTA PAPEL RECICLADO GO GREEN 63 PQ. 50 H. PLEGADO 1/4', stock: 55, costoCaja: 1875.27, uPq: 50, pCaja: 20 },
  { sku: '25PNE', descripcion: 'PAQ. SERV. 25x25 PUNTA-PUNTA PAPEL BASIC NEGRO 63 PQ. 50 H. PLEGADO 1/4', stock: 0, costoCaja: 2458.23, uPq: 50, pCaja: 12 },
  { sku: '3040PBL', descripcion: 'PAQ. SERV. 30x40 PUNTA-PUNTA PAPEL BASIC BLANCA 48PQ. PAQ. 50 H. PLEGADO 1/6', stock: 0, costoCaja: 2017.01, uPq: 50, pCaja: 48 },
  { sku: '3040PBLI2T', descripcion: 'PAQ. SERV. 30X40 PUNTA BCA 24 PAQ DE 50 HJS.', stock: 0, costoCaja: 0, uPq: 0, pCaja: 0 },
  { sku: '3040PBLNAAZ', descripcion: 'PAQ. SERV. 30x40 PUNTA-PUNTA NAPOLES AZUL 24PQ. PAQ. 50H. PLEGADO 1/6', stock: 1, costoCaja: 1190.60, uPq: 50, pCaja: 6 },
  { sku: '3040PBLNANE', descripcion: 'PAQ. SERV. 30x40 PUNTA-PUNTA NAPOLES NEGRO 24PQ. PAQ. 50H. PLEGADO 1/6', stock: 38, costoCaja: 1190.60, uPq: 50, pCaja: 6 },
  { sku: '3040PBLNARO', descripcion: 'PAQ. SERV. 30x40 PUNTA-PUNTA NAPOLES ROJO 24PQ. PAQ. 50H. PLEGADO 1/6', stock: 37, costoCaja: 1190.60, uPq: 50, pCaja: 6 },
  { sku: '3040PBLNAVE', descripcion: 'PAQ. SERV. 30x40 PUNTA-PUNTA NAPOLES VERDE 24PQ. PAQ. 50H. PLEGADO 1/6', stock: 1, costoCaja: 1190.60, uPq: 50, pCaja: 6 },
  { sku: '3040PG', descripcion: 'PAQ. SERV. 30x40 PUNTA-PUNTA PAPEL RECICLADO GO GREEN 48 PQ. PAQ. 50 H. PLEGADO 1/6', stock: 142, costoCaja: 1976.99, uPq: 50, pCaja: 20 },
  { sku: '332GTRNE', descripcion: 'PAQ. SERV. 33x33 2/C PUNTA-PUNTA PAPEL RECICLADO GO GREEN TRIPOLI NEGRO 42PQ. 100 H. PLEGADO 1/4', stock: 37, costoCaja: 3267.63, uPq: 100, pCaja: 48 },
  { sku: '4020PBL', descripcion: 'PAQ. SERV. 40x20 PUNTA-PUNTA PAPEL BASIC BLANCA 16PQ.100H. PLEGADO 1/4', stock: 57, costoCaja: 950.14, uPq: 100, pCaja: 2 },
  { sku: '4020PBU', descripcion: 'PAQ. SERV. 40x20 PUNTA-PUNTA PAPEL BASIC BURDEOS 16PQ.100H. PLEGADO 1/4', stock: 3, costoCaja: 1592.13, uPq: 100, pCaja: 24 },
  { sku: '4020PG', descripcion: 'PAQ. SERV. 40x20 PUNTA-PUNTA PAPEL RECICLADO GO GREEN 16PQ.100H. PLEGADO 1/4', stock: 17, costoCaja: 950.14, uPq: 100, pCaja: 2 },
  { sku: '4020PNE', descripcion: 'PAQ. SERV. 40x20 PUNTA-PUNTA PAPEL BASIC NEGRO 16PQ.100H. PLEGADO 1/4', stock: 21, costoCaja: 1592.13, uPq: 100, pCaja: 24 },
  { sku: '4032AKBLA', descripcion: 'PAQ. SERV. 40x32 AIRLAID BASIC BLANCO 20P.40 UND. PLEGADO KANGAROO', stock: 88, costoCaja: 2611.97, uPq: 40, pCaja: 20 },
  { sku: '4032AKBLI', descripcion: 'PAQ. SERV. 40x32 AIRLAID KANGAROO 20P.40 UND. BLANCO IMPRESO (Confirmar Precio)', stock: 0, costoCaja: 2611.97, uPq: 40, pCaja: 24 },
  { sku: '4032PKNE', descripcion: 'SERV PUNTA COLOR CANGURO NEGRO P/40 C-24', stock: 86, costoCaja: 0, uPq: 40, pCaja: 24 }
];

const INITIAL_CLIENTS = [
  { id: 'siha-partner', nombre: 'SIHA PARTNER S.A. DE C.V', tipo: 'Distribuidor', descuento: 30, contacto: 'Compras', telefono: '', correo: '', rfc: '', direccion: '25 DE FEBRERO DE 1861 NO. 1413, LEYES DE REFORMA' },
  { id: 'cliente-directo', nombre: 'Cliente Directo General', tipo: 'Cliente Directo', descuento: 0, contacto: 'Mostrador', telefono: '', correo: '', rfc: 'XAXX010101000', direccion: 'Ciudad de México' }
];

const INITIAL_EJECUTIVOS = [
  { id: 'marijose', nombre: 'Marijose Arroyo', puesto: 'Ventas', telefono: '+52 55 5454 0090', correo: 'marijose@la-pajarita.com.mx', firmaUrl: 'https://drive.google.com/file/d/1_mbd7kdot6xUltJlgl/view' },
  { id: 'ileana', nombre: 'Ileana Fernández', puesto: 'Operaciones y Ventas', telefono: '+52 55 5454 0090', correo: 'ileana@la-pajarita.com.mx', firmaUrl: 'https://drive.google.com/file/d/1dl9HESwsIIwdPfzjH2/view' },
  { id: 'mariana', nombre: 'Mariana De Garay', puesto: 'Ventas', telefono: '+52 55 5454 0090', correo: 'mariana@la-pajarita.com.mx', firmaUrl: 'https://drive.google.com/file/d/1ecJFWUAK5t_-QaX-bK/view' },
  { id: 'erika', nombre: 'Erika Vázquez', puesto: 'Ventas', telefono: '+52 55 5454 0090', correo: 'erika@la-pajarita.com.mx', firmaUrl: 'https://drive.google.com/file/d/1Bwfo0dsNOmHJkf4zxH/view' },
  { id: 'eduardo', nombre: 'Eduardo Casahonda', puesto: 'Dirección Comercial', telefono: '+52 55 5454 0090', correo: 'eduardo@la-pajarita.com.mx', firmaUrl: 'https://drive.google.com/file/d/1li4VNnYpF18R7fRDum/view' }
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

// Funciones auxiliares para extraer tamaño y material automáticamente
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

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventario');

  const [inventory, setInventory] = useState([]);
  const [clients, setClients] = useState([]);
  const [ejecutivos, setEjecutivos] = useState(INITIAL_EJECUTIVOS);
  const [orders, setOrders] = useState([]);
  const [loadingSeed, setLoadingSeed] = useState(false);

  // Filtros globales de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSize, setFilterSize] = useState('Todos');
  const [filterMaterial, setFilterMaterial] = useState('Todos');

  // Modales de edición (solo Admin)
  const [newProd, setNewProd] = useState({ sku: '', descripcion: '', stock: 0, costoCaja: 0, uPq: 0, pCaja: 0 });
  const [showProdModal, setShowProdModal] = useState(false);

  const [newClient, setNewClient] = useState({ nombre: '', tipo: 'Distribuidor', descuento: 30, contacto: '', telefono: '', correo: '', rfc: '', direccion: '' });
  const [showClientModal, setShowClientModal] = useState(false);

  const [newEjec, setNewEjec] = useState({ nombre: '', puesto: 'Ventas', telefono: '+52 55 5454 0090', correo: '', firmaUrl: '' });
  const [showEjecModal, setShowEjecModal] = useState(false);

  // Estado Cotizador
  const [cotFolio, setCotFolio] = useState(1001);
  const [cotClientId, setCotClientId] = useState('');
  const [cotClienteManual, setCotClienteManual] = useState('');
  const [cotContactoManual, setCotContactoManual] = useState('');
  const [cotTelefonoManual, setCotTelefonoManual] = useState('');
  const [cotCorreoManual, setCotCorreoManual] = useState('');
  const [cotDireccionManual, setCotDireccionManual] = useState('');
  const [cotImpresion, setCotImpresion] = useState('sin');
  const [cotEjecutivoId, setCotEjecutivoId] = useState('mariana');
  const [cotNotas, setCotNotas] = useState(DEFAULT_NOTAS);
  const [cotItems, setCotItems] = useState([{ sku: '', unidadVenta: 'caja', cantidad: 1 }]);

  // Estado Orden de Pedido (solo Admin)
  const [ordFolio, setOrdFolio] = useState(188);
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

  // Al seleccionar cliente en Cotizador, autorellena sus datos editables
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

  // Precargar catálogo inicial (solo Admin)
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
      alert('Catálogo de 39 SKUs, distribuidores y ejecutivos cargados en Firebase.');
    } catch (e) {
      alert('Error al cargar datos iniciales: ' + e.message);
    } finally {
      setLoadingSeed(false);
    }
  };

  const handleCsvUpload = (e) => {
    if (!isAdmin) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target.result;
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) return alert('El archivo CSV está vacío.');
      const batch = writeBatch(db);
      let count = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        const sku = cols[0];
        const descripcion = cols[1];
        if (!sku || !descripcion) continue;
        const stock = Number(cols[2]) || 0;
        const costoCaja = Number(cols[6] || cols[3]) || 0;
        const uPq = Number(cols[7] || cols[4]) || 0;
        const pCaja = Number(cols[8] || cols[5]) || 0;
        const safeId = sku.replace(/\//g, '_');
        batch.set(doc(db, 'inventario', safeId), { sku, descripcion, stock, costoCaja, uPq, pCaja }, { merge: true });
        count++;
      }
      await batch.commit();
      alert(`Se sincronizaron ${count} productos desde tu CSV.`);
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

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!isAdmin || !newProd.sku) return;
    const safeId = newProd.sku.trim().replace(/\//g, '_');
    await setDoc(doc(db, 'inventario', safeId), {
      ...newProd,
      sku: newProd.sku.trim(),
      stock: Number(newProd.stock) || 0,
      costoCaja: Number(newProd.costoCaja) || 0,
      uPq: Number(newProd.uPq) || 0,
      pCaja: Number(newProd.pCaja) || 0
    });
    setNewProd({ sku: '', descripcion: '', stock: 0, costoCaja: 0, uPq: 0, pCaja: 0 });
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
    setNewEjec({ nombre: '', puesto: 'Ventas', telefono: '+52 55 5454 0090', correo: '', firmaUrl: '' });
    setShowEjecModal(false);
  };

  // Filtrado inteligente compartido (SKU, Tamaño, Material)
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

  // Cálculos Cotizador: precio normal en tabla y descuento separado en totales
  const selectedCotClient = useMemo(
    () => clients.find((c) => c.id === cotClientId) || { descuento: 0 },
    [clients, cotClientId]
  );

  const calcLineCotizacion = (prod, unidadVenta, cantidad) => {
    if (!prod) return { precioNormalUnidad: 0, precioUnitarioPieza: 0, totalUds: 0, importeNormal: 0 };
    const costoCajaBase = Number(prod.costoCaja) || 0;
    const pCaja = Number(prod.pCaja) || 1;
    const uPq = Number(prod.uPq) || 0;
    const precioPaqBase = pCaja > 0 ? costoCajaBase / pCaja : costoCajaBase;

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

  // Cálculos Orden de Pedido (solo Admin)
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
        return {
          prodId: prod.id,
          sku: prod.sku,
          descripcion: prod.descripcion,
          stockActual: Number(prod.stock) || 0,
          cajas: Number(row.cajas),
          descuentoPct: descPct,
          precioFinal,
          subtotal: precioFinal * Number(row.cajas)
        };
      })
      .filter(Boolean);

    if (!validLines.length) return alert('Agrega al menos un SKU con cantidad de cajas.');
    const sinStock = validLines.find((l) => l.cajas > l.stockActual);
    if (sinStock) {
      return alert(`Stock insuficiente para ${sinStock.sku}. Disponible: ${sinStock.stockActual} cajas.`);
    }

    const batch = writeBatch(db);
    const orderRef = doc(collection(db, 'pedidos'));
    batch.set(orderRef, {
      folio: Number(ordFolio),
      fecha: new Date().toISOString().split('T')[0],
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
    alert(`Pedido #${ordFolio} confirmado y stock actualizado.`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 text-sm">
        Verificando sesión...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-6">
          <div>
            <h1 className="text-3xl font-serif tracking-wide text-stone-900">la pajarita</h1>
            <p className="text-xs uppercase tracking-widest text-stone-500 mt-1">Sistema Operativo Interno</p>
          </div>
          <p className="text-xs text-stone-600">
            Inicia sesión con tu cuenta de Google. Los administradores acceden a gestión completa y el equipo comercial a catálogo y cotizador.
          </p>
          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl shadow transition"
          >
            Iniciar sesión con Google
          </button>
        </div>
      </div>
    );
  }

  const ejecutivoActual = ejecutivos.find((e) => e.id === cotEjecutivoId) || ejecutivos[0];
  const modalidadShort = MODALIDADES_IMPRESION.find((m) => m.id === cotImpresion)?.short || 'Sin impresión';

  // Pestañas visibles según rol
  const availableTabs = isAdmin
    ? [
        { id: 'inventario', label: 'Inventario', icon: Package },
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
    <div className="min-h-screen bg-stone-100 text-stone-800">
      {/* Barra superior (oculta al imprimir) */}
      <header className="bg-stone-900 text-white px-6 py-3.5 shadow-md no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-serif tracking-wider">la pajarita</h1>
              <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-semibold ${isAdmin ? 'bg-emerald-700 text-white' : 'bg-stone-700 text-stone-200'}`}>
                {isAdmin ? 'Administrador' : 'Consulta / Cotizador'}
              </span>
            </div>
            <p className="text-xs text-stone-400">{user.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {availableTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition ${
                    activeTab === tab.id ? 'bg-stone-100 text-stone-900 font-bold' : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-red-950 hover:bg-red-900 text-red-200"
            >
              <LogOut className="w-3.5 h-3.5" /> Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {isAdmin && inventory.length === 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-300 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 no-print">
            <div>
              <h2 className="font-semibold text-amber-900">Base de datos lista para inicializarse</h2>
              <p className="text-sm text-amber-800">Carga automáticamente tus 39 SKUs, distribuidores y ejecutivos con firmas.</p>
            </div>
            <button
              onClick={seedDatabase}
              disabled={loadingSeed}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm"
            >
              <Database className="w-4 h-4" />
              {loadingSeed ? 'Cargando...' : 'Cargar Catálogo Inicial'}
            </button>
          </div>
        )}

        {/* TAB 1: INVENTARIO (Edición solo Admin; Consulta para los demás) */}
        {activeTab === 'inventario' && (
          <div className="space-y-4">
            {/* Barra de Filtros Inteligentes */}
            <div className="bg-white p-4 rounded-xl shadow-sm border space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Buscar por SKU o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-stone-500" />
                  <select
                    value={filterSize}
                    onChange={(e) => setFilterSize(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm bg-stone-50"
                  >
                    {TAMANOS_FILTER.map((t) => (
                      <option key={t} value={t}>Tamaño: {t}</option>
                    ))}
                  </select>
                  <select
                    value={filterMaterial}
                    onChange={(e) => setFilterMaterial(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm bg-stone-50"
                  >
                    {MATERIALES_FILTER.map((m) => (
                      <option key={m} value={m}>Material: {m}</option>
                    ))}
                  </select>
                </div>

                {isAdmin && (
                  <div className="flex flex-wrap gap-2">
                    <label className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer">
                      <Upload className="w-3.5 h-3.5" /> Importar CSV
                      <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
                    </label>
                    <button
                      onClick={() => exportToCSV('inventario_la_pajarita.csv', inventory)}
                      className="flex items-center gap-1.5 bg-stone-800 text-white px-3 py-2 rounded-lg text-xs font-medium"
                    >
                      <Download className="w-3.5 h-3.5" /> CSV
                    </button>
                    <button
                      onClick={() => setShowProdModal(true)}
                      className="flex items-center gap-1.5 bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" /> Nuevo SKU
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-stone-800 text-white uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Descripción</th>
                    <th className="px-4 py-3 text-center">Tamaño / Material</th>
                    <th className="px-4 py-3 text-center">Stock Cajas</th>
                    <th className="px-4 py-3 text-right">Precio Caja</th>
                    <th className="px-4 py-3 text-right">Precio Paquete</th>
                    <th className="px-4 py-3 text-center">U/PQ • P/CAJA</th>
                    {isAdmin && <th className="px-4 py-3 text-right">Valor Stock</th>}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredInventory.map((item) => {
                    const precioPaq = item.pCaja > 0 ? item.costoCaja / item.pCaja : item.costoCaja;
                    return (
                      <tr key={item.id} className="hover:bg-stone-50">
                        <td className="px-4 py-3 font-mono font-semibold text-stone-900">{item.sku}</td>
                        <td className="px-4 py-3 text-xs">{item.descripcion}</td>
                        <td className="px-4 py-3 text-center text-xs text-stone-500">
                          {extractSize(item.sku, item.descripcion)} • {extractMaterial(item.sku, item.descripcion)}
                        </td>
                        <td className="px-4 py-3">
                          {isAdmin ? (
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => adjustStock(item, -1)} className="px-2 py-0.5 bg-stone-200 rounded hover:bg-stone-300">-</button>
                              <span className={`font-bold min-w-[2rem] text-center ${item.stock <= 5 ? 'text-red-600' : 'text-emerald-700'}`}>
                                {item.stock}
                              </span>
                              <button onClick={() => adjustStock(item, 1)} className="px-2 py-0.5 bg-stone-200 rounded hover:bg-stone-300">+</button>
                            </div>
                          ) : (
                            <div className="text-center font-bold text-stone-800">{item.stock} cajas</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.costoCaja)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-stone-700">{formatCurrency(precioPaq)}</td>
                        <td className="px-4 py-3 text-center text-xs text-stone-600">{item.uPq} uds • {item.pCaja} paq</td>
                        {isAdmin && (
                          <td className="px-4 py-3 text-right font-semibold text-stone-900">
                            {formatCurrency(item.stock * item.costoCaja)}
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

        {/* TAB 2: COTIZADOR ESTILO INSTITUCIONAL HORIZONTAL (IDÉNTICO A COTIZACION HYATT) */}
        {activeTab === 'cotizador' && (
          <div className="space-y-4">
            {/* Panel de controles y filtros (no se imprime en el PDF) */}
            <div className="no-print bg-white p-4 rounded-xl shadow-sm border space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                <h2 className="font-bold text-stone-900">Configuración de Cotización</h2>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-stone-800"
                >
                  <Printer className="w-4 h-4" /> Imprimir / Guardar PDF Horizontal
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Cliente / Distribuidor Base</label>
                  <select
                    value={cotClientId}
                    onChange={(e) => handleSelectCotClient(e.target.value)}
                    className="w-full border rounded-lg p-2 text-xs bg-white"
                  >
                    <option value="">-- Cliente Nuevo / Sin Descuento --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Modalidad de Impresión</label>
                  <select
                    value={cotImpresion}
                    onChange={(e) => setCotImpresion(e.target.value)}
                    className="w-full border rounded-lg p-2 text-xs bg-white font-semibold"
                  >
                    {MODALIDADES_IMPRESION.map((m) => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Ejecutivo que Firma</label>
                  <select
                    value={cotEjecutivoId}
                    onChange={(e) => setCotEjecutivoId(e.target.value)}
                    className="w-full border rounded-lg p-2 text-xs bg-white"
                  >
                    {ejecutivos.map((ej) => (
                      <option key={ej.id} value={ej.id}>{ej.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1">Filtrar catálogo de SKUs</label>
                  <div className="flex gap-1">
                    <select
                      value={filterSize}
                      onChange={(e) => setFilterSize(e.target.value)}
                      className="w-1/2 border rounded-lg p-2 text-xs bg-stone-50"
                    >
                      {TAMANOS_FILTER.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select
                      value={filterMaterial}
                      onChange={(e) => setFilterMaterial(e.target.value)}
                      className="w-1/2 border rounded-lg p-2 text-xs bg-stone-50"
                    >
                      {MATERIALES_FILTER.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* HOJA DE COTIZACIÓN HORIZONTAL (ESTILO HYATT QUERÉTARO) */}
            <div className="bg-white shadow-md border border-stone-300 max-w-6xl mx-auto flex flex-col md:flex-row overflow-hidden">
              {/* Columna lateral izquierda con foto editorial y marca */}
              <div className="w-full md:w-52 bg-stone-100 border-r border-stone-200 flex flex-col justify-between p-4 shrink-0">
                <div className="space-y-3">
                  <div className="text-center py-2 border-b border-stone-300">
                    <span className="font-serif text-2xl tracking-wider text-stone-900">la pajarita</span>
                    <span className="block text-[9px] uppercase tracking-[0.25em] text-stone-500">MÉXICO</span>
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80"
                    alt="Mesa La Pajarita"
                    className="w-full h-56 object-cover rounded shadow-sm grayscale-[15%]"
                  />
                </div>
                <div className="text-[10px] text-stone-500 space-y-1 pt-4 border-t border-stone-300">
                  <p className="font-semibold text-stone-700">World Marketing Face S. de R.L. de CV.</p>
                  <p>Carretera México Toluca 5804. Contadero.</p>
                  <p>CP 05500 Cuajimalpa CDMX.</p>
                  <p className="font-medium text-stone-700 pt-1">@lapajarita.cdmx</p>
                </div>
              </div>

              {/* Cuerpo principal derecho */}
              <div className="flex-1 p-6 space-y-5">
                {/* Encabezado datos del cliente */}
                <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-stone-300 pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 flex-1 text-xs">
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-stone-500">NOMBRE CLIENTE</span>
                      <input
                        type="text"
                        placeholder="Ej. HYATT QUERÉTARO CENTRO"
                        value={cotClienteManual}
                        onChange={(e) => setCotClienteManual(e.target.value)}
                        className="w-full font-bold text-stone-900 border-b border-stone-200 focus:border-stone-800 outline-none py-0.5"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-stone-500">NOMBRE DE CONTACTO</span>
                      <input
                        type="text"
                        placeholder="Nombre de contacto"
                        value={cotContactoManual}
                        onChange={(e) => setCotContactoManual(e.target.value)}
                        className="w-full text-stone-800 border-b border-stone-200 focus:border-stone-800 outline-none py-0.5"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-stone-500">TELÉFONO</span>
                      <input
                        type="text"
                        placeholder="Teléfono"
                        value={cotTelefonoManual}
                        onChange={(e) => setCotTelefonoManual(e.target.value)}
                        className="w-full text-stone-800 border-b border-stone-200 focus:border-stone-800 outline-none py-0.5"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-stone-500">CORREO</span>
                      <input
                        type="text"
                        placeholder="correo@cliente.com"
                        value={cotCorreoManual}
                        onChange={(e) => setCotCorreoManual(e.target.value)}
                        className="w-full text-stone-800 border-b border-stone-200 focus:border-stone-800 outline-none py-0.5"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <span className="block text-[10px] font-bold uppercase text-stone-500">DIRECCIÓN DE ENVÍO</span>
                      <input
                        type="text"
                        placeholder="Ciudad / Dirección de entrega"
                        value={cotDireccionManual}
                        onChange={(e) => setCotDireccionManual(e.target.value)}
                        className="w-full text-stone-800 border-b border-stone-200 focus:border-stone-800 outline-none py-0.5"
                      />
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col justify-between">
                    <div>
                      <span className="inline-block bg-stone-900 text-white text-xs font-bold tracking-widest px-3 py-1 uppercase">
                        COTIZACIÓN
                      </span>
                      <p className="text-[11px] text-stone-500 mt-1">
                        Folio: <input type="number" value={cotFolio} onChange={(e) => setCotFolio(e.target.value)} className="w-14 text-right font-bold text-stone-800" />
                      </p>
                    </div>
                    <div className="mt-2">
                      <span className="block text-[10px] font-bold uppercase text-stone-500">FECHA DE COTIZACIÓN</span>
                      <span className="text-xs font-semibold text-stone-900">{new Date().toLocaleDateString('es-MX')}</span>
                    </div>
                  </div>
                </div>

                {/* Tabla de productos (sin porcentaje de descuento visible, muestra costo normal) */}
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-stone-900 text-white uppercase text-[10px]">
                        <th className="p-2 text-left">SKU</th>
                        <th className="p-2 text-left">Producto</th>
                        <th className="p-2 text-center">Presentación</th>
                        <th className="p-2 text-center">Cant.</th>
                        <th className="p-2 text-center">Uds x Paq</th>
                        <th className="p-2 text-center">Paq x Caja</th>
                        <th className="p-2 text-center">Total Uds</th>
                        <th className="p-2 text-right">Precio Unitario</th>
                        <th className="p-2 text-right">Precio Caja/Paq</th>
                        <th className="p-2 text-center">Impresión</th>
                        <th className="p-2 text-right">Total Importe</th>
                        <th className="p-2 no-print"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 border-b border-stone-300">
                      {cotItems.map((row, idx) => {
                        const prod = inventory.find((p) => p.sku === row.sku);
                        const calc = calcLineCotizacion(prod, row.unidadVenta, Number(row.cantidad) || 0);
                        return (
                          <tr key={idx} className="hover:bg-stone-50">
                            <td className="p-1.5 font-mono font-bold text-stone-900">
                              <select
                                value={row.sku}
                                onChange={(e) => {
                                  const up = [...cotItems];
                                  up[idx].sku = e.target.value;
                                  setCotItems(up);
                                }}
                                className="border rounded p-1 font-mono text-[11px] w-28 bg-white"
                              >
                                <option value="">SKU...</option>
                                {filteredInventory.map((p) => (
                                  <option key={p.sku} value={p.sku}>{p.sku}</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-1.5 text-[10px] leading-tight max-w-[180px]">{prod?.descripcion || '-'}</td>
                            <td className="p-1.5 text-center">
                              <select
                                value={row.unidadVenta}
                                onChange={(e) => {
                                  const up = [...cotItems];
                                  up[idx].unidadVenta = e.target.value;
                                  setCotItems(up);
                                }}
                                className="border rounded p-1 text-[10px] bg-white"
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
                                className="border rounded p-1 w-12 text-center font-semibold"
                              />
                            </td>
                            <td className="p-1.5 text-center">{prod?.uPq || 0}</td>
                            <td className="p-1.5 text-center">{prod?.pCaja || 0}</td>
                            <td className="p-1.5 text-center font-medium">{calc.totalUds.toLocaleString('es-MX')}</td>
                            <td className="p-1.5 text-right">{formatCurrency(calc.precioUnitarioPieza, 4)}</td>
                            <td className="p-1.5 text-right font-medium">{formatCurrency(calc.precioNormalUnidad)}</td>
                            <td className="p-1.5 text-center text-[10px]">{modalidadShort}</td>
                            <td className="p-1.5 text-right font-bold text-stone-900">{formatCurrency(calc.importeNormal)}</td>
                            <td className="p-1.5 text-center no-print">
                              <button onClick={() => setCotItems(cotItems.filter((_, i) => i !== idx))} className="text-red-500">
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
                  className="no-print flex items-center gap-1 text-xs text-stone-800 font-bold hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar renglón
                </button>

                {/* Pie de cotización: Notas + Firma Electrónica a la izquierda, Totales con Descuento separado a la derecha */}
                <div className="flex flex-col md:flex-row justify-between gap-6 pt-2">
                  <div className="flex-1 space-y-4">
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-stone-700 mb-1">NOTAS:</span>
                      <textarea
                        rows="5"
                        value={cotNotas}
                        onChange={(e) => setCotNotas(e.target.value)}
                        className="w-full text-[10px] leading-snug text-stone-600 border border-stone-200 rounded p-2 bg-stone-50/50"
                      />
                    </div>

                    {/* Firma electrónica corregida debajo de notas */}
                    <div className="flex items-end gap-6 pt-1">
                      <div>
                        {ejecutivoActual?.firmaUrl && (
                          <img
                            src={toDirectDriveImg(ejecutivoActual.firmaUrl)}
                            alt={`Firma ${ejecutivoActual.nombre}`}
                            className="h-14 object-contain mb-1"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="border-t border-stone-400 pt-1 text-[11px]">
                          <p className="font-bold text-stone-900">{ejecutivoActual?.nombre}</p>
                          <p className="text-stone-500 text-[10px]">{ejecutivoActual?.puesto || 'Ventas'}</p>
                          <p className="text-stone-500 text-[10px]">{ejecutivoActual?.telefono}</p>
                          <p className="text-stone-500 text-[10px]">{ejecutivoActual?.correo}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cuadro de totales: Subtotal Precio Normal, Descuento, IVA y Total General */}
                  <div className="w-full md:w-64 shrink-0 self-end">
                    <table className="w-full text-xs border border-stone-300">
                      <tbody className="divide-y divide-stone-200">
                        <tr className="bg-stone-50">
                          <td className="p-2 font-bold text-stone-700">SUBTOTAL</td>
                          <td className="p-2 text-right font-semibold">{formatCurrency(cotSubtotalNormal)}</td>
                        </tr>
                        {cotDescuentoMonto > 0 && (
                          <tr className="bg-emerald-50/60 text-emerald-900">
                            <td className="p-2 font-bold">DESCUENTO</td>
                            <td className="p-2 text-right font-semibold">- {formatCurrency(cotDescuentoMonto)}</td>
                          </tr>
                        )}
                        <tr className="bg-stone-50">
                          <td className="p-2 font-bold text-stone-700">IVA (16%)</td>
                          <td className="p-2 text-right font-semibold">{formatCurrency(cotIva)}</td>
                        </tr>
                        <tr className="bg-stone-900 text-white">
                          <td className="p-2.5 font-bold">TOTAL GENERAL</td>
                          <td className="p-2.5 text-right font-bold text-sm">{formatCurrency(cotTotalGeneral)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DISTRIBUIDORES (Solo Admin) */}
        {isAdmin && activeTab === 'clientes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
              <h2 className="font-bold text-lg">Clientes y Distribuidores</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => exportToCSV('clientes_distribuidores.csv', clients)}
                  className="flex items-center gap-2 bg-stone-800 text-white px-3 py-2 rounded-lg text-xs"
                >
                  <Download className="w-4 h-4" /> Exportar CSV
                </button>
                <button
                  onClick={() => setShowClientModal(true)}
                  className="flex items-center gap-2 bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs"
                >
                  <Plus className="w-4 h-4" /> Nuevo Cliente
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-stone-800 text-white text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Razón Social</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3 text-center">% Descuento</th>
                    <th className="px-4 py-3">Contacto</th>
                    <th className="px-4 py-3">Correo / Teléfono</th>
                    <th className="px-4 py-3">Dirección</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {clients.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-3 font-semibold">{c.nombre}</td>
                      <td className="px-4 py-3">{c.tipo}</td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-700">{c.descuento}%</td>
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

        {/* TAB 4: EJECUTIVOS Y FIRMAS (Solo Admin) */}
        {isAdmin && activeTab === 'ejecutivos' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
              <div>
                <h2 className="font-bold text-lg">Ejecutivos y Firmas Electrónicas</h2>
                <p className="text-xs text-stone-500">Pega el enlace compartido de Google Drive de cada firma; el sistema lo convierte automáticamente.</p>
              </div>
              <button
                onClick={() => setShowEjecModal(true)}
                className="flex items-center gap-2 bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs"
              >
                <Plus className="w-4 h-4" /> Agregar Ejecutivo
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ejecutivos.map((ej) => (
                <div key={ej.id} className="bg-white p-4 rounded-xl shadow-sm border space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-stone-900">{ej.nombre}</h3>
                      <p className="text-xs text-stone-500">{ej.puesto} • {ej.correo}</p>
                    </div>
                    <button
                      onClick={() => deleteDoc(doc(db, 'ejecutivos', ej.id))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="border rounded p-2 bg-stone-50 h-20 flex items-center justify-center">
                    {ej.firmaUrl ? (
                      <img src={toDirectDriveImg(ej.firmaUrl)} alt={ej.nombre} className="max-h-16 object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-xs text-stone-400">Sin firma cargada</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: NUEVA ORDEN DE PEDIDO (Solo Admin) */}
        {isAdmin && activeTab === 'pedido' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h2 className="text-xl font-bold">Solicitud de Pedido a Bodega</h2>
                <p className="text-xs text-stone-500">Descuenta automáticamente existencias y aplica descuento del distribuidor</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-500 block">Folio Pedido</span>
                <span className="text-xl font-bold text-emerald-700">#{ordFolio}</span>
              </div>
            </div>

            {/* Filtros rápidos para el selector de pedido */}
            <div className="flex flex-wrap items-center gap-2 bg-stone-50 p-3 rounded-lg border text-xs">
              <span className="font-semibold text-stone-600">Filtrar SKUs:</span>
              <input
                type="text"
                placeholder="Buscar SKU o palabra..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded px-2 py-1 bg-white"
              />
              <select value={filterSize} onChange={(e) => setFilterSize(e.target.value)} className="border rounded px-2 py-1 bg-white">
                {TAMANOS_FILTER.map((t) => <option key={t} value={t}>Tamaño: {t}</option>)}
              </select>
              <select value={filterMaterial} onChange={(e) => setFilterMaterial(e.target.value)} className="border rounded px-2 py-1 bg-white">
                {MATERIALES_FILTER.map((m) => <option key={m} value={m}>Material: {m}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-stone-50 p-4 rounded-lg border">
              <div>
                <label className="block text-xs font-semibold mb-1">Cliente / Distribuidor *</label>
                <select
                  value={ordClientId}
                  onChange={(e) => setOrdClientId(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-white"
                >
                  <option value="">-- Seleccionar --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre} ({c.descuento}% desc)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">¿Recoge en Bodega?</label>
                <select
                  value={ordRecoge}
                  onChange={(e) => setOrdRecoge(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-white"
                >
                  <option value="NO">NO (Requiere envío)</option>
                  <option value="SI">SÍ (Recoge cliente)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Ejecutivo Responsable</label>
                <select
                  value={ordEjecutivo}
                  onChange={(e) => setOrdEjecutivo(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-white"
                >
                  {ejecutivos.map((ej) => (
                    <option key={ej.id} value={ej.nombre}>{ej.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-100 text-xs uppercase">
                  <tr>
                    <th className="p-2 text-left">SKU</th>
                    <th className="p-2 text-left">Producto</th>
                    <th className="p-2 text-center">Stock</th>
                    <th className="p-2 text-center">Cajas</th>
                    <th className="p-2 text-center">% Desc</th>
                    <th className="p-2 text-right">Precio Final</th>
                    <th className="p-2 text-right">Subtotal</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
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
                            className="border rounded p-1.5 font-mono text-sm w-36"
                          >
                            <option value="">SKU...</option>
                            {filteredInventory.map((p) => (
                              <option key={p.sku} value={p.sku}>{p.sku}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2 text-xs">{prod?.descripcion || '-'}</td>
                        <td className="p-2 text-center font-semibold">
                          {prod ? (
                            <span className={excede ? 'text-red-600' : 'text-emerald-700'}>
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
                            className="border rounded p-1 w-20 text-center"
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
                            className="border rounded p-1 w-16 text-center"
                          />
                        </td>
                        <td className="p-2 text-right">{formatCurrency(precioFinal)}</td>
                        <td className="p-2 text-right font-bold">{formatCurrency(precioFinal * (Number(row.cajas) || 0))}</td>
                        <td className="p-2 text-center">
                          <button onClick={() => setOrdItems(ordItems.filter((_, i) => i !== idx))} className="text-red-500">
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
              className="flex items-center gap-1 text-sm text-emerald-700 font-semibold"
            >
              <Plus className="w-4 h-4" /> Agregar SKU al pedido
            </button>

            <div className="flex flex-col md:flex-row justify-between items-end gap-6 pt-4 border-t">
              <button
                onClick={handleConfirmOrder}
                className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3 rounded-xl font-bold shadow"
              >
                <CheckCircle2 className="w-5 h-5" /> Confirmar Pedido y Descontar Inventario
              </button>

              <div className="w-full md:w-80 bg-stone-50 p-4 rounded-lg border space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal Productos:</span>
                  <span>{formatCurrency(ordSubtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Costo de Envío (Manual):</span>
                  <input
                    type="number"
                    min="0"
                    value={ordEnvio}
                    onChange={(e) => setOrdEnvio(e.target.value)}
                    className="border rounded px-2 py-1 w-28 text-right bg-white"
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span>IVA (16%):</span>
                  <span>{formatCurrency(ordIva)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2 text-stone-900">
                  <span>Total Pedido:</span>
                  <span>{formatCurrency(ordTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: RÉCORD DE PEDIDOS (Solo Admin) */}
        {isAdmin && activeTab === 'record' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
              <h2 className="font-bold text-lg">Récord Histórico de Órdenes Confirmadas</h2>
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
                className="flex items-center gap-2 bg-stone-800 text-white px-4 py-2 rounded-lg text-xs"
              >
                <Download className="w-4 h-4" /> Descargar Récord (CSV)
              </button>
            </div>

            <div className="space-y-3">
              {orders.map((ord) => (
                <div key={ord.id} className="bg-white p-4 rounded-xl shadow-sm border">
                  <div className="flex flex-wrap justify-between items-center border-b pb-2 mb-2">
                    <div>
                      <span className="font-bold text-emerald-700 mr-3">Pedido #{ord.folio}</span>
                      <span className="font-semibold">{ord.cliente}</span>
                      <span className="text-xs text-stone-500 ml-3">{ord.fecha} • Ejecutivo: {ord.ejecutivo}</span>
                    </div>
                    <div className="text-right font-bold text-stone-900">
                      Total: {formatCurrency(ord.total)} <span className="text-xs font-normal text-stone-500">(Envío: {formatCurrency(ord.envio)})</span>
                    </div>
                  </div>
                  <div className="text-xs text-stone-600 space-y-1">
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
                <p className="text-center text-stone-500 py-8">Aún no hay pedidos registrados en el historial.</p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modales exclusivos de Administrador */}
      {isAdmin && showProdModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveProduct} className="bg-white rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-lg">Agregar / Actualizar SKU</h3>
            <input required placeholder="SKU" value={newProd.sku} onChange={(e) => setNewProd({ ...newProd, sku: e.target.value })} className="w-full border rounded p-2 text-sm" />
            <input required placeholder="Descripción" value={newProd.descripcion} onChange={(e) => setNewProd({ ...newProd, descripcion: e.target.value })} className="w-full border rounded p-2 text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs">Stock Inicial (Cajas)</label>
                <input type="number" value={newProd.stock} onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })} className="w-full border rounded p-2 text-sm" />
              </div>
              <div>
                <label className="text-xs">Costo Caja Base ($)</label>
                <input type="number" step="0.01" value={newProd.costoCaja} onChange={(e) => setNewProd({ ...newProd, costoCaja: e.target.value })} className="w-full border rounded p-2 text-sm" />
              </div>
              <div>
                <label className="text-xs">Unidades / Paquete</label>
                <input type="number" value={newProd.uPq} onChange={(e) => setNewProd({ ...newProd, uPq: e.target.value })} className="w-full border rounded p-2 text-sm" />
              </div>
              <div>
                <label className="text-xs">Paquetes / Caja</label>
                <input type="number" value={newProd.pCaja} onChange={(e) => setNewProd({ ...newProd, pCaja: e.target.value })} className="w-full border rounded p-2 text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowProdModal(false)} className="px-4 py-2 text-sm border rounded-lg">Cancelar</button>
              <button type="submit" className="px-4 py-2 text-sm bg-emerald-700 text-white rounded-lg font-medium">Guardar</button>
            </div>
          </form>
        </div>
      )}

      {isAdmin && showClientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveClient} className="bg-white rounded-xl p-6 max-w-md w-full space-y-3">
            <h3 className="font-bold text-lg">Nuevo Cliente o Distribuidor</h3>
            <input required placeholder="Razón Social o Nombre" value={newClient.nombre} onChange={(e) => setNewClient({ ...newClient, nombre: e.target.value })} className="w-full border rounded p-2 text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <select value={newClient.tipo} onChange={(e) => setNewClient({ ...newClient, tipo: e.target.value })} className="border rounded p-2 text-sm">
                <option value="Distribuidor">Distribuidor</option>
                <option value="Cliente Directo">Cliente Directo</option>
              </select>
              <input type="number" placeholder="% Descuento" value={newClient.descuento} onChange={(e) => setNewClient({ ...newClient, descuento: e.target.value })} className="border rounded p-2 text-sm" />
            </div>
            <input placeholder="Contacto" value={newClient.contacto} onChange={(e) => setNewClient({ ...newClient, contacto: e.target.value })} className="w-full border rounded p-2 text-sm" />
            <input placeholder="Correo" value={newClient.correo} onChange={(e) => setNewClient({ ...newClient, correo: e.target.value })} className="w-full border rounded p-2 text-sm" />
            <input placeholder="Teléfono" value={newClient.telefono} onChange={(e) => setNewClient({ ...newClient, telefono: e.target.value })} className="w-full border rounded p-2 text-sm" />
            <input placeholder="Dirección de Entrega" value={newClient.direccion} onChange={(e) => setNewClient({ ...newClient, direccion: e.target.value })} className="w-full border rounded p-2 text-sm" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowClientModal(false)} className="px-4 py-2 text-sm border rounded-lg">Cancelar</button>
              <button type="submit" className="px-4 py-2 text-sm bg-emerald-700 text-white rounded-lg font-medium">Guardar</button>
            </div>
          </form>
        </div>
      )}

      {isAdmin && showEjecModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSaveEjecutivo} className="bg-white rounded-xl p-6 max-w-md w-full space-y-3">
            <h3 className="font-bold text-lg">Agregar Ejecutivo y Firma</h3>
            <input required placeholder="Nombre Completo" value={newEjec.nombre} onChange={(e) => setNewEjec({ ...newEjec, nombre: e.target.value })} className="w-full border rounded p-2 text-sm" />
            <input placeholder="Puesto (ej. Ventas)" value={newEjec.puesto} onChange={(e) => setNewEjec({ ...newEjec, puesto: e.target.value })} className="w-full border rounded p-2 text-sm" />
            <input placeholder="Teléfono" value={newEjec.telefono} onChange={(e) => setNewEjec({ ...newEjec, telefono: e.target.value })} className="w-full border rounded p-2 text-sm" />
            <input placeholder="Correo" value={newEjec.correo} onChange={(e) => setNewEjec({ ...newEjec, correo: e.target.value })} className="w-full border rounded p-2 text-sm" />
            <input required placeholder="Enlace de Firma en Google Drive" value={newEjec.firmaUrl} onChange={(e) => setNewEjec({ ...newEjec, firmaUrl: e.target.value })} className="w-full border rounded p-2 text-sm" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowEjecModal(false)} className="px-4 py-2 text-sm border rounded-lg">Cancelar</button>
              <button type="submit" className="px-4 py-2 text-sm bg-emerald-700 text-white rounded-lg font-medium">Guardar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
