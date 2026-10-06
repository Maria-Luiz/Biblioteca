const API = '/api';

const telaAuth = document.getElementById('telaAuth');
const app = document.getElementById('app');
const formLogin = document.getElementById('formLogin');
const formCadastro = document.getElementById('formCadastro');
const abaLogin = document.getElementById('abaLogin');
const abaCadastro = document.getElementById('abaCadastro');
const nomeUsuario = document.getElementById('nomeUsuario');
const lista = document.getElementById('lista');
const modal = document.getElementById('modal');
const formLivro = document.getElementById('formLivro');
const buscaInput = document.getElementById('busca');

// ============ ABAS ============
abaLogin.onclick = () => {
  abaLogin.className = 'flex-1 py-2.5 rounded-lg font-semibold text-indigo-600 bg-white dark:bg-slate-800 shadow-sm transition-all';
  abaCadastro.className = 'flex-1 py-2.5 rounded-lg font-semibold text-slate-500 dark:text-slate-400 transition-all';
  formLogin.classList.remove('hidden');
  formCadastro.classList.add('hidden');
};
abaCadastro.onclick = () => {
  abaCadastro.className = 'flex-1 py-2.5 rounded-lg font-semibold text-indigo-600 bg-white dark:bg-slate-800 shadow-sm transition-all';
  abaLogin.className = 'flex-1 py-2.5 rounded-lg font-semibold text-slate-500 dark:text-slate-400 transition-all';
  formCadastro.classList.remove('hidden');
  formLogin.classList.add('hidden');
};

// ============ LOGIN ============
formLogin.onsubmit = async (e) => {
  e.preventDefault();
  const erroEl = document.getElementById('erroLogin');
  erroEl.textContent = '';
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      email: document.getElementById('loginEmail').value,
      senha: document.getElementById('loginSenha').value
    })
  });
  const data = await res.json();
  if (!res.ok) { erroEl.textContent = data.erro || 'Erro ao entrar'; return; }
  entrarNaApp(data);
};

