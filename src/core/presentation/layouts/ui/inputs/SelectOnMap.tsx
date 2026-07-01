import React, { useState, useCallback } from 'react';
import { useLanguage } from '../../../context/i18n/I18nProvider';
import { Button } from '../buttons/Button';
import { Dialog } from '../dialog/Dialog';
import { MapPin } from 'lucide-react';
import Input from './Input';
import { inputBaseClasses } from './styles';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

interface SelectOnMapProps {
  latitude: string;
  longitude: string;
  onChange: (lat: string, lng: string) => void;
  disabled?: boolean;
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 24.7136, // Default to Riyadh, KSA or general center
  lng: 46.6753
};

export function SelectOnMap({ latitude, longitude, onChange, disabled }: SelectOnMapProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [tempLat, setTempLat] = useState(latitude || '');
  const [tempLng, setTempLng] = useState(longitude || '');

  // Load Google Maps script
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const handleConfirm = () => {
    onChange(tempLat, tempLng);
    setIsOpen(false);
  };

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setTempLat(e.latLng.lat().toFixed(6));
      setTempLng(e.latLng.lng().toFixed(6));
    }
  }, []);

  const currentCenter = (tempLat && tempLng) 
    ? { lat: parseFloat(tempLat), lng: parseFloat(tempLng) }
    : defaultCenter;

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex gap-2">
        <Input
          type="text"
          value={latitude}
          onChange={(val) => onChange(val, longitude)}
          disabled={disabled}
          placeholder={t('common.latitude', 'shared') || 'Latitude'}
          baseClasses="text-sm py-1.5"
          className="flex-1"
        />
        <Input
          type="text"
          value={longitude}
          onChange={(val) => onChange(latitude, val)}
          disabled={disabled}
          placeholder={t('common.longitude', 'shared') || 'Longitude'}
          baseClasses="text-sm py-1.5"
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          leftIcon={<MapPin size={16} />}
          onClick={() => setIsOpen(true)}
          disabled={disabled}
        >
          {t('common.select_on_map', 'shared') || 'Select on Map'}
        </Button>
      </div>

      <Dialog 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title={t('common.select_location', 'shared') || 'Select Location'}
      >
        <div className="flex flex-col gap-4 p-4">
          <p className="text-sm text-text-muted mb-4">
            {t('common.click_map_to_select', 'shared') || 'Click on the map to select a location'}
          </p>
          
          <div className="w-full h-100 bg-primary/5 rounded-xl border border-border relative overflow-hidden">
            {!isLoaded ? (
              <div className="flex items-center justify-center h-full text-text-muted">
                {t('common.loading_map', 'shared') || 'Loading Map...'}
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={currentCenter}
                zoom={10}
                onClick={handleMapClick}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false
                }}
              >
                {tempLat && tempLng && (
                  <Marker position={{ lat: parseFloat(tempLat), lng: parseFloat(tempLng) }} />
                )}
              </GoogleMap>
            )}
            
            {tempLat && tempLng && (
              <div className="absolute bottom-4 left-4 bg-surface/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-border text-sm font-mono z-1000 pointer-events-none">
                {t('common.lat', 'shared') || 'Lat'}: {tempLat} <br />
                {t('common.lng', 'shared') || 'Lng'}: {tempLng}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              {t('common.cancel', 'shared') || 'Cancel'}
            </Button>
            <Button variant="primary" onClick={handleConfirm}>
              {t('common.confirm', 'shared') || 'Confirm'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
