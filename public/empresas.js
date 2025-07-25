// Variables globales
let empresas = [];
let empresaEditando = null;

// Elementos del DOM
const empresasBody = document.getElementById('empresasBody');
const searchInput = document.getElementById('searchInput');
const resultCount = document.getElementById('resultCount');
const modal = document.getElementById('modalEmpresa');
const modalTitle = document.getElementById('modalTitle');
const formEmpresa = document.getElementById('formEmpresa');
const btnAgregar = document.getElementById('btnAgregar');
const btnBu