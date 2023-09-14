import * as L from 'leaflet';

export class RotatableRectangle extends L.Rectangle {
  private rotationAngle: number = 0;
  private rectangle: L.Rectangle;

  constructor(bounds: L.LatLngBoundsExpression, options?: L.PolylineOptions) {
    super(bounds, options);
    this.rectangle = L.rectangle(bounds, options);
  }

    override addTo(map: L.Map) {
    this.rectangle.addTo(map);
    return this; // Restituisci this invece di void
  }

  setRotationAngle(angle: number) {
    this.rotationAngle = angle;
    this._rotateRectangle();
  }

  private _rotateRectangle() {
    if (this._map) {
      // Calcola il centro del rettangolo
      const bounds = this.rectangle.getBounds();
      const center = bounds.getCenter();

      // Imposta la rotazione in gradi
      const rotationDegrees = this.rotationAngle;

      // Crea un elemento SVG personalizzato
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      svg.appendChild(g);

      // Ruota il rettangolo
      g.setAttribute('transform', `rotate(${rotationDegrees} ${center.lng} ${center.lat})`);

      // Rimuovi il rettangolo dalla mappa
      this.rectangle.removeFrom(this._map);

      // Aggiungi il rettangolo ruotato alla mappa
      this._map.addLayer(this.rectangle);
    }
  }
}
