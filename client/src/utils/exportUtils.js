/**
 * Export data array to CSV file and trigger download
 */
export const exportToCSV = (filename, data, headers) => {
  if (!data || !data.length) {
    alert('No data available to export');
    return;
  }

  // Create header line
  const headerKeys = headers.map((h) => h.key);
  const headerLabels = headers.map((h) => `"${h.label.replace(/"/g, '""')}"`).join(',');

  // Create row lines
  const rows = data.map((item) => {
    return headerKeys
      .map((key) => {
        let val = key.split('.').reduce((obj, i) => (obj ? obj[i] : ''), item);
        if (val === undefined || val === null) val = '';
        if (typeof val === 'string') {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      })
      .join(',');
  });

  const csvContent = [headerLabels, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Trigger clean browser print / save as PDF
 */
export const triggerPrint = () => {
  window.print();
};
