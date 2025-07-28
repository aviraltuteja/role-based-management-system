"use client";
import { useEffect, useState } from "react";
import { Table } from "@/app/components/dashboard/table/table";
import axios from "axios";
import { Patient } from "@/types/user";
import { EditPatientModal } from "@/app/components/dashboard/patients/edit-patient";
import { DeletePatientModal } from "@/app/components/dashboard/patients/delete-patient";
import toast from "react-hot-toast";

const mockPatients: Patient[] = [
  {
    id: "1a2b3c",
    first_name: "Alice",
    last_name: "Johnson",
    date_of_birth: "1990-05-12",
    gender: "Female",
    user_id: null,
  },
  {
    id: "4d5e6f",
    first_name: "Bob",
    last_name: "Smith",
    date_of_birth: "1985-09-23",
    gender: "Male",
    user_id: "abc123",
  },
  {
    id: "7g8h9i",
    first_name: "Charlie",
    last_name: "Lee",
    date_of_birth: "1978-03-30",
    gender: "Other",
    user_id: null,
  },
];

export default function MockPatients() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const fetchPatients = async () => {
    const loadingToast = toast.loading("Loading patients...");
    try {
      const res = await axios.get("http://localhost:8000/patients");
      const apiPatients = res.data?.data;
      if (Array.isArray(apiPatients)) {
        setPatients(apiPatients);
        toast.success("Patients loaded successfully!", { id: loadingToast });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Failed to fetch patients", err);
      toast.error("Failed to load patients. Showing mock data.", {
        id: loadingToast,
      });
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setEditModalOpen(true);
  };

  const handleDelete = (patient: Patient) => {
    setSelectedPatient(patient);
    setDeleteModalOpen(true);
  };

  return (
    <main className="max-w-6xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Patient Table</h1>

      <Table data={patients} onEdit={handleEdit} onDelete={handleDelete} />

      <EditPatientModal
        isOpen={editModalOpen}
        onClose={async () => {
          setEditModalOpen(false);
          await fetchPatients();
        }}
        patient={selectedPatient}
      />

      <DeletePatientModal
        isOpen={deleteModalOpen}
        onClose={async () => {
          setDeleteModalOpen(false);
          await fetchPatients();
        }}
        patient={selectedPatient}
      />
    </main>
  );
}
