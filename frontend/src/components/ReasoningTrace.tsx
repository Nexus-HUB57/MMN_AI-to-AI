import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

interface ReasoningStep {
  thought: string;
  action?: string;
  observation?: string;
  result?: string;
}

interface ReasoningTraceProps {
  steps: ReasoningStep[];
}

export const ReasoningTrace: React.FC<ReasoningTraceProps> = ({ steps }) => {
  return (
    <Card className="mt-4 border-amber-200 bg-amber-50/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          Reasoning Trace (Transparência Total)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="relative pl-6 border-l-2 border-amber-200 last:border-0 pb-2">
              <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center">
                <span className="text-[10px] font-bold text-amber-600">{index + 1}</span>
              </div>
              <p className="text-sm text-slate-700 italic">"{step.thought}"</p>
              {step.action && (
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase bg-white">Action</Badge>
                  <code className="text-xs text-amber-800">{step.action}</code>
                </div>
              )}
              {step.result && (
                <div className="mt-1 text-xs text-slate-500 bg-white/50 p-2 rounded border border-amber-100">
                  <span className="font-semibold">Result:</span> {step.result}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
