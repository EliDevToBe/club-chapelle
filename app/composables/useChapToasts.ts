export const useChapToast = () => {
  const toast = useToast();

  const addToastError = (opts: {
    description: string;
    title?: string;
    id?: string;
  }) => {
    return toast.add({
      ...(opts.id ? { id: opts.id } : {}),
      title: opts.title ?? "Oups !",
      description: opts.description,
      color: "error",
      duration: 5000,
    });
  };

  const addToastSuccess = (
    opts: {
      description?: string;
      title?: string;
      id?: string;
      duration?: number;
    } = {},
  ) => {
    return toast.add({
      ...(opts.id ? { id: opts.id } : {}),
      title: opts.title ?? "Opération réussie !",
      description: opts.description,
      color: "success",
      duration: opts.duration ?? 2000,
    });
  };

  const addToastInfo = (opts: {
    description?: string;
    title?: string;
    id?: string;
    duration?: number;
  }) => {
    return toast.add({
      ...(opts.id ? { id: opts.id } : {}),
      title: opts.title ?? "Info",
      description: opts.description,
      color: "info",
      duration: opts.duration ?? 2000,
    });
  };

  return {
    addToastError,
    addToastSuccess,
    addToastInfo,
  };
};
