import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import { toast } from "react-toastify";

const ContactModal = ({ isOpen, onClose, contact, onSave }) => {
const [formData, setFormData] = useState({
    name_c: "",
    company_c: "",
    email_c: "",
    phone_c: "",
    tags_c: "",
    notes_c: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (contact) {
setFormData({
        name_c: contact.name_c || contact.name || "",
        company_c: contact.company_c || contact.company || "",
        email_c: contact.email_c || contact.email || "",
        phone_c: contact.phone_c || contact.phone || "",
        tags_c: (contact.tags_c || contact.tags) ? (typeof (contact.tags_c || contact.tags) === 'string' ? contact.tags_c || contact.tags : (contact.tags_c || contact.tags).join(", ")) : "",
        notes_c: contact.notes_c || contact.notes || "",
      });
    } else {
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        tags: "",
        notes: "",
      });
    }
    setErrors({});
  }, [contact, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const contactData = {
...formData,
        tags_c: formData.tags_c
          .split(",")
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0),
      };

      await onSave(contactData);
      toast.success(contact ? "Contact updated successfully!" : "Contact created successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to save contact. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {contact ? "Edit Contact" : "Add New Contact"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ApperIcon name="X" className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
            <FormField
              label="Name"
value={formData.name_c}
              onChange={(e) => handleChange("name_c", e.target.value)}
              error={errors.name_c}
              required
              placeholder="Enter contact name"
            />

            <FormField
              label="Company"
              value={formData.company_c}
              onChange={(e) => handleChange("company_c", e.target.value)}
              error={errors.company_c}
              placeholder="Enter company name"
            />

            <FormField
              label="Email"
              type="email"
              value={formData.email_c}
              onChange={(e) => handleChange("email_c", e.target.value)}
              error={errors.email_c}
              required
              placeholder="Enter email address"
            />

            <FormField
              label="Phone"
              type="tel"
              value={formData.phone_c}
              onChange={(e) => handleChange("phone_c", e.target.value)}
              error={errors.phone_c}
              required
              placeholder="Enter phone number"
            />

            <FormField
              label="Tags"
              value={formData.tags_c}
              onChange={(e) => handleChange("tags_c", e.target.value)}
              error={errors.tags_c}
              placeholder="Enter tags separated by commas"
            />

            <FormField
              label="Notes"
              type="textarea"
              value={formData.notes_c}
              onChange={(e) => handleChange("notes_c", e.target.value)}
              error={errors.notes_c}
              placeholder="Enter any additional notes"
            />

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Save" className="h-4 w-4 mr-2" />
                    {contact ? "Update" : "Create"} Contact
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ContactModal;