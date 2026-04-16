export const useChapToast = () => {
  const toast = useToast();

  const addToastError = (
    description: string,
    opts: { title?: string; id?: string } = {},
  ) => {
    return toast.add({
      ...(opts.id ? { id: opts.id } : {}),
      title: opts.title ?? "Oups !",
      description,
      color: "error",
      duration: 5000,
    });
  };

  const addToastSuccess = (
    description?: string,
    opts: { title?: string; id?: string; duration?: number } = {},
  ) => {
    return toast.add({
      ...(opts.id ? { id: opts.id } : {}),
      title: opts.title ?? "Opération réussie !",
      description,
      color: "success",
    });
  };

  return {
    addToastError,
    addToastSuccess,
  };
};
