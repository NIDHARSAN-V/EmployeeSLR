"use client";

import { useParams } from "next/navigation";

export default function ResolverDetails() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  return <h1>Employee Details for {id}</h1>;
}
``