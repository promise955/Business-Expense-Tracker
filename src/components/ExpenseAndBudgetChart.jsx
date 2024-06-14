import React, { useEffect, useState, useTransition } from "react";
import {toast} from 'sonner'
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import DataService from "@/lib/fetch";


const ExpenseAndBudgetChart = () => {
  ChartJS.register(
    LinearScale,
    CategoryScale,
    BarElement,
    PointElement,
    LineElement,
    Legend,
    Tooltip,
    LineController,
    BarController
  );

 

  const [report, setReport] = useState([]);
  const [isPending,setTransition] =  useTransition()


  
  const  getReport = async () => {
    try {
      const {formattedExpenses} = await DataService.getDataNoAuth(`/dashboard/api/?getReport=${true}`);

      setReport(formattedExpenses);

    } catch (error) {
      console.log(error);
      toast.error(error);
    }
  };

   useEffect(()=> {
      setTransition(async () => await getReport())

  },[])

  const labels = report.map(entry => entry.date);
  const expenses = report.map(entry => entry.expensesSum);
  const budgets = report.map(entry => entry.budgetSum);
  
  const data = {
      labels,
      datasets: [
          {
              type: "bar",
              label: "Expense",
              backgroundColor: "rgb(75, 192, 192)",
              data: expenses,
              borderColor: "white",
              borderWidth: 2,
          },
          {
              type: "bar",
              label: "Budget",
              backgroundColor: "rgb(53, 162, 235)",
              data: budgets,
          },
      ],
  };
  return (
    <header className="flex justify-center items-center h-full ">
  
      <div className="relative w-full h-full">
        <Chart type="bar" data={data} />
    
      </div>
    
    </header>
  );
};

export default ExpenseAndBudgetChart;
