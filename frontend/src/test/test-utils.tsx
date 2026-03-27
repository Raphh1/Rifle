/* eslint-disable react-refresh/only-export-components */
import React, { type ReactElement } from "react";
import { render as rtlRender, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthContext } from "../context/AuthContextValue";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

function AllTheProviders({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthContext.Provider
          value={{
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
            login: async () => {},
            register: async () => {},
            logout: () => {},
          }}
        >
          {children}
        </AuthContext.Provider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export function render(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return rtlRender(ui, { wrapper: AllTheProviders, ...options });
}

export { screen, within, fireEvent } from "@testing-library/react";
