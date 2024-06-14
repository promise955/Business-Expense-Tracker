import React, { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import DataService from "@/lib/fetch";

const ExpensePieChart = () => {
  ChartJS.register(ArcElement, Tooltip, Legend);
  const [report, setReport] = useState([]);
  const [isPending, setTransition] = useTransition();

  const getReport = async () => {
    try {
      const {formattedBudgetPieChart} = await DataService.getDataNoAuth(
        `/dashboard/api/?getReport=${true}`
      );

      setReport(formattedBudgetPieChart);
   
    } catch (error) {
      console.log(error);
      toast.error(error);
    }
  };

  useEffect(() => {
    setTransition(async () => await getReport());
  }, []);

 
  const labels = report.map((entry) => entry.budgetCategory);
  const budgets = report.map((entry) => entry.budgetSum);

  const data = {
    labels,
    datasets: [
      {
        type: "pie",
        label: "Expense",
        backgroundColor: [
            "rgba(255, 99, 132, 0.5)",
            "rgba(54, 162, 235, 0.5)",
            "rgba(255, 206, 86, 0.5)",
            "rgba(75, 192, 192, 0.5)",
            "rgba(153, 102, 255, 0.5)",
            "rgba(255, 159, 64, 0.5)",
          ],
          
        data: budgets,
        borderColor: "white",
        borderWidth: 2,
      },
    ],
  };
  return (
    <header className="flex justify-center items-center h-80 mb-4">
      <div className="relative w-full h-full">
        <Pie type="pie" data={data} />
      </div>
     </header>
  );
};

export default ExpensePieChart;
