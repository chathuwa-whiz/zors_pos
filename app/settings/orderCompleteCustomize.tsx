"use client";
import { useState, useEffect, useRef } from "react";
import { ReceiptTemplate } from "../types/pos";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

export default function OrderCompleteCustomize() {
  const defaultTemplate: ReceiptTemplate = {
    logoUrl: "",
    companyName: "ZORS POS",
    address: "",
    phone: "",
    email: "",
    footerGreeting: "Thank you for your business!",
  };

  const [template, setTemplate] = useState<ReceiptTemplate>(defaultTemplate);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("orderCompleteTemplate");
      if (raw) {
        const loadedTemplate = JSON.parse(raw);
        setTemplate(loadedTemplate);
        if (loadedTemplate.logoUrl) {
          setLogoPreview(loadedTemplate.logoUrl);
        }
      }
    } catch (e) {
      console.error("Failed to load template", e);
    }
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setLogoPreview(base64String);
      setTemplate({ ...template, logoUrl: base64String });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoPreview("");
    setTemplate({ ...template, logoUrl: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const save = () => {
    try {
      localStorage.setItem("orderCompleteTemplate", JSON.stringify(template));
      alert("Receipt template saved");
    } catch (e) {
      console.error("Failed to save template", e);
      alert("Failed to save template");
    }
  };

  const reset = () => {
    setTemplate(defaultTemplate);
    setLogoPreview("");
    localStorage.removeItem("orderCompleteTemplate");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-4 max-w-xl">
      <h2 className="text-lg font-semibold mb-3">Receipt / Invoice Template</h2>

      {/* Logo Upload */}
      <div className="block mb-4">
        <div className="text-sm text-gray-600 mb-2">Company Logo</div>
        
        {logoPreview ? (
          <div className="relative inline-block">
            <Image
              src={logoPreview}
              alt="Logo Preview"
              width={128}
              height={128}
              className="max-h-32 max-w-full object-contain border rounded p-2"
            />
            <button
              type="button"
              onClick={removeLogo}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              id="logo-upload"
            />
            <label 
              htmlFor="logo-upload" 
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="bg-blue-50 p-3 rounded-full mb-2">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-600">Click to upload logo</span>
              <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</span>
            </label>
          </div>
        )}
        
        {logoPreview && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center"
          >
            <ImageIcon className="w-4 h-4 mr-1" />
            Change Logo
          </button>
        )}
      </div>

      <label className="block mb-2">
        <div className="text-sm text-gray-600">Company Name</div>
        <input
          value={template.companyName || ""}
          onChange={(e) => setTemplate({ ...template, companyName: e.target.value })}
          className="w-full border rounded p-2"
        />
      </label>

      <label className="block mb-2">
        <div className="text-sm text-gray-600">Address</div>
        <textarea
          value={template.address || ""}
          onChange={(e) => setTemplate({ ...template, address: e.target.value })}
          className="w-full border rounded p-2"
          rows={3}
        />
      </label>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <label>
          <div className="text-sm text-gray-600">Phone</div>
          <input
            value={template.phone || ""}
            onChange={(e) => setTemplate({ ...template, phone: e.target.value })}
            className="w-full border rounded p-2"
          />
        </label>
        <label>
          <div className="text-sm text-gray-600">Email</div>
          <input
            value={template.email || ""}
            onChange={(e) => setTemplate({ ...template, email: e.target.value })}
            className="w-full border rounded p-2"
          />
        </label>
      </div>

      <label className="block mb-4">
        <div className="text-sm text-gray-600">Footer Greeting</div>
        <input
          value={template.footerGreeting || ""}
          onChange={(e) => setTemplate({ ...template, footerGreeting: e.target.value })}
          className="w-full border rounded p-2"
        />
      </label>

      <div className="flex gap-2">
        <button onClick={save} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          Save
        </button>
        <button onClick={reset} className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors">
          Reset
        </button>
      </div>
    </div>
  );
}