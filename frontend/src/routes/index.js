import { Navigate, useRoutes } from "react-router-dom";

// layouts
import Dashboard from "../layouts/dashboard/Dashboard";

// config
import { DEFAULT_PATH } from "../config";
import GeneralApp from "../pages/dashboard/GeneralApp";
import Page404 from "../pages/Page404";

export default function Router() {
  return useRoutes([
    {
      path: "/",
      element: <Dashboard />,
      children: [
        { element: <Navigate to={DEFAULT_PATH} replace />, index: true },
        { path: "app", element: <GeneralApp /> },
        { path: "404", element: <Page404 /> },
        { path: "*", element: <Navigate to="/404" replace /> },
      ],
    },
    { path: "*", element: <Navigate to="/404" replace /> },
  ]);
}
