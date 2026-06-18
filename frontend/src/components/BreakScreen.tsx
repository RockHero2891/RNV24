interface BreakScreenProps {
  sectionTitle: string;
  nextSectionTitle: string;
  onContinue: () => void;
  onPause: () => void;
}

export function BreakScreen({ sectionTitle, nextSectionTitle, onContinue, onPause }: BreakScreenProps) {
  return (
    <div className="card mx-auto max-w-2xl p-8 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-brand-600">Pausa entre secciones</p>
      <h2 className="mt-2 text-2xl font-bold text-surface-900">Sección completada: {sectionTitle}</h2>
      <p className="mt-4 text-surface-600">
        Has finalizado esta sección. Puedes tomar un descanso; tu progreso y tiempo restante se conservarán
        dentro de la ventana de 15 horas.
      </p>
      <p className="mt-2 text-sm text-surface-500">Siguiente sección: {nextSectionTitle}</p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" className="btn-secondary" onClick={onPause}>
          Pausar y salir
        </button>
        <button type="button" className="btn-primary" onClick={onContinue}>
          Continuar con la siguiente sección
        </button>
      </div>
    </div>
  );
}
