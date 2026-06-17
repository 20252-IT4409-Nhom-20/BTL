import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

export default function RouteErrorBoundary() {
  const error = useRouteError();

  let message = 'Something went wrong while loading this page.';

  if (isRouteErrorResponse(error)) {
    message = `${error.status} ${error.statusText}`;
  } else if (error instanceof Error && error.message) {
    message = error.message;
  }

  return (
    <div className="route-error-fallback" role="alert">
      <h2>Something went wrong.</h2>
      <p>{message}</p>
      <button type="button" onClick={() => window.location.reload()}>
        Retry
      </button>
    </div>
  );
}
