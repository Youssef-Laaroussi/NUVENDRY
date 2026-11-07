import React from 'react';
import { Link } from 'react-router-dom';
import { Workshop } from '../types';
import { Calendar, Clock, Users, ArrowRight } from 'lucide-react';

interface WorkshopCardProps {
  workshop: Workshop;
}

export const WorkshopCard: React.FC<WorkshopCardProps> = ({ workshop }) => {
  const formattedDate = new Date(workshop.scheduled_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const priceDollars = (workshop.price_cents / 100).toFixed(2);
  const seatsLeft = workshop.remaining_seats;
  const isAvailable = seatsLeft > 0;

  // Category imagery & instructor matching the mock
  const getWorkshopMeta = (category: string) => {
    switch (category) {
      case 'MLOps':
        return {
          imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
          instructorName: 'Sarah El Amrani',
          instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
          badgeText: 'MLOPS',
        };
      case 'React + FastAPI':
        return {
          imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
          instructorName: 'Omar Belkacem',
          instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
          badgeText: 'REACT + FASTAPI',
        };
      case 'LangGraph Agents':
      default:
        return {
          imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
          instructorName: 'Fatima Zahra',
          instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80',
          badgeText: 'LANGGRAPH',
        };
    }
  };

  const meta = getWorkshopMeta(workshop.category);

  return (
    <div className="bg-white rounded-2xl border border-warmgray overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Card Thumbnail with Category Pill & Price */}
        <div className="relative h-44 w-full overflow-hidden bg-charcoal">
          <img
            src={meta.imageUrl}
            alt={workshop.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-black/30" />

          {/* Top category pill & price */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[#205C49] font-mono text-[10px] font-bold tracking-wider uppercase shadow-xs">
              {meta.badgeText}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs font-mono font-bold text-xs text-charcoal shadow-xs">
              ${priceDollars} <span className="text-[10px] font-normal text-charcoal/60">{workshop.currency}</span>
            </span>
          </div>
        </div>

        {/* Card Content Body */}
        <div className="p-5 space-y-3">
          <h3 className="font-semibold text-sm sm:text-base text-charcoal group-hover:text-forest transition-colors leading-snug line-clamp-2">
            {workshop.title}
          </h3>

          {/* Instructor & Level */}
          <div className="flex items-center justify-between text-xs text-charcoal/70 pt-1">
            <div className="flex items-center gap-2">
              <img
                src={meta.instructorAvatar}
                alt={meta.instructorName}
                className="w-6 h-6 rounded-full object-cover border border-warmgray"
              />
              <span className="font-medium text-xs text-charcoal">{meta.instructorName}</span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-ivory text-charcoal/70 text-[11px] font-medium border border-warmgray capitalize">
              {workshop.difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Meta & Reserve Footer */}
      <div className="px-5 pb-5 pt-3 border-t border-warmgray/60 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] text-charcoal/60 font-mono">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-forest" />
            <span>{formattedDate}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-forest" />
            <span>{workshop.duration_hours}h</span>
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-forest" />
            <span>{workshop.total_seats - seatsLeft}/{workshop.total_seats}</span>
          </span>
        </div>

        <Link
          to={`/workshops/${workshop.id}`}
          className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shadow-xs ${
            isAvailable
              ? 'bg-[#205C49] hover:bg-charcoal text-white'
              : 'bg-warmgray text-charcoal/50 cursor-not-allowed pointer-events-none'
          }`}
        >
          <span>Reserve</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

export default WorkshopCard;
