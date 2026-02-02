import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../axios";

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [originalProduct, setOriginalProduct] = useState(null);
  const [image, setImage] = useState(null);

  const [updateProduct, setUpdateProduct] = useState({
    name: "",
    description: "",
    brand: "",
    price: "",
    category: "",
    releaseDate: "",
    available: false,
    quantity: "",
  });

  // ✅ Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/product/${id}?includeImage=true`,
        );

        setProduct(response.data);
        setUpdateProduct(response.data);
        setOriginalProduct(response.data); // snapshot
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  // ✅ Detect changes
  const isProductChanged = () => {
    if (!originalProduct) return false;

    const fieldsChanged = Object.keys(updateProduct).some(
      (key) => updateProduct[key] !== originalProduct[key],
    );

    const imageChanged = image !== null;

    return fieldsChanged || imageChanged;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isProductChanged()) {
      alert("No changes detected");
      return;
    }

    const formData = new FormData();

    formData.append(
      "product",
      new Blob([JSON.stringify(updateProduct)], {
        type: "application/json",
      }),
    );

    if (image) {
      formData.append("productImage", image);
    }

    try {
      await axios.put(`http://localhost:8080/product/${id}`, formData);
      alert("Product updated successfully");
      navigate(`/product/${id}`);
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdateProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  if (!product) {
    return <h2 style={{ padding: "10rem" }}>Loading...</h2>;
  }

  return (
    <div className="update-product-container">
      <div className="center-container" style={{ marginTop: "7rem" }}>
        <h1>Update Product</h1>

        <form className="row g-3 pt-1" onSubmit={handleSubmit}>
          <div className="col-md-6">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={updateProduct.name}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Brand</label>
            <input
              type="text"
              className="form-control"
              name="brand"
              value={updateProduct.brand}
              onChange={handleChange}
            />
          </div>

          <div className="col-12">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-control"
              name="description"
              value={updateProduct.description}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Price</label>
            <input
              type="number"
              className="form-control"
              name="price"
              value={updateProduct.price}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              name="category"
              value={updateProduct.category}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="Laptop">Laptop</option>
              <option value="Headphone">Headphone</option>
              <option value="Mobile">Mobile</option>
              <option value="Electronics">Electronics</option>
              <option value="Toys">Toys</option>
              <option value="Fashion">Fashion</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Quantity</label>
            <input
              type="number"
              className="form-control"
              name="quantity"
              value={updateProduct.quantity}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-8">
            <label className="form-label">Image</label>
            <img
              src={
                product.imageData
                  ? `data:${product.imageType};base64,${product.imageData}`
                  : "/placeholder.png"
              }
              alt={product.name}
              style={{
                width: "100%",
                height: "180px",
                objectFit: "cover",
                marginBottom: "10px",
              }}
            />
            <input
              className="form-control"
              type="file"
              onChange={handleImageChange}
            />
          </div>

          <div className="col-12">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={updateProduct.available}
                onChange={(e) =>
                  setUpdateProduct((prev) => ({
                    ...prev,
                    available: e.target.checked,
                  }))
                }
              />
              <label className="form-check-label">Product Available</label>
            </div>
          </div>

          <div className="col-12">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isProductChanged()}
            >
              Update Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProduct;
