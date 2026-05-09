import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/agent")({
  beforeLoad: () => {
    throw redirect({ to: "/profile", replace: true });
  },
  component: () => null,
});
