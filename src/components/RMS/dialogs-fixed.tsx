import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { ReactNode, useState } from "react"
import { toast } from "react-toastify"

export function AddStudentDialog({children} : {children : ReactNode}) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    guardianName: "",
    guardianPhone: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    // Convert date to ISO-8601 DateTime format
    const dateTime = formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : "";
    
    const payload = {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      roles: ["student"],
      phoneNumber: formData.phoneNumber,
      dateOfBirth: dateTime,
      gender: formData.gender,
      address: formData.address,
      guardianName: formData.guardianName,
      guardianPhone: formData.guardianPhone,
    };
    
    try {
      // @ts-ignore
      const { apiFetch } = await import("@/lib/interceptor");
      const response = await apiFetch("/api/proxy/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      if (response.status === 201) {
        const result = await response.json();
        toast.success(result.message || "Student created successfully");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          dateOfBirth: "",
          gender: "",
          address: "",
          guardianName: "",
          guardianPhone: "",
        });
      } else {
        const result = await response.json();
        toast.error(result.message || "Failed to create student");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

const studentFormFields = [
  { name: "firstName", label: "First Name", type: "text", placeholder: "Enter first name", required: true },
  { name: "lastName", label: "Last Name", type: "text", placeholder: "Enter last name", required: true },
  { name: "email", label: "Email", type: "email", placeholder: "Enter email address", required: true },
  { name: "phoneNumber", label: "Phone Number", type: "tel", placeholder: "Enter phone number", required: true },
  { name: "dateOfBirth", label: "Date of Birth", type: "date", placeholder: "mm/dd/yyyy", required: true },
  { name: "gender", label: "Gender", type: "select", options: [ { value: "Male", label: "Male" }, { value: "Female", label: "Female" } ], placeholder: "Select gender", required: true },
  { name: "address", label: "Address", type: "text", placeholder: "Enter address", required: true },
  { name: "guardianName", label: "Guardian Name", type: "text", placeholder: "Enter guardian's name", required: true },
  { name: "guardianPhone", label: "Guardian Phone", type: "tel", placeholder: "Enter guardian's phone", required: true },
];

  return (
    <Dialog>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="w-[95%] sm:max-w-[500px] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <form onSubmit={handleSubmit}>
          <DialogHeader>
                <p>Add New Student</p>
            <DialogDescription>
                Fill in the details to add a new student
            </DialogDescription>
          </DialogHeader>
    
            <div className="grid grid-cols-1 sm:grid-cols-2 my-[25px] gap-x-[20px] gap-y-[15px]">
    {studentFormFields.map((field: any) => (
    <div key={field.name} className="flex flex-col gap-2">
      <label htmlFor={field.name} className="font-medium text-gray-700 text-[14px]">
        {field.label}
      </label>

      {field.type === "select" ? (
        <select
          name={field.name}
          id={field.name}
          className="border p-2 rounded-[6px]"
          required={field.required}
          value={formData[field.name as keyof typeof formData]}
          onChange={handleInputChange}
        >
          <option value="">{field.placeholder}</option>
          {field.options?.map((opt: any) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={field.type}
          name={field.name}
          id={field.name}
          placeholder={field.placeholder}
          value={formData[field.name as keyof typeof formData]}
          onChange={handleInputChange}
          className="border p-2 rounded-[6px]"
          required={field.required}
        />
      )}
    </div>
  ))}
 </div>
          <DialogFooter className="mt-6">
            <Button type="submit" style={{backgroundColor: '#9747FF'}} className="text-white w-full sm:w-auto" disabled={loading}>
              {loading ? "Adding..." : "Add Student"}
            </Button>
          </DialogFooter>
      </form>
        </DialogContent>
    </Dialog>
  )
}

export function AddTeacherDialog({children} : {children : ReactNode}) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    // Convert date to ISO-8601 DateTime format
    const dateTime = formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : "";
    
    const payload = {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      roles: ["teacher"],
      phoneNumber: formData.phoneNumber,
      dateOfBirth: dateTime,
      gender: formData.gender,
      address: formData.address,
    };
    
    try {
      // @ts-ignore
      const { apiFetch } = await import("@/lib/interceptor");
      const response = await apiFetch("/api/proxy/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      if (response.status === 201) {
        const result = await response.json();
        toast.success(result.message || "Teacher created successfully");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          dateOfBirth: "",
          gender: "",
          address: "",
        });
      } else {
        const result = await response.json();
        toast.error(result.message || "Failed to create teacher");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

const teacherFormFields = [
  { name: "firstName", label: "First Name", type: "text", placeholder: "Enter first name", required: true },
  { name: "lastName", label: "Last Name", type: "text", placeholder: "Enter last name", required: true },
  { name: "email", label: "Email", type: "email", placeholder: "Enter email address", required: true },
  { name: "phoneNumber", label: "Phone Number", type: "tel", placeholder: "Enter phone number", required: true },
  { name: "dateOfBirth", label: "Date of Birth", type: "date", placeholder: "mm/dd/yyyy", required: true },
  { name: "gender", label: "Gender", type: "select", options: [ { value: "Male", label: "Male" }, { value: "Female", label: "Female" } ], placeholder: "Select gender", required: true },
  { name: "address", label: "Address", type: "text", placeholder: "Enter address", required: true },
];

  return (
    <Dialog>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="w-[95%] sm:max-w-[500px] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <form onSubmit={handleSubmit}>
          <DialogHeader>
                <p>Add New Teacher</p>
            <DialogDescription>
                Fill in the details to add a new teacher
            </DialogDescription>
          </DialogHeader>
    
            <div className="grid grid-cols-1 sm:grid-cols-2 my-[25px] gap-x-[20px] gap-y-[15px]">
    {teacherFormFields.map((field: any) => (
    <div key={field.name} className="flex flex-col gap-2">
      <label htmlFor={field.name} className="font-medium text-gray-700 text-[14px]">
        {field.label}
      </label>

      {field.type === "select" ? (
        <select
          name={field.name}
          id={field.name}
          className="border p-2 rounded-[6px]"
          required={field.required}
          value={formData[field.name as keyof typeof formData]}
          onChange={handleInputChange}
        >
          <option value="">{field.placeholder}</option>
          {field.options?.map((opt: any) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={field.type}
          name={field.name}
          id={field.name}
          placeholder={field.placeholder}
          value={formData[field.name as keyof typeof formData]}
          onChange={handleInputChange}
          className="border p-2 rounded-[6px]"
          required={field.required}
        />
      )}
    </div>
  ))}
 </div>
          <DialogFooter className="mt-6">
            <Button type="submit" style={{backgroundColor: '#9747FF'}} className="text-white w-full sm:w-auto" disabled={loading}>
              {loading ? "Adding..." : "Add Teacher"}
            </Button>
          </DialogFooter>
      </form>
        </DialogContent>
    </Dialog>
  )
}

type props = {
    fullName: string,
    dob: string,
    gender: "male" | "female",
    guardianAddress: string,
    class: string,
    guardianContact: string,
    studentId: string,
}



export function StudentDialog({children,props} : {children : ReactNode,props:any}) {
  const [formData, setFormData] = useState(props as object);
    console.log(props)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    // submission will be added here
  };

  const handleDelete = () => {
    console.log("Deleting student:", formData);
    // delete will be added here
  };

const studentFormFields = [
  {
    name: "fullName",
    label: "Full Name",
    type: "text",
    placeholder: "Enter full name",
    required: true,
  },
  {
    name: "dob",
    label: "Date of Birth",
    type: "date",
    placeholder: "mm/dd/yyyy",
    required: true,
  },
  {
    name: "gender",
    label: "Gender",
    type: "select",
    options: [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
    ],
    placeholder: "Select gender",
    required: true,
  },
  {
    name: "guardianAddress",
    label: "Parent/Guardian Address",
    type: "text",
    placeholder: "Enter address",
    required: true,
  },
  {
    name: "class",
    label: "Class",
    type: "text",
    placeholder: "Enter class",
    required: true,
  },
  {
    name: "guardianContact",
    label: "Parent/Guardian Contact",
    type: "tel",
    placeholder: "Enter phone number",
    required: true,
  },
  {
    name: "studentId",
    label: "Student ID (Autogenerated)",
    type: "text",
    placeholder: "S-101",
    disabled: true,
    defaultValue: "S-101",
  },
];

  return (
    <Dialog>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
      <form onSubmit={handleSubmit}>
          <DialogHeader>
                <p>Add New Student</p>
            <DialogDescription>
                Fill in the details to add a new student
            </DialogDescription>
          </DialogHeader>
    
            <div className="grid grid-cols-2 my-[25px] gap-x-[20px]">
    {studentFormFields.map((field) => (
    <div key={field.name} className={`flex flex-col gap-2 my-2 ${field.name == "studentId"? "col-span-2":null } `}>
      <label htmlFor={field.name} className="font-medium text-gray-700 text-[14px]">
        {field.label}
      </label>

      {field.type === "select" ? (
        <select
          name={field.name}
          id={field.name}
          className="border p-2 rounded-[6px]"
          required={field.required}
          value={formData[field.name as keyof typeof formData]}
          onChange={handleInputChange}
        >
          <option value="">{field.placeholder}</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={field.type}
          name={field.name}
          id={field.name}
          placeholder={field.placeholder}
          disabled={field.disabled}
          value={formData[field.name as keyof typeof formData]}
          onChange={handleInputChange}
          className={`border p-2 rounded-[6px] ${
            field.disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
          }`}
          required={field.required}
        
        />
      )}
    </div>
  ))}
 </div>
          <DialogFooter>
            <Button type="button" onClick={handleDelete} className="bg-red-500 w-[40%]">Delete Student</Button>
            <Button type="submit" style={{backgroundColor: '#9747FF'}} className="text-white">Save Changes</Button>
          </DialogFooter>
      </form>
        </DialogContent>
    </Dialog>
  )
}
