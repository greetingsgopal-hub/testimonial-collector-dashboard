import { Review } from '../types';

export function exportReviewsToJSON(reviews: Review[]): void {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reviews, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `testimonials-export-${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportReviewsToCSV(reviews: Review[]): void {
  const headers = ['ID', 'Name', 'Email', 'Role', 'Company', 'Rating', 'Status', 'Featured', 'Content', 'Tags', 'Created At'];
  
  const escapeCsv = (str: string | number | undefined | null) => {
    if (str === undefined || str === null) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = reviews.map(r => [
    escapeCsv(r.id),
    escapeCsv(r.name),
    escapeCsv(r.email),
    escapeCsv(r.role),
    escapeCsv(r.company || ''),
    r.rating,
    escapeCsv(r.status),
    r.isFeatured ? 'Yes' : 'No',
    escapeCsv(r.content),
    escapeCsv(r.tags.join('; ')),
    escapeCsv(r.createdAt),
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", encodedUri);
  downloadAnchor.setAttribute("download", `testimonials-export-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
