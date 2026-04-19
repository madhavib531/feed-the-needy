import { createBrowserRouter } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { Donors } from "./pages/Donors";
import { CareInstitutions } from "./pages/CareInstitutions";
import { FoodRequests } from "./pages/FoodRequests";
import { SupplyTracking } from "./pages/SupplyTracking";
import { NeighborSharing } from "./pages/NeighborSharing";
import { PickupPoints } from "./pages/PickupPoints";
import { Volunteers } from "./pages/Volunteers";
import { SmartMatching } from "./pages/SmartMatching";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { DonorPortal } from "./pages/DonorPortal";
import { VolunteerPortal } from "./pages/VolunteerPortal";
import { InstitutionPortal } from "./pages/InstitutionPortal";
import { NgoRedirect } from "./pages/NgoRedirect";
import { NGOs } from "./pages/NGOs";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: () => <ProtectedRoute allowedRoles={['admin']}><Dashboard /></ProtectedRoute> },
      { path: "donors", Component: () => <ProtectedRoute allowedRoles={['admin']}><Donors /></ProtectedRoute> },
      { path: "care-institutions", Component: () => <ProtectedRoute allowedRoles={['admin']}><CareInstitutions /></ProtectedRoute> },
      { path: "ngos", Component: () => <ProtectedRoute allowedRoles={['admin']}><NGOs /></ProtectedRoute> },
      { path: "food-requests", Component: () => <ProtectedRoute allowedRoles={['admin']}><FoodRequests /></ProtectedRoute> },
      { path: "supply-tracking", Component: () => <ProtectedRoute allowedRoles={['admin']}><SupplyTracking /></ProtectedRoute> },
      { path: "neighbor-sharing", Component: () => <ProtectedRoute allowedRoles={['admin']}><NeighborSharing /></ProtectedRoute> },
      { path: "pickup-points", Component: () => <ProtectedRoute allowedRoles={['admin']}><PickupPoints /></ProtectedRoute> },
      { path: "volunteers", Component: () => <ProtectedRoute allowedRoles={['admin']}><Volunteers /></ProtectedRoute> },
      { path: "smart-matching", Component: () => <ProtectedRoute allowedRoles={['admin']}><SmartMatching /></ProtectedRoute> },
    ],
  },
  {
    path: "/donor",
    Component: () => <ProtectedRoute allowedRoles={['donor']}><DonorPortal /></ProtectedRoute>,
  },
  {
    path: "/volunteer",
    Component: () => <ProtectedRoute allowedRoles={['volunteer']}><VolunteerPortal /></ProtectedRoute>,
  },
  {
    path: "/institution",
    Component: () => <ProtectedRoute allowedRoles={['institution']}><InstitutionPortal /></ProtectedRoute>,
  },
  {
    path: "/ngo",
    Component: () => <ProtectedRoute allowedRoles={['ngo']}><NgoRedirect /></ProtectedRoute>,
  },
]);