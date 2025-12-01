 
   const API = 'https://dummyjson.com/products/category/fragrances';
    const catalogueEl = document.getElementById('catalogue');
    const emptyEl = document.getElementById('empty');
    const searchInput = document.getElementById('search');
    const brandFilter = document.getElementById('brandFilter');
    const resetBtn = document.getElementById('resetBtn');

    let produits = [];

    function createCard(p){
      const div = document.createElement('div');
      div.className = 'carte';
      const img = p.images && p.images.length ? p.images[0] : p.thumbnail || '';
      div.innerHTML = `
        <img src="${img}" alt="${escapeHtml(p.title)}">
        <div>
          <h3 class="title">${escapeHtml(p.title)}</h3>
          <div class="meta">${truncate(escapeHtml(p.description), 80)}</div>
        </div>
        <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center">
          <div class="price">${p.price} €</div>
          <div class="meta">Stock: ${p.stock}</div>
        </div>
      `;
      return div;
    }
    function render(list){
      catalogueEl.innerHTML = '';
      if(!list.length){ emptyEl.hidden = false; return }
      emptyEl.hidden = true;
      const fragment = document.createDocumentFragment();
      list.forEach(p => fragment.appendChild(createCard(p)));
      catalogueEl.appendChild(fragment);
    }
    function loadBrands(list){
      const brands = Array.from(new Set(list.map(p => p.brand))).sort();
      brandFilter.innerHTML = '<option value="">Toutes les marques</option>' + brands.map(b => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join('');
    }
    function applyFilters(){
      const q = searchInput.value.trim().toLowerCase();
      const brand = brandFilter.value;
      const filtered = produits.filter(p => {
        const matchesQ = !q || (p.title && p.title.toLowerCase().includes(q)) || (p.description && p.description.toLowerCase().includes(q));
        const matchesBrand = !brand || p.brand === brand;
        return matchesQ && matchesBrand;
      });
      render(filtered);
    }
    function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]) }
    function truncate(s, n){ return s.length > n ? s.slice(0,n-1) + '…' : s }
    async function fetchAndRender(){
      resetBtn.disabled = true;
      resetBtn.textContent = 'Chargement...';
      try{
        const res = await fetch(API);
        if(!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        produits = data.products || [];
        loadBrands(produits);
        applyFilters();
      }catch(err){
        catalogueEl.innerHTML = '<div class="empty">Erreur lors de la récupération des données.</div>';
        console.error(err);
      }finally{
        resetBtn.disabled = false;
        resetBtn.textContent = 'Rafraîchir';
      }
    }
    resetBtn.addEventListener('click', fetchAndRender);
    searchInput.addEventListener('input', () => applyFilters());
    brandFilter.addEventListener('change', () => applyFilters());
    fetchAndRender();
