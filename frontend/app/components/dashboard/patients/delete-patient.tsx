import { Patient } from "@/types/user";
import Modal from "../layout/modal";

interface DeletePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

export const DeletePatientModal: React.FC<DeletePatientModalProps> = ({
  isOpen,
  onClose,
  patient,
}) => {
  const handleDelete = () => {
    // Implement DELETE API call here
    console.log("Deleting patient:", patient);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
      <p className="mb-4">
        Are you sure you want to delete{" "}
        <strong>
          {patient?.first_name} {patient?.last_name}
        </strong>
        ?
      </p>
      <div className="flex justify-end space-x-2">
        <button className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>
          Cancel
        </button>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded"
          onClick={handleDelete}>
          Delete
        </button>
      </div>
    </Modal>
  );
};