// ============ CADASTRO ============
formCadastro.onsubmit = async (e) => {
  e.preventDefault();
  const erroEl = document.getElementById('erroCadastro');
  erroEl.textContent = '';
  const res = await fetch(`${API}/auth/cadastro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      nome: document.getElementById('cadNome').value,
      email: document.getElementById('cadEmail').value,
      senha: document.getElementById('cadSenha').value
    })
  });
  const data = await res.json();
  if (!res.ok) { erroEl.textContent = data.erro || 'Erro ao cadastrar'; return; }
  entrarNaApp(data);
};

// ============ LOGOUT ============
document.getElementById('btnSair').onclick = async () => {
  await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
  location.reload();
};

// ============ SESSÃO ============
function entrarNaApp(usuario) {
  telaAuth.classList.add('hidden');
  app.classList.remove('hidden');
  nomeUsuario.textContent = `👤 ${usuario.nome}`;
  carregarLivros();
}

async function verificarSessao() {
  const res = await fetch(`${API}/auth/eu`, { credentials: 'include' });
  if (res.ok) {
    const usuario = await res.json();
    entrarNaApp(usuario);
  } else {
    telaAuth.classList.remove('hidden');
    app.classList.add('hidden');
  }
}

// ============ CARREGAR LIVROS ============
async function carregarLivros() {
  const busca = document.getElementById('busca').value;
  const categoria = document.getElementById('filtroCategoria').value;
  const editora = document.getElementById('filtroEditora').value;
  const tag = document.getElementById('filtroTag').value;
  const anoDe = document.getElementById('filtroAnoDe').value;
  const anoAte = document.getElementById('filtroAnoAte').value;
  const ordenar = document.getElementById('ordenar').value;

  const params = new URLSearchParams({ busca, categoria, editora, tag, anoDe, anoAte, ordenar });
  const res = await fetch(`${API}/livros?${params}`, { credentials: 'include' });
  if (res.status === 401) { location.reload(); return; }

  const livros = await res.json();
  renderizar(livros);
  atualizarContador(livros.length);
  atualizarContadorResultados(livros.length, busca, categoria, editora, anoDe, anoAte);
  atualizarFiltroCategorias();
  atualizarFiltroEditoras();
  atualizarFiltroTags();
}

function atualizarContador(total) {
  const header = document.getElementById('tituloBiblioteca');
  if (header) header.textContent = `📚 Minha Biblioteca (${total} ${total === 1 ? 'livro' : 'livros'})`;
}

function atualizarContadorResultados(total, busca, categoria, editora, anoDe, anoAte) {
  const el = document.getElementById('contadorResultados');
  if (!el) return;
  const temFiltro = busca || categoria || editora || anoDe || anoAte;
  if (temFiltro) {
    el.textContent = `🔍 ${total} ${total === 1 ? 'resultado' : 'resultados'} encontrado${total === 1 ? '' : 's'}`;
    el.className = 'text-sm text-indigo-600 font-semibold mb-3';
  } else {
    el.textContent = `📚 ${total} ${total === 1 ? 'livro' : 'livros'} na biblioteca`;
    el.className = 'text-sm text-slate-500 dark:text-slate-400 mb-3';
  }
}

async function atualizarFiltroCategorias() {
  const res = await fetch(`${API}/categorias`, { credentials: 'include' });
  if (!res.ok) return;
  const categorias = await res.json();
  const select = document.getElementById('filtroCategoria');
  if (!select) return;
  const v = select.value;
  select.innerHTML = '<option value="">Todas</option>' + categorias.map(c => `<option value="${c}">${c}</option>`).join('');
  select.value = v;
}

async function atualizarFiltroEditoras() {
  const res = await fetch(`${API}/editoras`, { credentials: 'include' });
  if (!res.ok) return;
  const editoras = await res.json();
  const select = document.getElementById('filtroEditora');
  if (!select) return;
  const v = select.value;
  select.innerHTML = '<option value="">Todas</option>' + editoras.map(e => `<option value="${e}">${e}</option>`).join('');
  select.value = v;
}

async function atualizarFiltroTags() {
  const res = await fetch(`${API}/tags`, { credentials: 'include' });
  if (!res.ok) return;
  const tags = await res.json();
  const select = document.getElementById('filtroTag');
  if (!select) return;
  const v = select.value;
  select.innerHTML = '<option value="">Todas</option>' + tags.map(t => `<option value="${t}">${t}</option>`).join('');
  select.value = v;
}

// ============ RENDERIZAR ============
function renderizar(livros) {
  if (!Array.isArray(livros) || livros.length === 0) {
    lista.innerHTML = '<p class="col-span-full text-center text-slate-400 dark:text-slate-500 py-10">Nenhum livro encontrado.</p>';
    return;
  }

  lista.innerHTML = livros.map(l => {
    const tagsArray = (l.tags || '').split(',').map(t => t.trim()).filter(t => t);
    return `
    <div class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <img src="${l.capa || 'https://via.placeholder.com/220x280?text=Sem+Capa'}" alt="${l.titulo}" class="w-full h-64 object-cover bg-slate-100 dark:bg-slate-700">
      <div class="p-4 flex-1">
        <h3 class="font-bold text-slate-800 dark:text-slate-100 mb-2 line-clamp-2">${l.titulo}</h3>
        <p class="text-sm text-slate-600 dark:text-slate-400 mb-1">✍️ ${l.autor}</p>
        ${l.ano ? `<p class="text-sm text-slate-600 dark:text-slate-400 mb-1">📅 ${l.ano}</p>` : ''}
        ${l.categoria ? `<p class="text-sm text-slate-600 dark:text-slate-400 mb-1">📚 ${l.categoria}</p>` : (l.genero ? `<p class="text-sm text-slate-600 dark:text-slate-400 mb-1">🏷️ ${l.genero}</p>` : '')}
        ${l.editora ? `<p class="text-sm text-slate-600 dark:text-slate-400 mb-1">🏢 ${l.editora}</p>` : ''}
        ${l.isbn ? `<p class="text-xs text-slate-400 dark:text-slate-500 mb-2">🔢 ${l.isbn}</p>` : ''}
        ${tagsArray.length > 0 ? `<div class="flex flex-wrap gap-1 mt-2">${tagsArray.map(t => `<span onclick="filtrarPorTag('${t}')" class="cursor-pointer text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors">#${t}</span>`).join('')}</div>` : ''}
      </div>
      <div class="flex gap-1 p-3 border-t border-slate-100 dark:border-slate-700">
        <button onclick="ver(${l.id})" class="flex-1 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-md transition-colors">Ver</button>
        <button onclick="editar(${l.id})" class="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-md transition-colors">Editar</button>
        <button onclick="excluir(${l.id})" class="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-md transition-colors">Excluir</button>
      </div>
    </div>
  `}).join('');
}

function filtrarPorTag(tag) {
  document.getElementById('filtroTag').value = tag;
  carregarLivros();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============ VER ============
async function ver(id) {
  const res = await fetch(`${API}/livros/${id}`, { credentials: 'include' });
  const l = await res.json();
  const tagsArray = (l.tags || '').split(',').map(t => t.trim()).filter(t => t);
  const html = `
    <div class="space-y-3">
      ${l.capa ? `<img src="${l.capa}" alt="${l.titulo}" class="w-full max-h-72 object-contain rounded-xl mb-4">` : ''}
      <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100">${l.titulo}</h2>
      <p class="text-slate-700 dark:text-slate-300"><strong class="text-slate-800 dark:text-slate-100">Autor:</strong> ${l.autor}</p>
      ${l.isbn ? `<p class="text-slate-700 dark:text-slate-300"><strong class="text-slate-800 dark:text-slate-100">ISBN:</strong> ${l.isbn}</p>` : ''}
      ${l.ano ? `<p class="text-slate-700 dark:text-slate-300"><strong class="text-slate-800 dark:text-slate-100">Ano:</strong> ${l.ano}</p>` : ''}
      ${l.categoria ? `<p class="text-slate-700 dark:text-slate-300"><strong class="text-slate-800 dark:text-slate-100">Categoria:</strong> ${l.categoria}</p>` : ''}
      ${l.genero ? `<p class="text-slate-700 dark:text-slate-300"><strong class="text-slate-800 dark:text-slate-100">Gênero:</strong> ${l.genero}</p>` : ''}
      ${l.editora ? `<p class="text-slate-700 dark:text-slate-300"><strong class="text-slate-800 dark:text-slate-100">Editora:</strong> ${l.editora}</p>` : ''}
      ${tagsArray.length > 0 ? `<p class="text-slate-700 dark:text-slate-300"><strong class="text-slate-800 dark:text-slate-100">Tags:</strong> ${tagsArray.map(t => `#${t}`).join(' ')}</p>` : ''}
      ${l.sinopse ? `<p class="text-slate-700 dark:text-slate-300"><strong class="text-slate-800 dark:text-slate-100">Sinopse:</strong> ${l.sinopse}</p>` : ''}
    </div>
  `;
  document.getElementById('tituloModal').textContent = 'Detalhes do Livro';
  formLivro.outerHTML = `<div id="formLivro">${html}</div>`;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

// ============ NOVO ============
document.getElementById('btnNovo').onclick = () => {
  const form = document.getElementById('formLivro');
  if (form && form.tagName === 'FORM') {
    form.reset();
    document.getElementById('id').value = '';
  } else {
    location.reload();
    return;
  }
  document.getElementById('tituloModal').textContent = 'Novo Livro';
  modal.classList.remove('hidden');
  modal.classList.add('flex');
};

document.querySelector('.fechar').onclick = () => {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
};

window.onclick = (e) => {
  if (e.target === modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
};

// ============ SALVAR ============
formLivro.onsubmit = async (e) => {
  e.preventDefault();
  const id = document.getElementById('id').value;
  const fd = new FormData();
  fd.append('titulo', document.getElementById('titulo').value);
  fd.append('autor', document.getElementById('autor').value);
  fd.append('isbn', document.getElementById('isbn').value);
  fd.append('ano', document.getElementById('ano').value);
  fd.append('genero', document.getElementById('genero').value);
  fd.append('categoria', document.getElementById('categoria').value);
  fd.append('editora', document.getElementById('editora').value);
  fd.append('sinopse', document.getElementById('sinopse').value);
  fd.append('tags', document.getElementById('tags').value);

  const capa = document.getElementById('capa').files[0];
  if (capa) fd.append('capa', capa);

  const url = id ? `${API}/livros/${id}` : `${API}/livros`;
  const metodo = id ? 'PUT' : 'POST';

  await fetch(url, { method: metodo, body: fd, credentials: 'include' });
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  carregarLivros();
};

// ============ EDITAR ============
async function editar(id) {
  const res = await fetch(`${API}/livros/${id}`, { credentials: 'include' });
  const l = await res.json();
  if (!document.getElementById('titulo')) {
    sessionStorage.setItem('editarId', id);
    location.reload();
    return;
  }
  document.getElementById('id').value = l.id;
  document.getElementById('titulo').value = l.titulo;
  document.getElementById('autor').value = l.autor;
  document.getElementById('isbn').value = l.isbn || '';
  document.getElementById('ano').value = l.ano || '';
  document.getElementById('genero').value = l.genero || '';
  document.getElementById('categoria').value = l.categoria || '';
  document.getElementById('editora').value = l.editora || '';
  document.getElementById('sinopse').value = l.sinopse || '';
  document.getElementById('tags').value = l.tags || '';
  document.getElementById('tituloModal').textContent = 'Editar Livro';
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

// ============ EXCLUIR ============
async function excluir(id) {
  if (!confirm('Tem certeza que deseja excluir este livro?')) return;
  await fetch(`${API}/livros/${id}`, { method: 'DELETE', credentials: 'include' });
  carregarLivros();
}

// ============ FILTROS ============
buscaInput.oninput = () => carregarLivros();
document.getElementById('filtroCategoria').onchange = () => carregarLivros();
document.getElementById('filtroEditora').onchange = () => carregarLivros();
document.getElementById('filtroTag').onchange = () => carregarLivros();
document.getElementById('ordenar').onchange = () => carregarLivros();
document.getElementById('filtroAnoDe').onchange = () => carregarLivros();
document.getElementById('filtroAnoAte').onchange = () => carregarLivros();

document.getElementById('btnLimparFiltros').onclick = () => {
  document.getElementById('busca').value = '';
  document.getElementById('filtroCategoria').value = '';
  document.getElementById('filtroEditora').value = '';
  document.getElementById('filtroTag').value = '';
  document.getElementById('filtroAnoDe').value = '';
  document.getElementById('filtroAnoAte').value = '';
  document.getElementById('ordenar').value = 'recentes';
  carregarLivros();
};

// ============ CSV ============
document.getElementById('btnExportar').onclick = () => {
  window.location.href = '/api/exportar/csv';
};

// ============ ESTATÍSTICAS ============
const CORES_CATEGORIA = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-violet-500', 'bg-orange-500', 'bg-teal-500', 'bg-pink-500', 'bg-lime-500'];

document.getElementById('btnStats').onclick = async () => {
  const res = await fetch(`${API}/estatisticas`, { credentials: 'include' });
  if (!res.ok) return alert('Erro ao carregar estatísticas');
  const dados = await res.json();
  const { resumo } = dados;

  let intervaloAnos = '—';
  if (resumo.ano_min && resumo.ano_max) {
    intervaloAnos = resumo.ano_min === resumo.ano_max ? resumo.ano_min : `${resumo.ano_min}–${resumo.ano_max}`;
  }

  document.getElementById('statsResumo').innerHTML = `
    <div class="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4 text-center">
      <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">${resumo.total || 0}</div>
      <div class="text-xs text-slate-600 dark:text-slate-400 uppercase mt-1">Livros</div>
    </div>
    <div class="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-xl p-4 text-center">
      <div class="text-3xl font-bold text-emerald-600 dark:text-emerald-400">${resumo.total_generos || 0}</div>
      <div class="text-xs text-slate-600 dark:text-slate-400 uppercase mt-1">Gêneros</div>
    </div>
    <div class="bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 rounded-xl p-4 text-center">
      <div class="text-3xl font-bold text-amber-600 dark:text-amber-400">${resumo.total_editoras || 0}</div>
      <div class="text-xs text-slate-600 dark:text-slate-400 uppercase mt-1">Editoras</div>
    </div>
    <div class="bg-purple-50 dark:bg-purple-900/30 border border-purple-100 dark:border-purple-800 rounded-xl p-4 text-center">
      <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">${intervaloAnos}</div>
      <div class="text-xs text-slate-600 dark:text-slate-400 uppercase mt-1">Intervalo de anos</div>
    </div>
  `;

  const renderBarra = (label, valor, max, total, cor) => {
    const pct = total > 0 ? ((valor / total) * 100).toFixed(0) : 0;
    const largura = max > 0 ? (valor / max * 100) : 0;
    return `
      <div class="flex items-center gap-3">
        <div class="w-32 text-sm font-semibold text-slate-700 dark:text-slate-300 truncate" title="${label}">${label}</div>
        <div class="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-6 overflow-hidden">
          <div class="h-full ${cor} rounded-full transition-all duration-500 flex items-center justify-end pr-2" style="width: ${largura}%">
            <span class="text-xs font-bold text-white">${valor}</span>
          </div>
        </div>
        <div class="w-12 text-xs font-semibold text-slate-500 dark:text-slate-400 text-right">${pct}%</div>
      </div>
    `;
  };

  const elCat = document.getElementById('statsCategorias');
  if (dados.porCategoria.length === 0) elCat.innerHTML = '<p class="text-sm text-slate-400">Sem dados</p>';
  else {
    const maxCat = Math.max(...dados.porCategoria.map(c => c.total));
    elCat.innerHTML = dados.porCategoria.map((c, i) => renderBarra(c.categoria, c.total, maxCat, resumo.total, CORES_CATEGORIA[i % CORES_CATEGORIA.length])).join('');
  }

  const elEd = document.getElementById('statsEditoras');
  if (dados.porEditora.length === 0) elEd.innerHTML = '<p class="text-sm text-slate-400">Sem dados</p>';
  else {
    const maxEd = Math.max(...dados.porEditora.map(e => e.total));
    elEd.innerHTML = dados.porEditora.map(e => renderBarra(e.editora, e.total, maxEd, resumo.total, 'bg-emerald-500')).join('');
  }

  const elGen = document.getElementById('statsGeneros');
  if (dados.porGenero.length === 0) elGen.innerHTML = '<p class="text-sm text-slate-400">Sem dados</p>';
  else {
    const maxGen = Math.max(...dados.porGenero.map(g => g.total));
    elGen.innerHTML = dados.porGenero.map(g => renderBarra(g.genero, g.total, maxGen, resumo.total, 'bg-amber-500')).join('');
  }

  const elDec = document.getElementById('statsDecadas');
  if (dados.porDecada.length === 0) elDec.innerHTML = '<p class="text-sm text-slate-400">Sem dados</p>';
  else {
    const maxDec = Math.max(...dados.porDecada.map(d => d.total));
    elDec.innerHTML = dados.porDecada.map(d => renderBarra(`${d.decada}s`, d.total, maxDec, resumo.total, 'bg-purple-500')).join('');
  }

  const modalStats = document.getElementById('modalStats');
  modalStats.classList.remove('hidden');
  modalStats.classList.add('flex');
};

document.getElementById('fecharStats').onclick = () => {
  const m = document.getElementById('modalStats');
  m.classList.add('hidden');
  m.classList.remove('flex');
};

document.getElementById('modalStats').onclick = (e) => {
  if (e.target.id === 'modalStats') {
    e.target.classList.add('hidden');
    e.target.classList.remove('flex');
  }
};

// ============ MODO ESCURO ============
const btnTema = document.getElementById('btnTema');

function aplicarTema(tema) {
  if (tema === 'dark') {
    document.documentElement.classList.add('dark');
    if (btnTema) btnTema.textContent = '☀️';
  } else {
    document.documentElement.classList.remove('dark');
    if (btnTema) btnTema.textContent = '🌙';
  }
}

const temaSalvo = localStorage.getItem('tema') || 'light';
aplicarTema(temaSalvo);

if (btnTema) {
  btnTema.onclick = () => {
    const atual = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const novo = atual === 'dark' ? 'light' : 'dark';
    localStorage.setItem('tema', novo);
    aplicarTema(novo);
  };
}

// ============ RELOAD DE EDITAR ============
const editarId = sessionStorage.getItem('editarId');
if (editarId) {
  sessionStorage.removeItem('editarId');
  setTimeout(() => editar(editarId), 800);
}
// ============ BACKUP E RESTAURAÇÃO ============
const modalBackup = document.getElementById('modalBackup');
const btnBackup = document.getElementById('btnBackup');
const btnExportarBackup = document.getElementById('btnExportarBackup');
const btnEscolherBackup = document.getElementById('btnEscolherBackup');
const inputBackup = document.getElementById('inputBackup');
const statusBackup = document.getElementById('statusBackup');
const fecharBackup = document.getElementById('fecharBackup');

if (btnBackup) {
  btnBackup.onclick = () => {
    if (statusBackup) statusBackup.textContent = '';
    modalBackup.classList.remove('hidden');
    modalBackup.classList.add('flex');
  };
}

if (fecharBackup) {
  fecharBackup.onclick = () => {
    modalBackup.classList.add('hidden');
    modalBackup.classList.remove('flex');
  };
}

if (modalBackup) {
  modalBackup.onclick = (e) => {
    if (e.target.id === 'modalBackup') {
      e.target.classList.add('hidden');
      e.target.classList.remove('flex');
    }
  };
}

if (btnExportarBackup) {
  btnExportarBackup.onclick = () => {
    window.location.href = '/api/backup/exportar';
  };
}

if (btnEscolherBackup) {
  btnEscolherBackup.onclick = () => {
    inputBackup.click();
  };
}

if (inputBackup) {
  inputBackup.onchange = async (e) => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;

    statusBackup.textContent = '⏳ Lendo arquivo...';
    statusBackup.className = 'text-sm mt-3 min-h-[20px] text-center text-indigo-600';

    try {
      const texto = await arquivo.text();
      const dados = JSON.parse(texto);

      if (!dados.livros || !Array.isArray(dados.livros)) {
        statusBackup.textContent = '❌ Arquivo inválido. Não contém "livros".';
        statusBackup.className = 'text-sm mt-3 min-h-[20px] text-center text-red-600';
        return;
      }

      statusBackup.textContent = `⏳ Importando ${dados.livros.length} livros...`;

      const res = await fetch(`${API}/backup/importar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ livros: dados.livros })
      });

      const resultado = await res.json();

      if (!res.ok) {
        statusBackup.textContent = `❌ ${resultado.erro || 'Erro ao importar'}`;
        statusBackup.className = 'text-sm mt-3 min-h-[20px] text-center text-red-600';
        return;
      }

      statusBackup.textContent = `✅ ${resultado.inseridos} importados, ${resultado.duplicados} duplicados ignorados`;
      statusBackup.className = 'text-sm mt-3 min-h-[20px] text-center text-emerald-600 font-semibold';

      inputBackup.value = '';
      setTimeout(() => carregarLivros(), 1000);

    } catch (err) {
      statusBackup.textContent = '❌ Erro ao ler o arquivo. É um JSON válido?';
      statusBackup.className = 'text-sm mt-3 min-h-[20px] text-center text-red-600';
    }
  };
}


async function verificarSessao() {
  try {
    const res = await fetch(`${API}/auth/eu`, { credentials: 'include' });
    if (res.ok) {
      const usuario = await res.json();
      entrarNaApp(usuario);
    } else {
      telaAuth.classList.remove('hidden');
      app.classList.add('hidden');
    }
  } catch (err) {
    // Sem internet: mostra a tela de auth (offline)
    console.log('⚠️ Offline — mostrando tela de login');
    telaAuth.classList.remove('hidden');
    app.classList.add('hidden');

    // Opcional: mostra aviso
    const erroEl = document.getElementById('erroLogin');
    if (erroEl) erroEl.textContent = '⚠️ Você está offline. Conecte-se para fazer login.';
  }
}