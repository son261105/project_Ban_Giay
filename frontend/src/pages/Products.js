import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getProducts, getBrands, getCategories } from '../services/api';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const Products = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    brand_id: searchParams.get('brand') || '',
    category: '',
    min_price: '',
    max_price: '',
    page: 1,
  });

  const filtersRef = useRef(filters);

  useEffect(() => {
    getBrands().then(r => setBrands(r.data.brands)).catch(() => {});
    getCategories().then(r => setCategories(r.data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    filtersRef.current = filters;
    const fetch = async () => {
      setLoading(true);
      try {
        const params = {};
        Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
        const res = await getProducts({ ...params, limit: 12 });
        setProducts(res.data.products);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      } catch { setProducts([]); }
      finally { setLoading(false); }
    };
    fetch();
  }, [filters]);

  const handleSearch = () => {
    setFilters(f => ({ ...f, search: searchInput, min_price: minPrice, max_price: maxPrice, page: 1 }));
  };

  const handleReset = () => {
    setSearchInput('');
    setMinPrice('');
    setMaxPrice('');
    setFilters({ search: '', brand_id: '', category: '', min_price: '', max_price: '', page: 1 });
  };

  return (
    <div className="container page">
      <div className="page-header">
        <h1 className="page-title">SẢN PHẨM ({total})</h1>
      </div>

      <form className="filter-bar" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
        <input placeholder="🔍 Tìm kiếm sản phẩm..." value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }} />
        <select value={filters.brand_id} onChange={e => setFilters(f => ({ ...f, brand_id: e.target.value, page: 1 }))}>
          <option value="">Tất cả thương hiệu</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value, page: 1 }))}>
          <option value="">Tất cả danh mục</option>
          {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select
  value={`${minPrice}-${maxPrice}`}
  onChange={e => {
    const val = e.target.value;
    if (val === '') { setMinPrice(''); setMaxPrice(''); }
    else if (val === '0-1000000') { setMinPrice('0'); setMaxPrice('1000000'); }
    else if (val === '1000000-2000000') { setMinPrice('1000000'); setMaxPrice('2000000'); }
    else if (val === '2000000-3000000') { setMinPrice('2000000'); setMaxPrice('3000000'); }
    else if (val === '3000000-5000000') { setMinPrice('3000000'); setMaxPrice('5000000'); }
    else if (val === '5000000-') { setMinPrice('5000000'); setMaxPrice(''); }
    setFilters(f => ({ ...f, page: 1,
      min_price: val === '' ? '' : val === '5000000-' ? '5000000' : val.split('-')[0],
      max_price: val === '' ? '' : val === '5000000-' ? '' : val.split('-')[1]
    }));
  }}
  style={{ width: 160 }}>
  <option value="">Tất cả mức giá</option>
  <option value="0-1000000">Dưới 1 triệu</option>
  <option value="1000000-2000000">1 - 2 triệu</option>
  <option value="2000000-3000000">2 - 3 triệu</option>
  <option value="3000000-5000000">3 - 5 triệu</option>
  <option value="5000000-">Trên 5 triệu</option>
</select>
        <button type="submit" className="btn btn-primary btn-sm">Lọc</button>
        <button type="button" className="btn btn-outline btn-sm" onClick={handleReset}>Xóa lọc</button>
      </form>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <button className={`btn btn-sm ${!filters.brand_id ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilters(f => ({ ...f, brand_id: '', page: 1 }))}>Tất cả</button>
        {brands.map(b => (
          <button key={b.id} className={`btn btn-sm ${filters.brand_id == b.id ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilters(f => ({ ...f, brand_id: b.id, page: 1 }))}>{b.name}</button>
        ))}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h2>😕</h2><p>Không tìm thấy sản phẩm nào</p>
          <button className="btn btn-primary" onClick={handleReset}>Xem tất cả</button>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {products.map(product => (
              <div key={product.id} className="product-card" onClick={() => navigate(`/products/${product.id}`)}>
                <img src={product.image_url} alt={product.name}
                  onError={e => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }} />
                <div className="product-card-body">
                  <div className="product-card-brand">{product.brand_name}</div>
                  <div className="product-card-name">{product.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <div className="product-card-price">{formatPrice(product.price)}</div>
                    <span style={{
                      fontSize: 12, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
                      background: product.stock > 0 ? '#E8F5E9' : '#FFEBEE',
                      color: product.stock > 0 ? '#2E7D32' : '#c62828'
                    }}>
                      {product.stock > 0 ? `Còn ${product.stock}` : 'Hết hàng'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={filters.page === p ? 'active' : ''}
                  onClick={() => setFilters(f => ({ ...f, page: p }))}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;