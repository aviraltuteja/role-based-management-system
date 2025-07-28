"use client";
import React, { useState, useEffect } from "react";
import Modal from "../layout/modal";
import { Patient } from "@/types/user";
import { Toaster, toast } from "react-hot-toast";

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

export const EditPatientModal: React.FC<EditPatientModalProps> = ({
  isOpen,
  onClose,
  patient,
}) => {
  const [formData, setFormData] = useState<Partial<Patient>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (patient) {
      setFormData(patient);
    }
  }, [patient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!patient?.id) {
      toast.error("No patient selected");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/patients/${patient.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update patient");
      }

      toast.success("Patient updated successfully!");
      setTimeout(onClose, 1000); // Delay closing to show toast
    } catch (error) {
      toast.error("Failed to update patient");
      console.error("Error updating patient:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Modal isOpen={isOpen} onClose={onClose} title="Edit Patient">
        <div className="space-y-4 text-gray-900">
          <input
            className="border w-full px-4 py-2 rounded"
            name="first_name"
            placeholder="First Name"
            value={formData.first_name || ""}
            onChange={handleChange}
            disabled={isLoading}
          />
          <input
            className="border w-full px-4 py-2 rounded"
            name="last_name"
            placeholder="Last Name"
            value={formData.last_name || ""}
            onChange={handleChange}
            disabled={isLoading}
          />
          <input
            className="border w-full px-4 py-2 rounded"
            name="date_of_birth"
            type="date"
            value={formData.date_of_birth || ""}
            onChange={handleChange}
            disabled={isLoading}
          />
          <input
            className="border w-full px-4 py-2 rounded"
            name="gender"
            placeholder="Gender"
            value={formData.gender || ""}
            onChange={handleChange}
            disabled={isLoading}
          />
          <button
            className={`bg-blue-600 text-white px-4 py-2 rounded ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
            onClick={handleSubmit}
            disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </Modal>
    </>
  );
};
