import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/DatePicker";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import {
  employeeLevels,
  employeeRoles,
  employmentStatuses,
  teams,
} from "@/types/common";

async function getSignedUploadUrl(args: { path: string; bucket?: string }) {
  const res = await fetch("/api/storage/signed-upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    throw new Error((await res.json()).error || "Failed to get signed URL");
  }
  return (await res.json()) as {
    signedUrl: string;
    token: string | null;
    publicUrl?: string | null;
    path: string;
    bucket: string;
  };
}

async function uploadViaSignedUrlWithToken(
  bucket: string,
  path: string,
  token: string,
  file: File,
) {
  const { supabase } = await import("@/lib/supabaseClient");
  const { error } = await supabase.storage
    .from(bucket)
    .uploadToSignedUrl(path, token, file);
  if (error) {
    throw error;
  }
}

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email"),
  role: z.enum(employeeRoles, "Role is required"),
  level: z.enum(employeeLevels, "Level is required"),
  status: z.enum(employmentStatuses, "Status is required"),
  team: z.enum(teams, "Team is required"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+?[0-9\s]+$/, "Invalid phone number"),
  location: z.string().min(1, "Location is required"),
  joinDate: z
    .string()
    .min(1, "Join date is required")
    .refine((date) => !isNaN(Date.parse(date)), "Invalid date format"),
  // Optional fields for contract employees
  contractFilePath: z.string().optional(),
  contractStartDate: z.string().optional(),
  contractEndDate: z.string().optional(),
});

export type AddEmployeeFormValues = z.infer<typeof schema>;

interface AddEmployeeFormProps {
  onSubmit: (data: AddEmployeeFormValues) => void;
  onCancel: () => void;
}

export function AddEmployeeForm({ onSubmit, onCancel }: AddEmployeeFormProps) {
  const form = useForm<AddEmployeeFormValues>({
    resolver: zodResolver(schema),
    mode: "onSubmit", // don't show errors until submit
    shouldUnregister: true, // removes fields when unmounted (good for contract fields)
    defaultValues: {
      name: "",
      email: "",
      role: undefined,
      level: undefined,
      status: undefined,
      team: undefined,
      phone: "",
      location: "",
      joinDate: "",
    } as any,
  });

  const status = form.watch("status");
  const [contractFile, setContractFile] = useState<File | null>(null);

  async function uploadContractFileIfNeeded(
    currentStatus: string | undefined,
  ): Promise<string | undefined> {
    if (currentStatus !== "Contract" || !contractFile) return undefined;

    const bucket = "contracts"; // Ensure this bucket exists in Supabase Storage
    const safeName = contractFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `employee-contracts/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}-${safeName}`;

    try {
      // Request signed URL from backend
      const { token, publicUrl } = await getSignedUploadUrl({
        path: filePath,
        bucket,
      });
      if (!token) throw new Error("No token returned for signed upload");

      // Upload using the signed URL token
      await uploadViaSignedUrlWithToken(bucket, filePath, token, contractFile);

      return publicUrl || undefined;
    } catch (err) {
      toast.error("Failed to upload contract file");
      console.error(err);
      return undefined;
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          // Upload to Supabase if contract and a file was selected
          const uploadedUrl = await uploadContractFileIfNeeded(data.status);
          if (uploadedUrl) {
            data.contractFilePath = uploadedUrl;
          }

          onSubmit(data);
          form.reset();
          setContractFile(null);
        })}
        className="space-y-4"
      >
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <FormLabel className="text-left">Name</FormLabel>
              <div className="col-span-3">
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      form.clearErrors("name");
                    }}
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <FormLabel className="text-left">Email</FormLabel>
              <div className="col-span-3">
                <FormControl>
                  <Input
                    type="email"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      form.clearErrors("email");
                    }}
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Role */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <FormLabel className="text-left">Role</FormLabel>
              <div className="col-span-3">
                <Select
                  onValueChange={(val) => {
                    field.onChange(val);
                    form.clearErrors("role");
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {employeeRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Level */}
        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <FormLabel className="text-left">Level</FormLabel>
              <div className="col-span-3">
                <Select
                  onValueChange={(val) => {
                    field.onChange(val);
                    form.clearErrors("level");
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {employeeLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <FormLabel className="text-left">Status</FormLabel>
              <div className="col-span-3">
                <Select
                  onValueChange={(val) => {
                    field.onChange(val);
                    form.clearErrors("status");
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {employmentStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Team */}
        <FormField
          control={form.control}
          name="team"
          render={({ field }) => (
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <FormLabel className="text-left">Team</FormLabel>
              <div className="col-span-3">
                <Select
                  onValueChange={(val) => {
                    field.onChange(val);
                    form.clearErrors("team");
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team} value={team}>
                        {team}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Phone */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <FormLabel className="text-left">Phone</FormLabel>
              <div className="col-span-3">
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      form.clearErrors("phone");
                    }}
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Location */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <FormLabel className="text-left">Location</FormLabel>
              <div className="col-span-3">
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      form.clearErrors("location");
                    }}
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Join Date */}
        <FormField
          control={form.control}
          name="joinDate"
          render={({ field, fieldState }) => (
            <FormItem className="grid grid-cols-4 items-center gap-4">
              <FormLabel className="text-left">Join Date</FormLabel>
              <div className="col-span-3">
                <DatePicker
                  value={field.value}
                  onDateChange={(date) => {
                    field.onChange(date);
                    form.clearErrors("joinDate");
                  }}
                  className={
                    fieldState.error ? "bg-red-200 border-red-500" : ""
                  }
                />
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Contract-only fields */}
        {status === "Contract" && (
          <>
            <Separator className="my-4" />
            <p className="text-lg font-semibold">Contract Details</p>

            {/* Contract Start Date */}
            <FormField
              control={form.control}
              name="contractStartDate"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-left">Start Date</FormLabel>
                  <div className="col-span-3">
                    <DatePicker
                      value={field.value}
                      onDateChange={(date) => {
                        field.onChange(date);
                        form.clearErrors("contractStartDate");
                      }}
                    />
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Contract End Date */}
            <FormField
              control={form.control}
              name="contractEndDate"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-left">End Date</FormLabel>
                  <div className="col-span-3">
                    <DatePicker
                      value={field.value}
                      onDateChange={(date) => {
                        field.onChange(date);
                        form.clearErrors("contractEndDate");
                      }}
                    />
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Contract File */}
            <FormField
              control={form.control}
              name="contractFilePath"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-left">Contract File</FormLabel>
                  <div className="col-span-3">
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setContractFile(file);
                          field.onChange(file ? file.name : "");
                          form.clearErrors("contractFilePath");
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Add Resource</Button>
        </div>
      </form>
    </Form>
  );
}
