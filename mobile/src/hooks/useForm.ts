import { useState } from "react";

interface UseFormState<T> {
  data: T;
  errors: Record<string, string>;
  isLoading: boolean;
  isSubmitted: boolean;
}

export const useForm = <T extends Record<string, unknown>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void>
) => {
  const [state, setState] = useState<UseFormState<T>>({
    data: initialValues,
    errors: {},
    isLoading: false,
    isSubmitted: false,
  });

  const setFieldValue = <K extends keyof T>(field: K, value: T[K]) => {
    setState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value,
      },
      errors: {
        ...prev.errors,
        [field as string]: "",
      },
    }));
  };

  const handleSubmit = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await onSubmit(state.data);
      setState((prev) => ({
        ...prev,
        isSubmitted: true,
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Une erreur est survenue";

      setState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          form: errorMessage,
        },
        isLoading: false,
      }));
    }
  };

  const resetForm = () => {
    setState({
      data: initialValues,
      errors: {},
      isLoading: false,
      isSubmitted: false,
    });
  };

  return {
    values: state.data,
    errors: state.errors,
    isLoading: state.isLoading,
    isSubmitted: state.isSubmitted,
    setFieldValue,
    handleSubmit,
    resetForm,
  };
};
