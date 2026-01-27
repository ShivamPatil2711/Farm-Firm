// src/components/AddCrop.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "./Button";
import { Input } from "./Input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
import { Badge } from "./Badge";
import { Upload, X, Plus } from "lucide-react";

const AddCrop = () => {
  const navigate = useNavigate();
const backend_url="http://localhost:4003";
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    minQuantity: "",
    totalQuantity: "",
    unit: "kg",
    quality: "A",
    description: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("Image size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Crop name is required";
    if (!formData.price || formData.price <= 0) newErrors.price = "Valid price is required";
    if (!formData.totalQuantity || formData.totalQuantity <= 0) {
      newErrors.totalQuantity = "Total available quantity is required";
    }
    if (!formData.minQuantity || formData.minQuantity <= 0) {
      newErrors.minQuantity = "Minimum order quantity is required";
    }
    if (Number(formData.minQuantity) > Number(formData.totalQuantity)) {
      newErrors.minQuantity = "Min quantity cannot exceed total quantity";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Prepare form data for submission (example structure)
    const submitData = new FormData();
    submitData.append("cropname", formData.name);
    submitData.append("price", formData.price);
    submitData.append("minquantity", formData.minQuantity);
    submitData.append("totalavailable", formData.totalQuantity);
    submitData.append("grade", formData.quality);
    if (imageFile) {
      submitData.append("img", imageFile);
    }
console.log(submitData);
    try {
    
       const response = await fetch(`${backend_url}/api/add-crop`, {
        method: "POST",
        body: submitData,
         credentials: "include",
       });
const data = await response.json();
console.log("kjsckjsnbjkds",data);
      navigate("/crops"); // or "/my-listed-crops"
    } catch (error) {
      console.error("Error adding crop:", error);
      alert("Failed to list crop. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 pt-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold">List New Crop</CardTitle>
                <CardDescription className="text-base mt-1">
                  Add your fresh produce to reach more buyers
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Image Upload */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground">
                  Crop Image <span className="text-destructive">*</span>
                </label>

                {imagePreview ? (
                  <div className="relative rounded-lg overflow-hidden border-2 border-primary/30 bg-muted/50">
                    <img
                      src={imagePreview}
                      alt="Crop preview"
                      className="w-full h-64 object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-3 right-3 bg-destructive text-white rounded-full p-2 hover:bg-destructive/90 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-input rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                    <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                    <span className="text-sm font-medium text-foreground">
                      Click to upload crop photo
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, max 5MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>

              {/* Crop Name */}
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Crop Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Wheat (Sharbati)"
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Price & Unit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <label htmlFor="price" className="text-sm font-medium">
                    Price per unit <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="1"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="e.g. 2850"
                      className={`pl-8 ${errors.price ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price}</p>
                  )}
                </div>

                
              </div>

              {/* Quantity Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <label htmlFor="totalQuantity" className="text-sm font-medium">
                    Total Available Quantity <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="totalQuantity"
                    name="totalQuantity"
                    type="number"
                    min="1"
                    value={formData.totalQuantity}
                    onChange={handleInputChange}
                    placeholder="e.g. 1200"
                    className={errors.totalQuantity ? "border-destructive" : ""}
                  />
                  {errors.totalQuantity && (
                    <p className="text-sm text-destructive">{errors.totalQuantity}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <label htmlFor="minQuantity" className="text-sm font-medium">
                    Minimum Order Quantity <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="minQuantity"
                    name="minQuantity"
                    type="number"
                    min="1"
                    value={formData.minQuantity}
                    onChange={handleInputChange}
                    placeholder="e.g. 100"
                    className={errors.minQuantity ? "border-destructive" : ""}
                  />
                  {errors.minQuantity && (
                    <p className="text-sm text-destructive">{errors.minQuantity}</p>
                  )}
                </div>
              </div>

              {/* Quality Grade */}
              <div className="grid gap-2">
                <label className="text-sm font-medium">Quality Grade</label>
                <Select
                  value={formData.quality}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, quality: value }))}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Grade A (Premium)</SelectItem>
                    <SelectItem value="B">Grade B (Good)</SelectItem>
                    <SelectItem value="C">Grade C (Standard)</SelectItem>
                  </SelectContent>
                </Select>

              </div>

             

              {/* Submit Buttons */}
              <CardFooter className="flex justify-between pt-8 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/crops")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[180px]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
                      </svg>
                      Listing...
                    </span>
                  ) : (
                    "List Crop for Sale"
                  )}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddCrop;