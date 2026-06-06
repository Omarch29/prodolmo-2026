import { ScreenPlaceholder } from "@/components/ui/ScreenPlaceholder";

export default async function JugadorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ScreenPlaceholder
      emoji="👤"
      title="Detalle de jugador"
      note={`Perfil ${id}: KPIs, gráfico de puntos por sección y posición en la tabla.`}
    />
  );
}
