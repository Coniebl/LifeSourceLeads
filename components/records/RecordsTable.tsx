import React from "react";

export type RecordStatus = "Pending" | "Accepted" | "Rejected";

export interface RecordData {
  id: string;
  companyName: string;
  country: string;
  industry: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: RecordStatus;
  dateAdded: string;
  website?: string;
  linkedin?: string;
  sourceFile: string;
}

interface RecordsTableProps {
  records: RecordData[];
}

export function RecordsTable({ records }: RecordsTableProps) {
  return (
    <div className="w-full bg-white dark:bg-[#181512] rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.02)] border border-gray-100 dark:border-white/5 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-[#f5eedb]/40 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
              <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Company Name</th>
              <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Country</th>
              <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Industry</th>
              <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Contact Person</th>
              <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Email</th>
              <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Phone</th>
              <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Status</th>
              <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Date Added</th>
              <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Website</th>
              <th className="py-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">LinkedIn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {records.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-sm font-semibold text-gray-400">
                  No records found.
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-6 text-[13px] font-bold text-[#133020] dark:text-white whitespace-nowrap">
                    {record.companyName}
                  </td>
                  <td className="py-4 px-6 text-[13px] font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {record.country}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-[#046241]/10 text-[#046241] dark:bg-[#4ade80]/10 dark:text-[#4ade80]">
                      {record.industry}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[13px] font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {record.contactPerson}
                  </td>
                  <td className="py-4 px-6 text-[13px] font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {record.email}
                  </td>
                  <td className="py-4 px-6 text-[13px] font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {record.phone}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black border ${
                        record.status === "Pending"
                          ? "bg-[#ffb347]/10 text-[#ffb347] border-[#ffb347]/20"
                          : record.status === "Accepted"
                          ? "bg-[#046241]/10 text-[#046241] border-[#046241]/20 dark:bg-[#4ade80]/10 dark:text-[#4ade80] dark:border-[#4ade80]/20"
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          record.status === "Pending"
                            ? "bg-[#ffb347]"
                            : record.status === "Accepted"
                            ? "bg-[#046241] dark:bg-[#4ade80]"
                            : "bg-red-500"
                        }`}
                      />
                      {record.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[13px] font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {record.dateAdded}
                  </td>
                  <td className="py-4 px-6 text-[13px] font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap hover:underline cursor-pointer">
                    {record.website || "-"}
                  </td>
                  <td className="py-4 px-6 text-[13px] font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap hover:underline cursor-pointer">
                    {record.linkedin ? "View Profile" : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
