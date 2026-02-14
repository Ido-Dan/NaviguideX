import { useState } from 'react';
import { ArrowLeft, Download, Check, Trash2 } from 'lucide-react';
import naviguideLogoImg from 'figma:asset/b546daea989e4611aa07cf08579f0ce99b12b80a.png';

interface SettingsScreenProps {
  onClose: () => void;
}

interface MapRegion {
  id: string;
  name: string;
  description: string;
  size: string;
  status: 'not-downloaded' | 'downloading' | 'downloaded';
  progress?: number;
}

export function SettingsScreen({ onClose }: SettingsScreenProps) {
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [regions, setRegions] = useState<MapRegion[]>([
    {
      id: 'north',
      name: 'North',
      description: 'Golan, Galilee, Carmel',
      size: '~800 MB',
      status: 'downloaded',
    },
    {
      id: 'center',
      name: 'Center',
      description: 'Sharon, Judean Hills, Tel Aviv area',
      size: '~650 MB',
      status: 'not-downloaded',
    },
    {
      id: 'south',
      name: 'South / Negev',
      description: 'Negev desert, Arava, Eilat',
      size: '~950 MB',
      status: 'not-downloaded',
    },
  ]);

  const handleDownloadRegion = (regionId: string) => {
    setRegions(regions.map(r => 
      r.id === regionId 
        ? { ...r, status: 'downloading' as const, progress: 0 }
        : r
    ));

    // Simulate download progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress >= 100) {
        clearInterval(interval);
        setRegions(prev => prev.map(r => 
          r.id === regionId 
            ? { ...r, status: 'downloaded' as const, progress: 100 }
            : r
        ));
      } else {
        setRegions(prev => prev.map(r => 
          r.id === regionId 
            ? { ...r, progress }
            : r
        ));
      }
    }, 500);
  };

  const handleDeleteRegion = (regionId: string) => {
    setRegions(regions.map(r => 
      r.id === regionId 
        ? { ...r, status: 'not-downloaded' as const, progress: 0 }
        : r
    ));
  };

  return (
    <div className="w-full h-screen bg-[#F5F3EF] overflow-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2B6E2F] to-[#4CAF50] text-white px-4 py-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            aria-label="Back to map"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </div>

      <div className="p-4 space-y-6 pb-8">
        {/* Map Downloads Section */}
        <section className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#2C2C2C] mb-2">Offline Maps</h2>
          <p className="text-sm text-[#7A7267] mb-4">
            Download map regions to use offline during trips
          </p>

          {/* Region List */}
          <div className="space-y-3">
            {regions.map((region) => (
              <RegionCard
                key={region.id}
                region={region}
                onDownload={() => handleDownloadRegion(region.id)}
                onDelete={() => handleDeleteRegion(region.id)}
              />
            ))}
          </div>

          <p className="text-xs text-[#7A7267] mt-4 text-center">
            ⚠️ Download over WiFi recommended
          </p>
        </section>

        {/* Units Section */}
        <section className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#2C2C2C] mb-4">Units</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setUnits('metric')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                units === 'metric'
                  ? 'bg-[#4CAF50] text-white shadow-sm'
                  : 'bg-[#F5F3EF] text-[#7A7267] hover:bg-[#E8E6E2]'
              }`}
            >
              Metric (km)
            </button>
            <button
              onClick={() => setUnits('imperial')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                units === 'imperial'
                  ? 'bg-[#4CAF50] text-white shadow-sm'
                  : 'bg-[#F5F3EF] text-[#7A7267] hover:bg-[#E8E6E2]'
              }`}
            >
              Imperial (miles)
            </button>
          </div>
        </section>

        {/* Map Source Section */}
        <section className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#2C2C2C] mb-2">Map Source</h2>
          <div className="bg-[#F5F3EF] p-4 rounded-lg">
            <p className="text-[#2C2C2C] font-medium">Israel Hiking Map</p>
            <p className="text-xs text-[#7A7267] mt-1">
              High-quality topographic maps of Israel
            </p>
          </div>
        </section>

        {/* About Section */}
        <section className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#2C2C2C] mb-4">About</h2>
          
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img 
              src={naviguideLogoImg} 
              alt="NaviGuide Logo" 
              className="h-16 object-contain"
            />
          </div>

          <div className="space-y-2 text-sm">
            <p className="text-center text-[#7A7267]">
              <strong className="text-[#2C2C2C]">Version:</strong> 1.0.0 (MVP)
            </p>
            <p className="text-center text-[#7A7267] italic">
              Based on the original Naviguide software
            </p>
            <p className="text-center text-[#7A7267]">
              Carrying forward a legacy of offroad navigation
            </p>
            <div className="pt-4 border-t border-[#E0E0E0] mt-4">
              <p className="text-xs text-[#7A7267] text-center">
                Map data: <a href="https://israelhiking.osm.org.il" target="_blank" rel="noopener noreferrer" className="text-[#4CAF50] underline">Israel Hiking Map</a>
              </p>
              <p className="text-xs text-[#7A7267] text-center mt-1">
                <button className="text-[#4CAF50] underline">Open Source Licenses</button>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

interface RegionCardProps {
  region: MapRegion;
  onDownload: () => void;
  onDelete: () => void;
}

function RegionCard({ region, onDownload, onDelete }: RegionCardProps) {
  return (
    <div className="bg-[#F5F3EF] rounded-lg p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-[#2C2C2C] text-[15px]">{region.name}</h3>
          <p className="text-xs text-[#7A7267] mt-0.5">{region.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#7A7267] whitespace-nowrap">{region.size}</span>
          {region.status === 'downloaded' && (
            <div className="w-6 h-6 rounded-full bg-[#4CAF50] flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Status and Actions */}
      {region.status === 'not-downloaded' && (
        <button
          onClick={onDownload}
          className="w-full mt-2 py-2 px-4 bg-[#F57C00] text-white rounded-lg hover:bg-[#E56D00] transition-colors font-semibold text-sm flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      )}

      {region.status === 'downloading' && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs text-[#7A7267] mb-1">
            <span>Downloading...</span>
            <span>{region.progress}%</span>
          </div>
          <div className="w-full h-2 bg-white rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4CAF50] transition-all duration-300"
              style={{ width: `${region.progress}%` }}
            />
          </div>
        </div>
      )}

      {region.status === 'downloaded' && (
        <button
          onClick={onDelete}
          className="w-full mt-2 py-2 px-4 bg-[#E53935]/10 text-[#E53935] rounded-lg hover:bg-[#E53935]/20 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      )}
    </div>
  );
}