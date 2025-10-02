import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { JAVA_SERVER_URL } from "@/lib/api/constant";
import { ProjectDraftResponse } from "@/types/projects";

export async function fetchDraftProject() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");

  const { data } = await axios.get<ProjectDraftResponse>(
    `${JAVA_SERVER_URL}/api/my/draft`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return data.data;
}

export function useDraftProject() {
  return useQuery({
    queryKey: ["draftProject"],
    queryFn: fetchDraftProject,
    staleTime: 5 * 60 * 1000, // 5 menit
    retry: 2, // coba ulang 2x kalau gagal
  });
}
