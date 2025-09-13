// Configuración centralizada de API URLs
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000/api'
  : 'https://waste-api-git-main-shls-projects-a6bf1b30.vercel.app/api'

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    // Market Prices
    MARKET_PRICES: `${API_BASE_URL}/market-prices`,
    DISPOSERS: `${API_BASE_URL}/market-prices/disposers`,
    WASTES: `${API_BASE_URL}/market-prices/wastes`,
    WASTE_TYPES: `${API_BASE_URL}/market-prices/waste-types`,
    WASTE_CATEGORIES: `${API_BASE_URL}/market-prices/waste-categories`,
    WASTE_HIERARCHY: `${API_BASE_URL}/market-prices/waste-hierarchy`,
    
    // Bulk Upload
    BULK_UPLOAD_EXCEL: `${API_BASE_URL}/bulk-upload/excel`,
    BULK_UPLOAD_TEMPLATE: `${API_BASE_URL}/bulk-upload/template`,
  }
}

export default API_CONFIG
