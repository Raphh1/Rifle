import React from "react";

interface TicketCardProps {
  title: string;
  date?: string;
  venue?: string;
  status?: string;
  onView?: () => void;
  onTransfer?: () => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ title, date, venue, status, onView, onTransfer }) => {
  return (
    <div className="bg-white shadow rounded overflow-hidden">
      <img src="/placeholder-event.jpg" alt={title} className="w-full h-40 object-cover" />
      <div className="p-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {date && <p className="text-sm text-gray-500">{date}</p>}
        {venue && <p className="text-sm text-gray-500">{venue}</p>}
        <div className="mt-3 flex gap-3 items-center">
          {status && (
            <span className={`px-2 py-1 text-xs rounded ${status === 'VALID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {status}
            </span>
          )}
          <button onClick={onView} className="border px-2 py-1 text-sm rounded">View</button>
          <button onClick={onTransfer} className="bg-blue-600 text-white px-2 py-1 rounded">Transfer</button>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
