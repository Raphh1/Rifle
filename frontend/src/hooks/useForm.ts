import { useState } from "react";

interface UseFormState<T> {
  data: T;
  errors: Record<string, string>;
  isLoading: boolean;
  isSubmitted: boolean;
}

/**
 * Hook pour gérer l'état d'un formulaire
 * @param initialValues - Valeurs initiales du formulaire
 * @param onSubmit - Fonction appelée à la soumission
 * @returns state, setFieldValue, handleSubmit
 */
export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void>
) => {
  const [state, setState] = useState<UseFormState<T>>({
    data: initialValues,
    errors: {},
    isLoading: false,
    isSubmitted: false,
  });

  const setFieldValue = (field: keyof T, value: any) => {
    setState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value,
      },
      errors: {
        ...prev.errors,
        [field]: "", // Effacer l'erreur du champ
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
