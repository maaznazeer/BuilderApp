import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { useQuery } from 'react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const fetchMilestoneProgress = async () => {
  const { data: projects, error: projectsError } = await supabase.rpc('get_user_project_ids');
  if (projectsError) throw new Error(projectsError.message);
  const projectIds = projects.map(p => p.id);

  if (projectIds.length === 0) return [];

  const { data, error } = await supabase
    .from('milestones')
    .select('title, progress')
    .in('project_id', projectIds)
    .order('due_date', { ascending: true })
    .limit(5);

  if (error) throw new Error(error.message);
  return data;
};

const MilestoneProgressChart = () => {
  const { data, isLoading, isError, error } = useQuery('milestoneProgress', fetchMilestoneProgress);

  const chartData = data?.map((milestone, index) => ({
    name: milestone.title,
    uv: milestone.progress,
    fill: `hsl(${200 + index * 30}, 70%, 50%)`,
  })) || [];

  const renderContent = () => {
    if (isLoading) {
      return <Skeleton className="h-[250px] w-full" />;
    }

    if (isError) {
      return (
        <Alert variant="destructive" className="h-full">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      );
    }
    
    if (!data || data.length === 0) {
        return <div className="text-center text-muted-foreground py-10 h-[250px] flex items-center justify-center">No milestones found.</div>;
    }

    return (
      <ResponsiveContainer width="100%" height={250}>
        <RadialBarChart 
          innerRadius="10%" 
          outerRadius="80%" 
          barSize={10} 
          data={chartData}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar
            minAngle={15}
            background
            clockWise
            dataKey="uv"
          />
          <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
          <Tooltip formatter={(value) => `${value}% Complete`} />
        </RadialBarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="p-6 pb-6">
        <CardTitle>Milestone Progress</CardTitle>
        <CardDescription>Progress of your upcoming milestones.</CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default MilestoneProgressChart;