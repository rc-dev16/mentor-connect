import { useMutation } from "@tanstack/react-query";
import { meetingsApi } from "@/data/api/meetings.api";
import { personalInfoApi } from "@/data/api/personal-info.api";
import { resourcesApi } from "@/data/api/resources.api";
import { sanitizeFilename, triggerDownload } from "@/lib/download";

export function useDownloadMeetingExport() {
  return useMutation({
    mutationFn: async ({ meetingId, meetingTitle }: { meetingId: string; meetingTitle: string }) => {
      const blob = await meetingsApi.downloadMeetingPDF(meetingId);
      const date = new Date().toISOString().split("T")[0];
      triggerDownload(blob, `meeting_notes_${sanitizeFilename(meetingTitle)}_${date}.pdf`);
    },
  });
}

export function useDownloadResource() {
  return useMutation({
    mutationFn: async (resource: {
      id: string;
      title: string;
      file_url?: string;
      mime_type?: string;
    }) => {
      if (!resource.file_url) {
        throw new Error("Missing file URL");
      }

      const blob = await resourcesApi.downloadResourceFile(resource.file_url);
      const extension =
        resource.mime_type === "application/pdf"
          ? "pdf"
          : resource.file_url.split(".").pop() || "doc";

      triggerDownload(blob, `${sanitizeFilename(resource.title)}.${extension}`);
    },
  });
}

export function useDownloadMenteesCsv() {
  return useMutation({
    mutationFn: async () => {
      const blob = await personalInfoApi.downloadMenteesPersonalInfo();
      const date = new Date().toISOString().split("T")[0];
      triggerDownload(blob, `mentees_personal_info_${date}.csv`);
    },
  });
}

export function useDownloadMenteePdf() {
  return useMutation({
    mutationFn: async ({
      menteeId,
      registrationNumber,
    }: {
      menteeId: string;
      registrationNumber?: string;
    }) => {
      const blob = await personalInfoApi.downloadMenteePersonalInfoPDF(menteeId);
      const date = new Date().toISOString().split("T")[0];
      triggerDownload(blob, `mentee_personal_info_${registrationNumber || menteeId}_${date}.pdf`);
    },
  });
}
