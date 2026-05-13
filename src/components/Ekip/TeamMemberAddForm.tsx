"use client";
import React, { useState } from "react";
import { addTeamMember } from "@/lib/admin/action";
import { uploadToSignedURL } from "@/lib/admin/action";
import {
  HiUser,
  HiIdentification,
  HiBriefcase,
  HiDocumentText,
  HiLink,
  HiUserCircle,
  HiCamera,
  HiPlus,
  HiTrash,
} from "react-icons/hi2";
import { MdSchool, MdNumbers } from "react-icons/md";
import { FaLinkedin, FaTwitter } from "react-icons/fa";
import { MdEmail, MdWeb } from "react-icons/md";
import { VscLoading } from "react-icons/vsc";
import { toast } from "react-toastify";

interface Education {
  degree: string;
  field: string;
  institution: string;
  year: string;
}

interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  email?: string;
  website?: string;
}

export default function TeamMemberAddForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    title: "",
    about: "",
    order: 0,
    metaDescription: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [education, setEducation] = useState<Education[]>([
    { degree: "", field: "", institution: "", year: "" },
  ]);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    linkedin: "",
    twitter: "",
    email: "",
    website: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleEducationChange = (
    index: number,
    field: keyof Education,
    value: string
  ) => {
    const newEducation = [...education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setEducation(newEducation);
  };

  const addEducation = () => {
    setEducation([
      ...education,
      { degree: "", field: "", institution: "", year: "" },
    ]);
  };

  const removeEducation = (index: number) => {
    if (education.length > 1) {
      setEducation(education.filter((_, i) => i !== index));
    }
  };

  const handleSocialLinkChange = (
    platform: keyof SocialLinks,
    value: string
  ) => {
    setSocialLinks({ ...socialLinks, [platform]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Form validation
      // Form validation - trim and check empty strings
      const trimmedForm = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        title: form.title.trim(),
        about: form.about.trim(),
        metaDescription: form.metaDescription.trim(),
      };

      if (
        !trimmedForm.firstName ||
        !trimmedForm.lastName ||
        !trimmedForm.title ||
        !trimmedForm.about
      ) {
        throw new Error("Tüm zorunlu alanları doldurun.");
      }

      // Validate education
      const validEducation = education
        .map((edu) => ({
          degree: edu.degree.trim(),
          field: edu.field.trim(),
          institution: edu.institution.trim(),
          year: edu.year.trim(),
        }))
        .filter(
          (edu) => edu.degree || edu.field || edu.institution || edu.year
        );

      if (validEducation.length === 0) {
        throw new Error("En az bir eğitim bilgisi girmelisiniz.");
      }

      // Validate education fields - all fields must be filled for each education
      for (const edu of validEducation) {
        if (!edu.degree || !edu.field || !edu.institution || !edu.year) {
          throw new Error("Eğitim bilgilerinin tüm alanlarını doldurun.");
        }
      }
      const validSocialLinks = Object.fromEntries(
        Object.entries(socialLinks)
          .map(([key, value]) => [key, value.trim()])
          .filter(([_, value]) => value !== "")
      );

      // Prepare form data
      const formData = new FormData();
      if (photo) {
        formData.append("photo", photo);
      }
      formData.append("firstName", trimmedForm.firstName);
      formData.append("lastName", trimmedForm.lastName);
      formData.append("title", trimmedForm.title);
      formData.append("about", trimmedForm.about);

      // Order değerini güvenli şekilde ekle
      const orderValue =
        typeof form.order === "number" && !isNaN(form.order)
          ? Math.max(0, form.order)
          : 0;

      formData.append("order", orderValue.toString());

      formData.append("metaDescription", trimmedForm.metaDescription);

      // Send education as individual fields for array parsing
      validEducation.forEach((edu, index) => {
        formData.append(`education[${index}][degree]`, edu.degree);
        formData.append(`education[${index}][field]`, edu.field);
        formData.append(`education[${index}][institution]`, edu.institution);
        formData.append(`education[${index}][year]`, edu.year);
      });

      // Send socialLinks as individual fields for object parsing
      Object.entries(validSocialLinks).forEach(([key, value]) => {
        formData.append(`socialLinks[${key}]`, value as string);
      });

      const res = await addTeamMember(formData);

      toast.success("Ekip üyesi başarıyla eklendi!", {
        position: "top-right",
        autoClose: 3000,
      });

      // Ekip sayfasına yönlendir
      window.location.href = "/ekip";
    } catch (err: any) {
      toast.error(err.message || "Bir hata oluştu.", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[100vh] w-full py-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 shadow-2xl rounded-2xl p-10 w-full max-w-4xl flex flex-col gap-6 border border-gray-200 backdrop-blur-md animate-fade-in"
      >
        <div className="flex flex-col items-center mb-2">
          <HiUserCircle className="text-5xl text-purple-600 mb-1" />
          <h2 className="text-3xl font-extrabold text-center text-gray-800 tracking-tight">
            Ekip Üyesi Ekle
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Yeni ekip üyesi eklemek için formu doldurun.
          </p>
        </div>

        {/* Photo */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="photo"
            className="font-medium text-gray-700 flex items-center gap-2"
          >
            <HiCamera className="text-lg text-purple-500" /> Fotoğraf *
          </label>
          <div className="relative">
            <input
              id="photo"
              name="photo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="pl-10 pr-3 border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-white shadow-sm"
              required
            />
            <HiCamera className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          {photo && (
            <p className="text-sm text-gray-600 mt-1">
              Seçilen dosya: {photo.name}
            </p>
          )}
        </div>

        {/* First Name & Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="firstName"
              className="font-medium text-gray-700 flex items-center gap-2"
            >
              <HiIdentification className="text-lg text-purple-500" /> Ad *
            </label>
            <div className="relative">
              <input
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Ad"
                className="pl-10 pr-3 border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-white shadow-sm"
                autoComplete="off"
                required
              />
              <HiIdentification className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="lastName"
              className="font-medium text-gray-700 flex items-center gap-2"
            >
              <HiIdentification className="text-lg text-purple-500" /> Soyad *
            </label>
            <div className="relative">
              <input
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Soyad"
                className="pl-10 pr-3 border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-white shadow-sm"
                autoComplete="off"
                required
              />
              <HiIdentification className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="title"
            className="font-medium text-gray-700 flex items-center gap-2"
          >
            <HiBriefcase className="text-lg text-purple-500" /> Pozisyon/Unvan *
          </label>
          <div className="relative">
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Örn: Kıdemli Yazılım Geliştirici"
              className="pl-10 pr-3 border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-white shadow-sm"
              autoComplete="off"
              required
            />
            <HiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* About */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="about"
            className="font-medium text-gray-700 flex items-center gap-2"
          >
            <HiDocumentText className="text-lg text-purple-500" /> Hakkımda *
          </label>
          <textarea
            id="about"
            name="about"
            value={form.about}
            onChange={handleChange}
            placeholder="Ekip üyesi hakkında bilgi..."
            rows={4}
            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-white shadow-sm resize-vertical"
            required
          />
        </div>
        {/* Order */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="order"
            className="font-medium text-gray-700 flex items-center gap-2"
          >
            <MdNumbers className="text-lg text-purple-500" /> Sıralama (Order)
          </label>
          <input
            id="order"
            name="order"
            type="number"
            min="0"
            value={form.order}
            onChange={(e) => {
              const value = e.target.value;
              const numValue = value === "" ? 0 : parseInt(value, 10);
              setForm({
                ...form,
                order: isNaN(numValue) ? 0 : Math.max(0, numValue),
              });
            }}
            placeholder="Ekip üyesinin sıralamadaki yeri (0 en üstte)"
            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-white shadow-sm"
          />
        </div>

        {/* Meta Description */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="metaDescription"
            className="font-medium text-gray-700 flex items-center gap-2"
          >
            <HiDocumentText className="text-lg text-purple-500" /> Meta Açıklama
          </label>
          <textarea
            id="metaDescription"
            name="metaDescription"
            value={form.metaDescription}
            onChange={handleChange}
            placeholder="SEO için kısa açıklama (150 karakter önerilir)..."
            rows={2}
            maxLength={160}
            className="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-white shadow-sm resize-vertical"
          />
          <p className="text-xs text-gray-500">
            {form.metaDescription.length}/160 karakter
          </p>
        </div>

        {/* Education */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <label className="font-medium text-gray-700 flex items-center gap-2">
              <MdSchool className="text-lg text-purple-500" /> Eğitim Bilgisi *
            </label>
            <button
              type="button"
              onClick={addEducation}
              className="flex items-center gap-2 px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition"
            >
              <HiPlus className="w-4 h-4" />
              Eğitim Ekle
            </button>
          </div>

          {education.map((edu, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 bg-gray-50/50"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-700">
                  Eğitim {index + 1}
                </h4>
                {education.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="flex items-center gap-1 px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm font-medium transition"
                  >
                    <HiTrash className="w-3 h-3" />
                    Sil
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-600">
                    Derece *
                  </label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) =>
                      handleEducationChange(index, "degree", e.target.value)
                    }
                    placeholder="Örn: Lisans, Yüksek Lisans"
                    className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-white shadow-sm"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-600">
                    Alan *
                  </label>
                  <input
                    type="text"
                    value={edu.field}
                    onChange={(e) =>
                      handleEducationChange(index, "field", e.target.value)
                    }
                    placeholder="Örn: Bilgisayar Mühendisliği"
                    className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-white shadow-sm"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-600">
                    Kurum *
                  </label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) =>
                      handleEducationChange(
                        index,
                        "institution",
                        e.target.value
                      )
                    }
                    placeholder="Örn: İstanbul Teknik Üniversitesi"
                    className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-white shadow-sm"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-600">
                    Mezuniyet Yılı *
                  </label>
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) =>
                      handleEducationChange(index, "year", e.target.value)
                    }
                    placeholder="Örn: 2020"
                    className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-white shadow-sm"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social Links */}
        <div className="flex flex-col gap-4">
          <label className="font-medium text-gray-700 flex items-center gap-2">
            <HiLink className="text-lg text-purple-500" /> Sosyal Medya
            Bağlantıları
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <FaLinkedin className="text-blue-600" /> LinkedIn
              </label>
              <input
                type="url"
                value={socialLinks.linkedin}
                onChange={(e) =>
                  handleSocialLinkChange("linkedin", e.target.value)
                }
                placeholder="https://linkedin.com/in/username"
                className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-white shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <FaTwitter className="text-blue-400" /> Twitter
              </label>
              <input
                type="url"
                value={socialLinks.twitter}
                onChange={(e) =>
                  handleSocialLinkChange("twitter", e.target.value)
                }
                placeholder="https://twitter.com/username"
                className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-white shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <MdEmail className="text-red-500" /> E-posta
              </label>
              <input
                type="email"
                value={socialLinks.email}
                onChange={(e) =>
                  handleSocialLinkChange("email", e.target.value)
                }
                placeholder="ahmet@company.com"
                className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-white shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <MdWeb className="text-green-500" /> Website
              </label>
              <input
                type="url"
                value={socialLinks.website}
                onChange={(e) =>
                  handleSocialLinkChange("website", e.target.value)
                }
                placeholder="https://ahmetyilmaz.com"
                className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all bg-white shadow-sm"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all text-white p-3 rounded-lg font-semibold mt-2 shadow-md disabled:opacity-60 disabled:cursor-not-allowed text-lg tracking-wide"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <VscLoading className="animate-spin text-xl" />
              Ekleniyor...
            </span>
          ) : (
            "Ekip Üyesi Ekle"
          )}
        </button>
      </form>
    </div>
  );
}
