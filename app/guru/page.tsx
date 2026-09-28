"use client";

import { useEffect, useState } from "react";

export default function GuruDashboard() {
  const [nama, setNama] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setNama(d?.data?.nama ?? ""))
      .catch(() => {});
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard Guru</h1>
      <p>Selamat datang{nama ? `, ${nama}` : ""}.</p>
      <ul>
        <li><a href="/guru/materi">Materi</a></li>
      </ul>
    </main>
  );
}
