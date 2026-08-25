import { useEffect, useRef, useState } from "react";

import { Camera } from "lucide-react";

import { getTenantBanner, uploadTenantBanner } from "@/services/tenantService";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const TenantBanner = () => {
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadBanner();
  }, []);

  const loadBanner = async () => {
    try {
      const data = await getTenantBanner();

      if (data.bannerPath) {
        setBannerUrl(`${API_BASE_URL}/uploads/${data.bannerPath}`);
      }
    } catch (error) {
      console.error("Failed to load tenant banner:", error);
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploading(true);

      const data = await uploadTenantBanner(file);

      if (data.bannerPath) {
        setBannerUrl(`${API_BASE_URL}/uploads/${data.bannerPath}`);
      }
    } catch (error: any) {
      console.error("Failed to upload tenant banner:", error);

      alert(error?.response?.data?.detail || "Failed to upload banner.");
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <section className="relative w-full h-36 overflow-hidden bg-gray-200">
      {bannerUrl ? (
        <img
          src={bannerUrl}
          alt="Tenant Banner"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-gray-400">
          No Banner
        </div>
      )}

      <label
        className="
          absolute
          right-4
          bottom-4
          flex
          items-center
          gap-2
          px-3
          py-2
          rounded-lg
          bg-white/90
          text-gray-700
          shadow
          cursor-pointer
          hover:bg-white
        "
      >
        <Camera size={18} />

        {uploading ? "Uploading..." : "Change Banner"}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleBannerChange}
          className="hidden"
          disabled={uploading}
        />
      </label>
    </section>
  );
};

export default TenantBanner;
