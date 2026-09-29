import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { BriefcaseBusiness, ChevronRight, ExternalLink, GraduationCap, MapPin, Navigation, Store } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './LocalOpportunityMap.css';

const opportunityStyle = (type = '') => {
  const normalized = String(type).toLowerCase();
  if (normalized.includes('enterprise') || normalized.includes('self')) return { color: '#138a65', label: 'Enterprise', icon: Store };
  if (normalized.includes('training') || normalized.includes('course')) return { color: '#3679c5', label: 'Training', icon: GraduationCap };
  return { color: '#e16b38', label: 'Job', icon: BriefcaseBusiness };
};

const createMarkerIcon = (type, selected) => {
  const { color } = opportunityStyle(type);
  return L.divIcon({
    className: 'opportunity-marker-shell',
    html: `<span class="opportunity-marker${selected ? ' is-selected' : ''}" style="--marker-color:${color}"><span></span></span>`,
    iconSize: [36, 46],
    iconAnchor: [18, 42],
    popupAnchor: [0, -38],
  });
};

const FitMapToOpportunities = ({ opportunities }) => {
  const map = useMap();

  useEffect(() => {
    if (!opportunities.length) return;
    const points = opportunities.map((item) => [item.location.coordinates[1], item.location.coordinates[0]]);
    if (points.length === 1) {
      map.setView(points[0], 12, { animate: false });
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [46, 46], maxZoom: 13, animate: false });
  }, [map, opportunities]);

  return null;
};

const FocusSelectedOpportunity = ({ opportunity }) => {
  const map = useMap();

  useEffect(() => {
    if (!opportunity) return;
    const [longitude, latitude] = opportunity.location.coordinates;
    map.flyTo([latitude, longitude], Math.max(map.getZoom(), 12), { duration: 0.55 });
  }, [map, opportunity]);

  return null;
};

const LocalOpportunityMap = ({ opportunities = [] }) => {
  const [selectedKey, setSelectedKey] = useState('');
  const markerRefs = useRef({});
  const locatedOpportunities = useMemo(
    () => opportunities
      .filter((opportunity) => {
        const coordinates = opportunity?.location?.coordinates;
        if (!Array.isArray(coordinates) || coordinates.length < 2) return false;
        const [longitude, latitude] = coordinates;
        return Number.isFinite(longitude)
          && Number.isFinite(latitude)
          && longitude >= -180 && longitude <= 180
          && latitude >= -90 && latitude <= 90
          && !(longitude === 0 && latitude === 0);
      })
      .map((opportunity, index) => ({
        ...opportunity,
        mapKey: String(opportunity._id || opportunity.id || `${opportunity.title || 'opportunity'}-${index}`),
      })),
    [opportunities],
  );
  const selectedOpportunity = locatedOpportunities.find((item) => item.mapKey === selectedKey) || null;

  useEffect(() => {
    if (selectedKey) markerRefs.current[selectedKey]?.openPopup();
  }, [selectedKey]);

  if (!locatedOpportunities.length) return null;

  const [longitude, latitude] = locatedOpportunities[0].location.coordinates;

  return (
    <section className="opportunity-map-section" aria-label="Nearby livelihood opportunities">
      <header className="opportunity-map-header">
        <div className="opportunity-map-heading">
          <div className="opportunity-map-symbol"><Navigation size={18} /></div>
          <div>
            <p className="opportunity-map-eyebrow">Explore nearby</p>
            <h2>Opportunity map</h2>
          </div>
        </div>
        <div className="opportunity-map-meta">
          <span className="opportunity-count"><MapPin size={14} /> {locatedOpportunities.length} mapped</span>
          <a
            href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=11/${latitude}/${longitude}`}
            target="_blank"
            rel="noreferrer"
            className="opportunity-map-external"
          >
            Open full map <ExternalLink size={14} />
          </a>
        </div>
      </header>

      <div className="opportunity-map-layout">
        <div className="opportunity-map-canvas">
          <div className="opportunity-map-legend" aria-label="Map marker types">
            {[
              { type: 'job' },
              { type: 'training' },
              { type: 'enterprise' },
            ].map(({ type }) => {
              const style = opportunityStyle(type);
              return <span key={type}><i style={{ backgroundColor: style.color }} />{style.label}</span>;
            })}
          </div>
          <MapContainer center={[latitude, longitude]} zoom={11} scrollWheelZoom className="opportunity-leaflet-map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              subdomains="abc"
              maxZoom={20}
            />
            <FitMapToOpportunities opportunities={locatedOpportunities} />
            <FocusSelectedOpportunity opportunity={selectedOpportunity} />
            {locatedOpportunities.map((opportunity) => {
              const [longitudeValue, latitudeValue] = opportunity.location.coordinates;
              const style = opportunityStyle(opportunity.type);
              return (
                <Marker
                  key={opportunity.mapKey}
                  position={[latitudeValue, longitudeValue]}
                  icon={createMarkerIcon(opportunity.type, selectedKey === opportunity.mapKey)}
                  ref={(marker) => { markerRefs.current[opportunity.mapKey] = marker; }}
                  eventHandlers={{ click: () => setSelectedKey(opportunity.mapKey) }}
                >
                  <Popup>
                    <div className="opportunity-popup">
                      <span style={{ color: style.color }}>{style.label}</span>
                      <strong>{opportunity.title || opportunity.name || 'Local opportunity'}</strong>
                      <small>{opportunity.sector || 'Livelihood opportunity'}</small>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
          <div className="opportunity-map-attribution">Map data &copy; OpenStreetMap contributors</div>
        </div>

        <aside className="opportunity-map-list" aria-label="Mapped opportunities">
          <div className="opportunity-list-heading">
            <div>
              <p>LOCAL MATCHES</p>
              <h3>Places to start</h3>
            </div>
            <span>{locatedOpportunities.length}</span>
          </div>
          <div className="opportunity-list-items">
            {locatedOpportunities.map((opportunity) => {
              const style = opportunityStyle(opportunity.type);
              const Icon = style.icon;
              const [longitudeValue, latitudeValue] = opportunity.location.coordinates;
              const active = selectedKey === opportunity.mapKey;
              return (
                <button
                  type="button"
                  key={opportunity.mapKey}
                  onClick={() => setSelectedKey(opportunity.mapKey)}
                  aria-pressed={active}
                  className={`opportunity-list-item${active ? ' is-active' : ''}`}
                >
                  <span className="opportunity-list-icon" style={{ '--item-color': style.color }}><Icon size={17} /></span>
                  <span className="opportunity-list-copy">
                    <span className="opportunity-list-type">{style.label}</span>
                    <strong>{opportunity.title || opportunity.name || 'Local opportunity'}</strong>
                    <small>{opportunity.sector || 'Livelihood opportunity'} · {latitudeValue.toFixed(3)}, {longitudeValue.toFixed(3)}</small>
                  </span>
                  <ChevronRight size={16} className="opportunity-list-arrow" />
                </button>
              );
            })}
          </div>
          <p className="opportunity-list-note">Select a match to locate it on the map.</p>
        </aside>
      </div>
    </section>
  );
};

export default LocalOpportunityMap;