"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reduxToolKit/store";
import {
  fetchAssessmentCategoriesMap,
  createAssessmentCategory,
  deleteAssessmentCategory,
} from "@/reduxToolKit/admin/adminThunks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function ManageCategoriesDialog({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { assessmentCategories, loading } = useSelector((state: RootState) => state.admin);

  const [newCategory, setNewCategory] = useState({
    name: "",
    code: "",
    weight: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchAssessmentCategoriesMap());
  }, [dispatch]);

  const handleCreate = async () => {
    if (!newCategory.name || !newCategory.code || !newCategory.weight) {
      toast.error("Please fill in all required fields (Name, Code, Weight)");
      return;
    }

    const weight = Number(newCategory.weight);
    if (isNaN(weight) || weight <= 0 || weight > 100) {
      toast.error("Weight must be a number between 1 and 100");
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        createAssessmentCategory({
          name: newCategory.name,
          code: newCategory.code,
          weight: weight,
          description: newCategory.description,
        })
      ).unwrap();
      toast.success("Category created successfully");
      setNewCategory({ name: "", code: "", weight: "", description: "" });
    } catch (error: any) {
      toast.error(error || "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"? This may affect existing assessments.`)) {
      return;
    }
    try {
      await dispatch(deleteAssessmentCategory(id)).unwrap();
      toast.success("Category deleted");
    } catch (error: any) {
      toast.error(error || "Failed to delete category");
    }
  };

  const totalWeight = assessmentCategories.reduce((sum: number, cat: any) => sum + (cat.weight || 0), 0);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Assessment Categories</DialogTitle>
          <DialogDescription>
            Configure assessment types (e.g., CA1, Exam) and their weights.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Create New Section */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
            <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add New Category
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cat-name">Name *</Label>
                <Input
                  id="cat-name"
                  placeholder="e.g. First CA"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-code">Code *</Label>
                <Input
                  id="cat-code"
                  placeholder="e.g. CA1"
                  value={newCategory.code}
                  onChange={(e) => setNewCategory({ ...newCategory, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-weight">Weight (%) *</Label>
                <Input
                  id="cat-weight"
                  type="number"
                  placeholder="e.g. 20"
                  value={newCategory.weight}
                  onChange={(e) => setNewCategory({ ...newCategory, weight: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-desc">Description</Label>
                <Input
                  id="cat-desc"
                  placeholder="Optional description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                />
              </div>
            </div>
            <Button 
              onClick={handleCreate} 
              disabled={isSubmitting}
              className="w-full bg-[#641BC4] hover:bg-[#5213a4] text-white"
            >
              {isSubmitting ? "Creating..." : "Create Category"}
            </Button>
          </div>

          {/* Existing Categories List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-slate-900">Existing Categories</h3>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${totalWeight === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                Total Weight: {totalWeight}%
              </span>
            </div>

            {loading && assessmentCategories.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-4">Loading categories...</p>
            ) : assessmentCategories.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-sm text-slate-500">No categories found.</p>
                <p className="text-xs text-slate-400">Create one above to get started.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {assessmentCategories.map((cat: any) => (
                  <div 
                    key={cat.id} 
                    className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{cat.name}</span>
                        <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">{cat.code}</span>
                      </div>
                      <p className="text-xs text-slate-500">{cat.description || "No description"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-700">{cat.weight}%</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        onClick={() => handleDelete(cat.id, cat.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {totalWeight !== 100 && (
              <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-xs mt-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>Ideally, the total weight of all categories should equal 100%.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
