import React from "react";
import Sidebar from "../core/layout/Sidebar/Sidebar";
import Header from "../core/layout/Header/Header";
import { menuTemucoSoft } from "./config/menu";

export default function TemucoSoftLayout({ children, title }) {
  return (
    <div
      className="layout"
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      {/* Sidebar con el menú de TemucoSoft */}
      <Sidebar
        menuItems={menuTemucoSoft}
        basePath="/ts"
        userRole="super-admin"
        companyName="TemucoSoft" // <--- Aquí defines el nombre fijo
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* AQUÍ ESTÁ LA CLAVE: Le decimos al Header que somos Super Admin */}
        <Header title={title} userRole="super-admin" />

        <main
          className="content"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0",
            backgroundColor: "#f8fafc",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
