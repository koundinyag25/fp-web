import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "@/organisms/Toaster";

const makeClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

/** Render a component wrapped in React Query + Router providers. */
export const renderWithProviders = (ui: ReactElement, { route = "/" }: { route?: string } = {}) => {
  const client = makeClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>
        <ToastProvider>{children}</ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
  return { client, ...render(ui, { wrapper: Wrapper }) };
};

/** Wrapper for renderHook that need the React Query client. */
export const queryWrapper = () => {
  const client = makeClient();
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return Wrapper;
};
