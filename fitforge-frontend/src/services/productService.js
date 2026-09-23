import api from "./api";

// Get products for customer shop
export const getProducts = async (params = {}) => {
  const response = await api.get("/products", {
    params,
  });

  return response.data;
};

// Get single product
export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);

  return response.data;
};