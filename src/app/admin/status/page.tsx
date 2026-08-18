import { CmsManager, type ResourceConfig } from '../cms-manager';

const incidentConfig: ResourceConfig = {
  resourceKey: 'incidents',
  title: 'Insiden',
  description: 'Kelola insiden untuk halaman Status.',
  labelField: 'title',
  fields: [
    { name: 'title', label: 'Judul', type: 'text', required: true },
    { name: 'status', label: 'Status', type: 'select', options: ['investigating', 'identified', 'monitoring', 'resolved'] },
    { name: 'severity', label: 'Severity', type: 'select', options: ['minor', 'major', 'critical'] },
    { name: 'message', label: 'Pesan', type: 'textarea' },
    { name: 'startedAt', label: 'Mulai', type: 'date' },
    { name: 'resolvedAt', label: 'Selesai', type: 'date' },
  ],
  
};

const maintenanceConfig: ResourceConfig = {
  resourceKey: 'maintenance',
  title: 'Maintenance',
  description: 'Kelola jendela maintenance terjadwal.',
  labelField: 'title',
  fields: [
    { name: 'title', label: 'Judul', type: 'text', required: true },
    { name: 'message', label: 'Pesan', type: 'textarea' },
    { name: 'scheduledStart', label: 'Mulai', type: 'date' },
    { name: 'scheduledEnd', label: 'Selesai', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', options: ['scheduled', 'in_progress', 'completed', 'cancelled'] },
  ],
  
};

const announcementConfig: ResourceConfig = {
  resourceKey: 'announcements',
  title: 'Pengumuman',
  description: 'Pengumuman yang ditampilkan di platform.',
  labelField: 'title',
  fields: [
    { name: 'title', label: 'Judul', type: 'text', required: true },
    { name: 'body', label: 'Isi', type: 'textarea', required: true },
    { name: 'published', label: 'Tampilkan', type: 'checkbox' },
  ],
  
};

export default function AdminStatusPage() {
  return (
    <div className="space-y-10">
      <CmsManager config={incidentConfig} />
      <div className="border-t border-neutral-200 pt-10 dark:border-neutral-800"><CmsManager config={maintenanceConfig} /></div>
      <div className="border-t border-neutral-200 pt-10 dark:border-neutral-800"><CmsManager config={announcementConfig} /></div>
    </div>
  );
}
