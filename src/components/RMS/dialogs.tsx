import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { ReactNode, useState, useRef } from "react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/reduxToolKit/store";
import { deleteUser, fetchAllUsers } from "@/reduxToolKit/user/userThunks";

export function AddStudentDialog({ children }: { children: ReactNode }) {
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
    const dateTime = formData.dateOfBirth
      ? new Date(formData.dateOfBirth).toISOString()
      : "";

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
    {
      name: "firstName",
      label: "First Name",
      type: "text",
      placeholder: "Enter first name",
      required: true,
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "text",
      placeholder: "Enter last name",
      required: true,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter email address",
      required: true,
    },
    {
      name: "phoneNumber",
      label: "Phone Number",
      type: "tel",
      placeholder: "Enter phone number",
      required: true,
    },
    {
      name: "dateOfBirth",
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
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" },
      ],
      placeholder: "Select gender",
      required: true,
    },
    {
      name: "address",
      label: "Address",
      type: "text",
      placeholder: "Enter address",
      required: true,
    },
    {
      name: "guardianName",
      label: "Guardian Name",
      type: "text",
      placeholder: "Enter guardian name",
      required: true,
    },
    {
      name: "guardianPhone",
      label: "Guardian Phone",
      type: "tel",
      placeholder: "Enter guardian phone",
      required: true,
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* <Button variant="outline">Open Dialog</Button> */}
        {children}
      </DialogTrigger>
      <DialogContent className="w-[95%] sm:max-w-[500px] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <p className="text-lg font-bold">Add New Student</p>
            <DialogDescription>
              Fill in the details to add a new student
            </DialogDescription>
          </DialogHeader>
          {/* <div className="grid gap-4 grid-cols-2">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Name</Label>
              <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username-1">Username</Label>
              <Input id="username-1" name="username" defaultValue="@peduarte" />
            </div>
          </div> */}

          <div className="grid grid-cols-1 sm:grid-cols-2 my-[25px] gap-x-[20px] gap-y-[15px]">
            {studentFormFields.map((field: any) => (
              <div key={field.name} className="flex flex-col gap-2">
                <label
                  htmlFor={field.name}
                  className="font-medium text-gray-700 text-[14px]"
                >
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
            <Button
              type="submit"
              style={{ backgroundColor: "#9747FF" }}
              className="text-white w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddTeacherDialog({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
    const dateTime = formData.dateOfBirth
      ? new Date(formData.dateOfBirth).toISOString()
      : "";

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
    {
      name: "firstName",
      label: "First Name",
      type: "text",
      placeholder: "Enter first name",
      required: true,
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "text",
      placeholder: "Enter last name",
      required: true,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter email address",
      required: true,
    },
    {
      name: "phoneNumber",
      label: "Phone Number",
      type: "tel",
      placeholder: "Enter phone number",
      required: true,
    },
    {
      name: "dateOfBirth",
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
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" },
      ],
      placeholder: "Select gender",
      required: true,
    },
    {
      name: "address",
      label: "Address",
      type: "text",
      placeholder: "Enter address",
      required: true,
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[95%] sm:max-w-[500px] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <p className="text-lg font-bold">Add New Teacher</p>
            <DialogDescription>
              Fill in the details to add a new teacher
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 my-[25px] gap-x-[20px] gap-y-[15px]">
            {teacherFormFields.map((field: any) => (
              <div key={field.name} className="flex flex-col gap-2">
                <label
                  htmlFor={field.name}
                  className="font-medium text-gray-700 text-[14px]"
                >
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
            <Button
              type="submit"
              style={{ backgroundColor: "#9747FF" }}
              className="text-white w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Teacher"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type props = {
  id?: string;
  email?: string;
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  dob?: string;
  gender?: "male" | "female" | string;
  guardianAddress?: string;
  address?: string;
  class?: string;
  guardianContact?: string;
  guardianPhone?: string;
  phoneNumber?: string;
  studentId?: string;
};

export function StudentDialog({
  children,
  props,
  onStudentDeleted,
}: {
  children: ReactNode;
  props: any;
  onStudentDeleted?: (studentId: string) => void;
}) {
  const [formData, setFormData] = useState<any>({
    db_id: props?.db_id || "",
    id: props?.id || props?.email || "",
    firstName: props?.firstName || props?.name?.split(" ")[0] || "",
    lastName:
      props?.lastName || props?.name?.split(" ").slice(1).join(" ") || "",
    email: props?.email || props?.id || "",
    dateOfBirth: props?.dateOfBirth || props?.dob || "",
    gender: props?.gender || "",
    phoneNumber: props?.phoneNumber || props?.guardianContact || "",
    guardianName: props?.guardianName || "",
    guardianPhone: props?.guardianPhone || "",
    address: props?.address || props?.guardianAddress || "",
  });

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const dialogCloseRef = useRef<HTMLButtonElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // @ts-ignore
      const { apiFetch } = await import("@/lib/interceptor");

      // Prepare payload with proper format
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth
          ? new Date(formData.dateOfBirth).toISOString()
          : "",
        gender: formData.gender,
        address: formData.address,
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone,
      };

      const response = await apiFetch(`/api/proxy/users/${formData.db_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok || response.status === 200) {
        const result = await response.json();
        toast.success(result.message || "Student updated successfully");
        // Close the dialog after successful update
        dialogCloseRef.current?.click();
        // Reload the page to reflect changes
        window.location.reload();
      } else {
        const result = await response.json();
        toast.error(result.message || "Failed to update student");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this student? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const result = await dispatch(deleteUser(formData.db_id)).unwrap();
      
      toast.success(result.message || "Student deleted successfully");
      // Close the dialog after successful deletion
      dialogCloseRef.current?.click();
      // Call the callback if provided
      if (onStudentDeleted) {
        onStudentDeleted(formData.id);
      }
    } catch (err: any) {
      toast.error(err || "Failed to delete student");
    } finally {
      setDeleting(false);
    }
  };

  const studentFormFields = [
    {
      name: "firstName",
      label: "First Name",
      type: "text",
      placeholder: "Enter first name",
      required: true,
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "text",
      placeholder: "Enter last name",
      required: true,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter email address",
      required: true,
    },
    {
      name: "phoneNumber",
      label: "Phone Number",
      type: "tel",
      placeholder: "Enter phone number",
      required: true,
    },
    {
      name: "dateOfBirth",
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
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" },
      ],
      placeholder: "Select gender",
      required: true,
    },
    {
      name: "address",
      label: "Address",
      type: "text",
      placeholder: "Enter address",
      required: true,
    },
    {
      name: "guardianName",
      label: "Guardian Name",
      type: "text",
      placeholder: "Enter guardian name",
      required: true,
    },
    {
      name: "guardianPhone",
      label: "Guardian Phone",
      type: "tel",
      placeholder: "Enter guardian phone",
      required: true,
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[95%] sm:max-w-[500px] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <p className="text-lg font-bold">Edit Student Details</p>
            <DialogDescription>
              Update the student information below
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 my-[25px] gap-x-[20px] gap-y-[15px]">
            {studentFormFields.map((field) => (
              <div
                key={field.name}
                className={`flex flex-col gap-2 ${
                  field.name === "email" ? "col-span-2" : ""
                }`}
              >
                <label
                  htmlFor={field.name}
                  className="font-medium text-gray-700 text-[14px]"
                >
                  {field.label}
                </label>

                {field.type === "select" ? (
                  <select
                    name={field.name}
                    id={field.name}
                    className="border p-2 rounded-[6px]"
                    required={field.required}
                    value={formData[field.name]}
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
                    // disabled={field.disabled}
                    value={formData[field.name] || ""}
                    onChange={handleInputChange}
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <Button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 w-full sm:w-auto"
            >
              {deleting ? "Deleting..." : "Delete Student"}
            </Button>
            <Button
              type="submit"
              style={{ backgroundColor: "#9747FF" }}
              className="text-white w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
          <DialogClose ref={dialogCloseRef} className="hidden" />
        </form>
      </DialogContent>
    </Dialog>
  );
}
