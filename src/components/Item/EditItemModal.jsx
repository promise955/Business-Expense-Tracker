import React, { useState, useTransition,useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import DataService from "@/lib/fetch";
import { toast } from "sonner";
import { NumericFormat } from "react-number-format";

const EditItemModal = ({ updatedItem, onClose }) => {


    const [itemgroups, setItemgroups] = useState([]);
    const [isPending, setTransition] = useTransition();

    const [businesses, setBusiness] = useState([]);

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
  
    const fetchItemGroups = async () => {
      try {
        const response = await DataService.getDataNoAuth(
          `/itemgroup/api?action=getItemGroup`
        );
        setItemgroups(response.itemGroups);
      } catch (error) {
        toast.error(error);
      }
    };
  
    useEffect(() => {
      setTransition(async () => await fetchItemGroups());
    }, []);
  

  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    try {
      if (updatedItem) {
        const response = await DataService.patchDataNoAuth("/item/api",values)
        toast.success(response);
        setSubmitting(false);
        onClose();
      
      } else {

        const response = await DataService.postDataNoAuth("/item/api",values);
        toast.success(response);
        setSubmitting(false);
        onClose();
  
      }
    } catch (error) {
      toast.error(error);
      setSubmitting(false);
    }
  };

  const newItem = {
    itemname: null,
    price: null,
    itemGroupId: null,
    businessId: null
    
  };

  const validationSchema = Yup.object().shape({
    itemname: Yup.string().required("Item name is required"),
    price: Yup.number().required("Price is required")
    .min(1, "Price must be greater than or equal to 0"),
    itemGroupId: Yup.string().required("Item Group is required"),
    businessId: Yup.string().required("Business is required"),

  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 text-gray-800 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-md p-8 w-4/5 max-w-md">
        <h2 className="text-lg font-semibold mb-4">Item</h2>
        <Formik
          initialValues={updatedItem || newItem}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, values, setFieldValue, isSubmitting }) => (
            <Form>
              <div className="mb-4">
                <label
                  htmlFor="itemname"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enter Item Name
                </label>
                <Field
                  type="text"
                  id="itemname"
                  name="itemname"
                  disabled={isSubmitting}
                  className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md h-10 ${
                    errors.itemname && touched.itemname
                      ? "border-red-500"
                      : ""
                  }`}
                />
                <ErrorMessage
                  name="itemname"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enter Item Price
                </label>

                <NumericFormat
                  name={`price`}
                  value={values.price}
                  thousandSeparator={true}
                  disabled={isSubmitting}
                  min={0}
                  prefix={"₦"}
                  onValueChange={(values) => {
                    const { value } = values;
                    setFieldValue("price", value);
                  }}
                  className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md h-10 ${
                    errors.price && touched.price
                      ? "border-red-500"
                      : ""
                  }`}
                />
                <ErrorMessage
                  name="price"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              
              <div className="mb-4">
                <label
                  htmlFor="businessId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Select Business
                </label>
                <Field
                  as="select"
                  name="businessId"
                  value={values.businessId || ""}
                  onChange={(value) => {
                    value.persist();
                    let item = value.target.value;
                    setFieldValue("businessId", item);
                  }}
                  error={touched.businessId && errors.businessId}
                  className={`block w-full mt-1 px-3 py-2 border ${
                    errors.businessId && touched.businessId
                      ? "border-red-500"
                      : "border-gray-300"
                  } bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-10`}
                  disabled={isSubmitting}
                >
                  <option value="" disabled defaultValue hidden></option>
                  {businesses
                    ? businesses.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.businessname}
                        </option>
                      ))
                    : null}
                </Field>

                <ErrorMessage
                  name="businessId"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
    
              <div className="mb-4">
                <label
                  htmlFor="itemgroup"
                  className="block text-sm font-medium text-gray-700"
                >
                  Select Item Group
                </label>
                <Field
                  as="select"
                  name="itemgroup"
               
                  value={values.itemGroupId || ''}
                  onChange={(value) => {
                    value.persist();
                    let item = value.target.value;
                    setFieldValue("itemGroupId", item);
                  }}
                  error={touched.itemgroup && errors.itemgroup}
                  className={`block w-full mt-1 px-3 py-2 border ${
                    errors.itemgroup && touched.itemgroup
                      ? "border-red-500"
                      : "border-gray-300"
                  } bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  disabled={!values.itemname || isSubmitting}
                >
                  <option value="" disabled defaultValue hidden></option>

                  {itemgroups
                    ? 
                    itemgroups.filter((item) => {
                
                      return (
                        item.businessId === values.businessId
                      )
                    })
                    .map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.itemgroupname}
                          </option>
                        ))
                    : null}
                </Field>
          

                {!values.businessId && (
                  <p className="text-red-500 text-sm mt-1">
                    Business must be selected first
                  </p>
                )}
          
                <ErrorMessage
                  name="itemgroup"
                  component="p"
                  className="text-red-500 text-sm mt-1"
                />
              </div>



              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending ? isPending : isSubmitting}
                  className="mr-2 px-4 py-2 text-sm rounded-md bg-gray-300 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                            {isPending ? "Close" : isSubmitting ? "Close" : " Close"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isPending ? isPending : isSubmitting}
                >
               {isPending
                    ? "Please wait.."
                    : isSubmitting
                    ? "submitting .."
                    : " Save"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default EditItemModal;
