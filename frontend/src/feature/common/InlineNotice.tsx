export default function InlineNotice({ isError, message }: { isError: boolean; message: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className={`text-xs font-bold ${isError ? "text-red-600" : "text-emerald-600"}`}>
      {message}
    </p>
  );
}
