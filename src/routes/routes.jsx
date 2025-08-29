import { createBrowserRouter, Router, Routes, RouterProvider } from "react-router";
import { FacturaPage } from "../pages/FacturaPage";


const router = createBrowserRouter([
  {
    path: "/",
    element: < FacturaPage/>,
  },
]);

const MyRouter = () =><RouterProvider router={router} />;

export default MyRouter;