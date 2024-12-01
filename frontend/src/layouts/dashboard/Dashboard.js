import React from "react";
import { Outlet } from "react-router-dom";
import { Stack } from "@mui/material";
import Sidebar from "./Sidebar";

const Dashboard = () => {

  return (
    <Stack direction="row">
      {/* Sidebar */}
      <Sidebar /> 
      <Outlet />
    </Stack>
  );
};

export default Dashboard;
