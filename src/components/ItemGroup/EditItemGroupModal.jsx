import React, { useEffect, useState, useTransition } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import DataService from "@/lib/fetch";
import { toast } from "sonner";

const EditItemGroupModal = ({ updatedItem, onClose }) => {
  const [isPending, startTransition] = useTransition();
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
    startTransition(async () => await fetchBusiness());
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true);
    try {
      if (updatedItem) {
        const response = await DataService.patchDataNoAuth(
          "/itemgroup/api",
          values
        );
        toast.success(response);
        setSubmitting(false);
        onClose();
      } else {
        const response = await DataService.postDataNoAuth(
          "/itemgroup/api",
          values
        );
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
    itemgroupname: null,
    businessId: null,
  };

  const validationSchema = Yup.object().shape({
    itemgroupname: Yup.string().required("Item Group name is required"),
    businessId: Yup.string().required("Business is required"),
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 text-gray-800 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-md p-8 w-4/5 max-w-md">
        <h2 className="text-lg font-semibold mb-4">Item Group</h2>
        <Formik
          initialValues={updatedItem || newItem}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, values, setFieldValue, isSubmitting }) => (
            <Form>
              <div className="mb-4">
                <label
                  htmlFor="itemgroupname"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enter Item Group Name
                </label>
                <Field
                  type="text"
                  id="itemgroupname"
                  name="itemgroupname"
                  disabled={isSubmitting}
                  className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-lg border-gray-300 rounded-md h-10 ${
                    errors.itemgroupname && touched.itemgroupname
                      ? "border-red-500"
                      : ""
                  }`}
                />
                <ErrorMessage
                  name="itemgroupname"
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

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="mr-2 px-4 py-2 text-sm rounded-md bg-gray-300 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={isPending ? isPending : isSubmitting}
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

export default EditItemGroupModal;
