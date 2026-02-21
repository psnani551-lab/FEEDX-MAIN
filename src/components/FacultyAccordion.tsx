import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FacultyAccordion({ departments, faculty }) {
  const [openDept, setOpenDept] = useState(null);

  const handleToggle = (deptId) => {
    setOpenDept(openDept === deptId ? null : deptId);
  };

  return (
    <div className="space-y-4">
      {departments.map((dept) => (
        <div key={dept.id}>
          <button
            className="w-full flex items-center justify-between px-4 py-3 bg-card rounded-lg border border-border text-left font-semibold text-lg hover:bg-muted transition"
            onClick={() => handleToggle(dept.id)}
          >
            <span>{dept.name}</span>
            {openDept === dept.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {openDept === dept.id && (
            <div className="mt-2 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {faculty.filter(f => f.department === dept.name).map((f) => (
                <Card key={f.id} className="glass-card border-white/10 hover:border-primary/30 transition-colors">
                  <CardContent className="p-4 text-center">
                    <Avatar className="w-20 h-20 mx-auto mb-3">
                      <AvatarImage src={f.image} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xl">
                        {f.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-foreground">{f.name}</h3>
                    <p className="text-sm text-primary">{f.designation}</p>
                    <div className="mt-2 text-xs text-muted-foreground space-y-1">
                      {f.qualification && <p>{f.qualification}</p>}
                      {f.experience && <p>{f.experience}</p>}
                      {f.specialization && <p className="text-primary">{f.specialization}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
