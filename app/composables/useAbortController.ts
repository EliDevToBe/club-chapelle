import { useChapToast } from "./useChapToasts";

export const isAbortError = (error: unknown): boolean => {
  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }

  return (
    typeof error === "object" &&
    !!error &&
    "message" in error &&
    (error.message as string).toLowerCase().includes("aborted")
  );
};

export const useAbortUtils = () => {
  const { addToastError } = useChapToast();

  const abortController = ref<AbortController | null>(null);
  const abortSignal = ref<AbortSignal | null>(null);
  // Used to detect stale requests when many requests are made in parallel
  const currentRequestId = ref<number>(0);

  const isAborted = computed(() => {
    return abortSignal.value?.aborted ?? false;
  });

  /**
   * Creates a new abort controller and increments the request id.
   * Use-case: before each request, an abortController is created, thus the request number is incremented.
   *
   * @returns The abort signal.
   */
  const createAbortController = (): AbortSignal => {
    currentRequestId.value++;
    abortController.value = new AbortController();

    return abortController.value.signal;
  };

  /**
   * Aborts the current request and resets the abort controller.
   * Should be used when unMounting a fetching component
   *
   * @param reason The reason for aborting the request.
   */
  const abortIfExists = (reason?: string): void => {
    if (abortController.value) {
      abortController.value.abort(reason);
      abortController.value = null;
    }
  };

  /**
   * Aborts the current request and creates a new abort controller.
   * This is the main flow before a new request is sent.
   *
   * @returns The abort signal.
   */
  const getSignalAndMarker = (
    reason: string = "aborted",
  ): { signal: AbortSignal; requestIdMarker: number } => {
    abortIfExists(reason);
    abortSignal.value = createAbortController();

    // This is the witness to detect stale requests
    const requestIdMarker = currentRequestId.value;

    return { signal: abortSignal.value, requestIdMarker };
  };

  /**
   *This is the main helper function tu unify AbortController usage and logic.
   *
   * @param callback The function to wrap with AbortController logic.
   * **It should always be able to accept an `AbortSignal` as the last argument.**
   * @param args The arguments to pass to the function
   * @returns
   */
  const abortWrapper = async <TArgs extends unknown[], TReturn>(
    callback: (...args: [...TArgs, AbortSignal]) => Promise<TReturn>,
    ...args: TArgs
  ): Promise<TReturn | null> => {
    const { signal, requestIdMarker } = getSignalAndMarker();
    try {
      const data = await callback(...args, signal);
      if (requestIdMarker !== currentRequestId.value || isAborted.value) {
        abortIfExists();
        return null;
      }
      return data;
    } catch (error) {
      if (isAbortError(error)) {
        return null;
      }
      // Stale request has errored, we don't want to display an error
      if (requestIdMarker !== currentRequestId.value) {
        return null;
      }
      addToastError({
        description:
          "Une erreur est survenue lors de la récupération des données",
      });
      return null;
    }
  };

  return {
    createAbortController,
    abortIfExists,
    getSignalAndMarker,
    isAborted,
    currentRequestId,
    abortWrapper,
  };
};
