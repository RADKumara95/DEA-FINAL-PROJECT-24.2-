import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const UpdateProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [image, setImage] = useState();
  const [imagePreview, setImagePreview] = useState(null);
  const [imageErrors, setImageErrors] = useState([]);
  const [updateProduct, setUpdateProduct] = useState({
    id: null,
    name: "",
    description: "",
    brand: "",
    price: "",
    category: "",
    releaseDate: "",
    productAvailable: false,
    stockQuantity: "",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/product/${id}`
        );

        setProduct(response.data);
      
        const responseImage = await axios.get(
          `http://localhost:8080/api/product/${id}/image`,
          { responseType: "blob" }
        );
       const imageFile = await converUrlToFile(responseImage.data,response.data.imageName)
        setImage(imageFile);     
        setUpdateProduct(response.data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    console.log("image Updated", image);
  }, [image]);



  const converUrlToFile = async(blobData, fileName) => {
    const file = new File([blobData], fileName, { type: blobData.type });
    return file;
  }
 
  const handleSubmit = async(e) => {
    e.preventDefault();
    if (imageErrors.length) {
      alert('Please fix image validation errors before submitting');
      return;
    }
    console.log("images", image)
    console.log("productsdfsfsf", updateProduct)
    const updatedProduct = new FormData();
    updatedProduct.append("imageFile", image);
    updatedProduct.append(
      "product",
      new Blob([JSON.stringify(updateProduct)], { type: "application/json" })
    );
  

  console.log("formData : ", updatedProduct)
    axios
      .put(`http://localhost:8080/api/product/${id}`, updatedProduct, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log("Product updated successfully:", updatedProduct);
        alert("Product updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating product:", error);
        console.log("product unsuccessfull update",updateProduct)
        alert("Failed to update product. Please try again.");
      });
  };
 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdateProduct({
      ...updateProduct,
      [name]: value,
    });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const newErrors = [];

    if (!allowedTypes.includes(file.type)) {
      newErrors.push("Invalid file type. Only JPG, PNG and WEBP are allowed.");
    }
    if (file.size > maxSize) {
      newErrors.push("File size exceeds 5MB.");
    }

    if (newErrors.length) {
      setImageErrors(newErrors);
      setImage(null);
      setImagePreview(null);
      return;
    }

    setImageErrors([]);
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" style={{marginTop:"7rem"}}>
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Update Product</h1>
          </div>
          
          <form className="p-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder={product.name}
                  value={updateProduct.name}
                  onChange={handleChange}
                  name="name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder={product.brand}
                  value={updateProduct.brand}
                  onChange={handleChange}
                  id="brand"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder={product.description}
                name="description"
                onChange={handleChange}
                value={updateProduct.description}
                id="description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  onChange={handleChange}
                  value={updateProduct.price}
                  placeholder={product.price}
                  name="price"
                  id="price"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  value={updateProduct.category}
                  onChange={handleChange}
                  name="category"
                  id="category"
                >
                  <option value="">Select category</option>
                  <option value="laptop">Laptop</option>
                  <option value="headphone">Headphone</option>
                  <option value="mobile">Mobile</option>
                  <option value="electronics">Electronics</option>
                  <option value="toys">Toys</option>
                  <option value="fashion">Fashion</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  onChange={handleChange}
                  placeholder={product.stockQuantity}
                  value={updateProduct.stockQuantity}
                  name="stockQuantity"
                  id="stockQuantity"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Image
              </label>
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                {(imagePreview || image) && (
                  <div className="mb-4">
                    <img
                      src={imagePreview ? imagePreview : (image ? URL.createObjectURL(image) : "")}
                      alt={product.imageName}
                      className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                  </div>
                )}
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  type="file"
                  onChange={handleImageChange}
                  placeholder="Upload image"
                  name="imageUrl"
                  id="imageUrl"
                />
                {imageErrors.length > 0 && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    {imageErrors.map((err, idx) => (
                      <div key={idx} className="text-red-700 text-sm">{err}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                type="checkbox"
                name="productAvailable"
                id="gridCheck"
                checked={updateProduct.productAvailable}
                onChange={(e) =>
                  setUpdateProduct({ ...updateProduct, productAvailable: e.target.checked })
                }
              />
              <label className="text-sm font-medium text-gray-700" htmlFor="gridCheck">
                Product Available for Purchase
              </label>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button 
                type="submit" 
                className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Update Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProduct;