import DataService from "@/lib/fetch";
import React, { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import Cookies from "js-cookie";

const BusinessList = ({ setBusinessModal, setBusinessDetails }) => {
  const [isPending, setTransition] = useTransition();
  const [businesses, setBusiness] = useState([]);

  const [selectedValue, setSelectedValue] = useState("");

  const handleChange = (value) => {
    setSelectedValue(value);
    setBusinessDetails(value);
    setBusinessModal(false);
    Cookies.remove("expenseItems");
  };

  const fetchBusiness = async () => {
    try {
      const { businesses } = await DataService.getDataNoAuth(
        "/itemgroup/api?action=getBusinessByRole"
      );
      setBusiness(businesses);
    } catch (error) {
      toast.error(error);
    }
  };

  useEffect(() => {
    setTransition(async () => await fetchBusiness());
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex  text-gray-800 justify-center items-center">
      <div className="bg-white rounded-lg shadow-md p-8 w-4/5 max-w-md">
        <div className="relative inline-block w-full text-gray-700">
          <h3>Select Business</h3>
          <select
            className="w-full h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline focus:border-indigo-500"
            value={selectedValue}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isPending}
          >
            {" "}
            <option value="">
              {" "}
              {isPending ? "Please wait" : "Select A Business"}
            </option>
            {businesses.map((item) => (
              <option value={item.id} key={item.id}>
                {item.businessname}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default BusinessList;
