export default function ErrorBanner({ erro }) {
  if (!erro) return null;

  return (
    <p className="bg-error-container text-on-error-container font-body-sm text-body-sm text-center py-3 px-gutter border-b border-dashed border-error">
      {erro}
    </p>
  );
}
