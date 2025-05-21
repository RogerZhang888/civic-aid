import { ReportStatusTypes } from "../types";

export default function getBadgeClass(status: ReportStatusTypes) {
   switch (status) {
      case "pending":
         return "badge-warning";
      case "resolved":
         return "badge-success";
      case "rejected":
         return "badge-error";
      default:
         return "badge-info";
   }
}