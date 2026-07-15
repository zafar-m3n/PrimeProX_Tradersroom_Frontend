import React from "react";
import Table from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import { formatDate } from "@/utils/formatDate";

const AdjustmentHistoryTable = ({ adjustments, currentPage, totalPages, onPageChange }) => {
  const columns = [
    { key: "createdAt", label: "Date" },
    { key: "amount", label: "Amount" },
    { key: "description", label: "Description" },
  ];

  const renderCell = (adjustment, col) => {
    switch (col.key) {
      case "createdAt":
        return formatDate(adjustment.created_at);
      case "amount": {
        const amount = parseFloat(adjustment.amount);
        const isCredit = amount >= 0;
        return (
          <span className={isCredit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
            {isCredit ? "+" : "-"}${Math.abs(amount).toFixed(2)}
          </span>
        );
      }
      case "description":
        return adjustment.description || "N/A";
      default:
        return adjustment[col.key];
    }
  };

  return (
    <>
      <Table
        columns={columns}
        data={adjustments}
        renderCell={renderCell}
        emptyMessage="No balance adjustments found."
        className="mb-4"
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </>
  );
};

export default AdjustmentHistoryTable;
