// types/jspdf-autotable.d.ts
import "jspdf";
import type { AutoTable } from "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: AutoTable;
  }
}
