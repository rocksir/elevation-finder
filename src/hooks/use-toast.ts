export function useToast() {
  function toast(message: string) {
    // placeholder: replace with sonner or your toast implementation
    // eslint-disable-next-line no-console
    console.log("Toast:", message);
  }
  return { toast };
}
