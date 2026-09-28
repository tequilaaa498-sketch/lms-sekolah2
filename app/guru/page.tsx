   "use client";

   import { useEffect, useState } from "react";

   type Materi = { id: string; judul: string; tipe?: string; url?: string };

   export default function GuruMateri() {
     const [items, setItems] = useState<Materi[]>([]);

     useEffect(() => {
       fetch("/api/materi")
         .then((r) => r.json())
         .then((d) => setItems(Array.isArray(d) ? d : d?.materi ?? []))
         .catch(() => {});
     }, []);

     return (
       <main style={{ padding: 24 }}>
         <h1>Materi Saya</h1>
         <ul>
           {items.map((m) => (
             <li key={m.id}>
               {m.url ? <a href={m.url}>{m.judul}</a> : m.judul}
             </li>
           ))}
         </ul>
         <a href="/guru">Kembali</a>
       </main>
     );
   }