import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface Activity {
  id: number;
  activity: string;
  location: string;
  date: string;
  color: string;
}

interface StackedActivityCardsProps {
  activities?: Activity[];
}

export const StackedActivityCards: React.FC<StackedActivityCardsProps> = ({ 
  activities = [
    {
      id: 1,
      activity: "New Project Added",
      location: "Web Development",
      date: "2 hours ago",
      color: "#ff7e5f"
    },
    {
      id: 2,
      activity: "Job Alert",
      location: "Software Engineer",
      date: "5 hours ago",
      color: "#0396FF"
    },
    {
      id: 3,
      activity: "Event Reminder",
      location: "Tech Workshop",
      date: "Yesterday",
      color: "#7367F0"
    }
  ]
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="stacked-cards-container">
      <style dangerouslySetInnerHTML={{__html: `
        .stacked-cards-container {
          position: relative;
          max-width: 400px;
          width: 100%;
          margin: 0px auto;
        }
        
        .inner_container {
          position: relative;
          max-width: 400px;
          width: 100%;
          padding: 15px;
          border-radius: 25px;
          box-sizing: border-box;
        }
        
        .park_sec {
          position: relative;
          max-width: 100%;
          width: 100%;
          padding: 15px;
          border: 2px solid hsl(var(--border));
          border-radius: 25px;
          box-sizing: border-box;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 10px;
          transition: all .3s cubic-bezier(.68,-0.55,.27,1.55);
          background: hsl(var(--card));
          box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .park_sec.active {
          transform: unset !important;
          opacity: 1 !important;
        }
        
        .park_sec:not(.active).park_sec1 {
          z-index: 2;
          transform: translateY(200%) scale(0.95);
          opacity: 0.7;
        }
        
        .park_sec:not(.active).park_sec2 {
          z-index: 1;
          transform: translateY(100%) scale(0.9);
          opacity: 0.5;
        }
        
        .park_sec:not(.active).park_sec3 {
          z-index: 0;
          transform: translateY(0px) scale(0.85);
          opacity: 0.3;
        }
        
        .park_inside {
          position: relative;
          display: flex;
        }
        
        .content_sec {
          position: relative;
          margin-left: 10px;
        }
        
        .img {
          position: relative;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .content_sec h2 {
          position: relative;
          margin: 0px;
          font-size: 16px;
          font-weight: 500;
          color: hsl(var(--foreground));
        }
        
        .content_sec span,
        .park_sec span.date {
          position: relative;
          color: hsl(var(--muted-foreground));
          font-size: 14px;
        }
        
        .btn_grp {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 10px;
        }
        
        .btn {
          position: relative;
          padding: 10px 40px 10px 30px;
          background: hsl(var(--card));
          border-radius: 20px;
          border: 2px solid hsl(var(--border));
          box-sizing: border-box;
          box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          color: hsl(var(--foreground));
        }
        
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
          background: hsl(var(--accent) / 0.1);
        }
        
        .btn::after {
          position: absolute;
          content: "";
          border-top: 2px solid hsl(var(--foreground));
          border-left: 2px solid hsl(var(--foreground));
          width: 7px;
          height: 7px;
          right: 23px;
          top: 12px;
          transform: rotate(225deg);
          transition: all .3s linear;
        }
        
        .btn.active::after {
          transform: rotate(45deg);
          top: 17px;
        }
      `}} />
      <div className="inner_container">
        {activities.map((item, index) => (
          <div 
            key={item.id} 
            className={cn(
              "park_sec", 
              `park_sec${index + 1}`,
              isExpanded && "active"
            )}
          >
            <div className="park_inside">
              <span className="img" style={{ backgroundColor: item.color }}></span>
              <div className="content_sec">
                <h2>{item.activity}</h2>
                <span>{item.location}</span>
              </div>
            </div>
            <span className="date">{item.date}</span>
          </div>
        ))}
        <div className="btn_grp">
          <button 
            className={cn("btn", isExpanded && "active")} 
            onClick={toggleExpand}
          >
            {isExpanded ? "Hide" : "Show All"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StackedActivityCards;
