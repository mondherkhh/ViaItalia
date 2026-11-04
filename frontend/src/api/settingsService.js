import axiosInstance from "./axiosInstance";

export async function getSettings() {
  const res = await axiosInstance.get("/settings");
  const d = res.data;
  return d && d.success && d.data ? d.data : (d && d.data ? d.data : {});
}

export async function updateSetting(key, value) {
  return axiosInstance.patch("/settings", { [key]: value }).then(r => r.data);
}

export async function downloadStudentsCsv() {
  const res = await axiosInstance.get("/settings/export-students.csv", { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([res.data], { type: "text/csv; charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "students.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  return res.data;
}
