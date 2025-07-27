import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField,
  IconButton
} from '@mui/material';
import { FiX } from 'react-icons/fi';

// Interface untuk data pasien
interface PatientData {
  id?: string | number;
  nik: string;
  name: string;
  place_of_birth: string;
  date_of_birth: string;
  address: string;
  number_phone: string;
  email: string;
}

// Interface untuk error validasi
interface ValidationErrors {
  nik: string;
  name: string;
  place_of_birth: string;
  date_of_birth: string;
  address: string;
  number_phone: string;
  email: string;
}

// Interface untuk props komponen
interface PatientFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (patientData: PatientData) => void;
  patient?: PatientData;
  mode: 'add' | 'update';
}

// Default empty patient data
const defaultPatientData: PatientData = {
  nik: '',
  name: '',
  place_of_birth: '',
  date_of_birth: '',
  address: '',
  number_phone: '',
  email: ''
};

// Default empty errors
const defaultErrors: ValidationErrors = {
  nik: '',
  name: '',
  place_of_birth: '',
  date_of_birth: '',
  address: '',
  number_phone: '',
  email: ''
};

const PatientFormDialog: React.FC<PatientFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  patient = defaultPatientData,
  mode = 'add'
}) => {
  const [patientData, setPatientData] = useState<PatientData>(patient);
  const [errors, setErrors] = useState<ValidationErrors>(defaultErrors);

  // Reset form when opening or changing patient data
  useEffect(() => {
    if (open) {
      setPatientData(patient);
      setErrors(defaultErrors);
    }
  }, [open, patient]);

  // Handle form field changes
  const handleChange = (field: keyof ValidationErrors, value: string) => {
    setPatientData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate NIK
  const validateNIK = () => {
    if (patientData.nik.length !== 16) {
      setErrors(prev => ({
        ...prev,
        nik: "NIK must be 16 digits"
      }));
      return false;
    }
    setErrors(prev => ({ ...prev, nik: "" }));
    return true;
  };

  // Validate Phone Number
  const validatePhoneNumber = () => {
    const { number_phone } = patientData;
    
    if (number_phone.length < 11 || number_phone.length > 13) {
      setErrors(prev => ({
        ...prev,
        number_phone: "Phone number must be between 11 and 13 digits"
      }));
      return false;
    } else if (!number_phone.startsWith("08")) {
      setErrors(prev => ({
        ...prev,
        number_phone: "Invalid Phone Number, must start with '08'"
      }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, number_phone: "" }));
    return true;
  };

  // Validate Email
  const validateEmail = () => {
    const { email } = patientData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
      setErrors(prev => ({
        ...prev,
        email: "Please enter a valid email address"
      }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, email: "" }));
    return true;
  };

  // Validate Required Fields
  const validateRequiredFields = () => {
    const requiredFields = ['name', 'place_of_birth', 'date_of_birth', 'address'] as const;
    let isValid = true;
    
    const newErrors = { ...errors };
    
    requiredFields.forEach(field => {
      if (!patientData[field]) {
        newErrors[field] = `${field.replace(/_/g, ' ')} is required`;
        isValid = false;
      } else {
        newErrors[field] = '';
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = () => {
    // Validate all fields
    const isNikValid = validateNIK();
    const isPhoneValid = validatePhoneNumber();
    const isEmailValid = validateEmail();
    const areRequiredFieldsValid = validateRequiredFields();
    
    if (isNikValid && isPhoneValid && isEmailValid && areRequiredFieldsValid) {
      onSubmit(patientData);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '12px',
        }
      }}
    >
      <div className="relative">
        <IconButton 
          onClick={onClose}
          className="absolute top-2 right-2"
          size="small"
        >
          <FiX className="w-5 h-5 text-gray-500" />
        </IconButton>

        <DialogTitle className="font-bold text-xl">
          {mode === 'add' ? 'Add New Patient' : 'Update Patient'}
        </DialogTitle>

        <DialogContent className="pb-4">
          <TextField
            label="NIK"
            variant="outlined"
            fullWidth
            value={patientData.nik}
            onChange={(e) => {
              const value = e.target.value;
              // Hanya izinkan angka dan batasi panjang maksimal 16 karakter
              if (/^\d*$/.test(value) && value.length <= 16) {
                handleChange('nik', value);
              }
            }}
            onBlur={validateNIK}
            margin="normal"
            error={!!errors.nik}
            helperText={errors.nik}
            disabled={mode === 'update'} // NIK tidak bisa diubah saat update
          />

          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={patientData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => {
              if (!patientData.name) {
                setErrors(prev => ({ ...prev, name: "Name is required" }));
              } else {
                setErrors(prev => ({ ...prev, name: "" }));
              }
            }}
            margin="normal"
            error={!!errors.name}
            helperText={errors.name}
          />

          <TextField
            label="Place of Birth"
            variant="outlined"
            fullWidth
            value={patientData.place_of_birth}
            onChange={(e) => handleChange('place_of_birth', e.target.value)}
            onBlur={() => {
              if (!patientData.place_of_birth) {
                setErrors(prev => ({ ...prev, place_of_birth: "Place of birth is required" }));
              } else {
                setErrors(prev => ({ ...prev, place_of_birth: "" }));
              }
            }}
            margin="normal"
            error={!!errors.place_of_birth}
            helperText={errors.place_of_birth}
          />

          <TextField
            label="Date of Birth"
            variant="outlined"
            fullWidth
            type="date"
            InputLabelProps={{ shrink: true }}
            value={patientData.date_of_birth}
            onChange={(e) => handleChange('date_of_birth', e.target.value)}
            onBlur={() => {
              if (!patientData.date_of_birth) {
                setErrors(prev => ({ ...prev, date_of_birth: "Date of birth is required" }));
              } else {
                setErrors(prev => ({ ...prev, date_of_birth: "" }));
              }
            }}
            margin="normal"
            error={!!errors.date_of_birth}
            helperText={errors.date_of_birth}
          />

          <TextField
            label="Address"
            variant="outlined"
            fullWidth
            multiline
            rows={2}
            value={patientData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            onBlur={() => {
              if (!patientData.address) {
                setErrors(prev => ({ ...prev, address: "Address is required" }));
              } else {
                setErrors(prev => ({ ...prev, address: "" }));
              }
            }}
            margin="normal"
            error={!!errors.address}
            helperText={errors.address}
          />

          <TextField
            label="Phone Number"
            variant="outlined"
            fullWidth
            value={patientData.number_phone}
            onChange={(e) => {
              const value = e.target.value;
              // Hanya izinkan angka dan batasi panjang maksimal 13 karakter
              if (/^\d*$/.test(value) && value.length <= 13) {
                handleChange('number_phone', value);
              }
            }}
            onBlur={validatePhoneNumber}
            margin="normal"
            error={!!errors.number_phone}
            helperText={errors.number_phone}
          />

          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={patientData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={validateEmail}
            margin="normal"
            error={!!errors.email}
            helperText={errors.email}
          />
        </DialogContent>

        <DialogActions className="p-4 pt-0">
          <Button 
            onClick={onClose} 
            color="secondary"
            variant="outlined"
            className="rounded-md"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            color="primary"
            variant="contained"
            className="rounded-md"
          >
            {mode === 'add' ? 'Save' : 'Update'}
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
};

export default PatientFormDialog;